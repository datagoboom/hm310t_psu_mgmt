
const { SerialPort } = require('serialport');
const { Buffer } = require('buffer');

export class PowerSupplyStatus {
  constructor({ voltage, current, power, outputEnabled, protectionStatus }) {
    this.voltage = voltage;
    this.current = current;
    this.power = power;
    this.outputEnabled = outputEnabled;
    this.protectionStatus = protectionStatus;
  }
}

export class PowerSupplyController {
  constructor() {
    this.port = null;
    this.connected = false;
    this.lastError = null;
    this.slaveAddress = 1; 
    this.debug = false;
    this.lastResponse = null;
  }

  setDebug(enabled) {
    this.debug = enabled;
  }

  logBuffer(prefix, buffer) {
    if (!this.debug) return;
    const hex = Array.from(buffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ');
    console.log(`${prefix}: ${hex}`);
  }

  calculateCRC(data) {
    let crc = 0xFFFF;
    for (const byte of data) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) {
        if (crc & 0x0001) {
          crc = (crc >> 1) ^ 0xA001;
        } else {
          crc >>= 1;
        }
      }
    }
    return crc;
  }

  createModbusFrame(functionCode, address, data) {
    let length = 4; 
    if (functionCode === 0x03) {
      length += 4; 
    } else if (functionCode === 0x06) {
      length += 4; 
    }

    const frame = Buffer.alloc(length);
    let offset = 0;

    frame.writeUInt8(this.slaveAddress, offset++);
    frame.writeUInt8(functionCode, offset++);
    
    if (functionCode === 0x03) {
      frame.writeUInt16BE(address, offset);
      offset += 2;
      frame.writeUInt16BE(data, offset);
      offset += 2;
    } else if (functionCode === 0x06) {
      frame.writeUInt16BE(address, offset);
      offset += 2;
      frame.writeUInt16BE(data, offset);
      offset += 2;
    }

    const crc = this.calculateCRC(frame.slice(0, offset));
    frame.writeUInt16LE(crc, offset);

    if (this.debug) {
      this.logBuffer('TX', frame);
    }

    return frame;
  }

  async connect(portPath) {
    if (this.connected) {
      return { success: false, error: 'Already connected' };
    }

    try {
      this.port = new SerialPort({
        path: portPath,
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        autoOpen: false
      });

      return new Promise((resolve, reject) => {
        this.port.open((err) => {
          if (err) {
            this.port = null;
            reject({ success: false, error: err.message });
          } else {
            this.connected = true;
            this.port.on('error', (error) => {
              console.error('Serial port error:', error);
              this.lastError = error;
            });
            resolve({ success: true });
          }
        });
      });
    } catch (error) {
      this.port = null;
      return { success: false, error: error.message };
    }
  }

  async sendModbusCommand(frame) {
    if (!this.port || !this.connected) {
      return { success: false, error: 'Not connected to PSU' };
    }

    return new Promise((resolve, reject) => {
      
      setTimeout(() => {
        this.port.write(frame, (writeErr) => {
          if (writeErr) {
            reject({ success: false, error: writeErr.message });
            return;
          }

          const handleResponse = (data) => {
            if (this.debug) {
              this.logBuffer('RX', data);
            }
            this.lastResponse = data;

            
            const receivedCrc = data.readUInt16LE(data.length - 2);
            const calculatedCrc = this.calculateCRC(data.slice(0, -2));
            
            if (receivedCrc !== calculatedCrc) {
              reject({ success: false, error: 'CRC check failed' });
              return;
            }

            resolve({ success: true, data: data });
          };

          const timeout = setTimeout(() => {
            this.port.removeListener('data', handleResponse);
            reject({ success: false, error: 'Response timeout' });
          }, 1000);

          this.port.once('data', (data) => {
            clearTimeout(timeout);
            handleResponse(data);
          });
        });
      }, 4);
    });
  }

  async readRegister(address, count = 1) {
    if (!this.connected) {
      return { success: false, error: 'Not connected to PSU' };
    }

    try {
      const frame = this.createModbusFrame(0x03, address, count);
      const response = await this.sendModbusCommand(frame);
      if (!response.success) {
        throw new Error(response.error);
      }

      const values = [];
      for (let i = 0; i < count; i++) {
        values.push(response.data.readUInt16BE(3 + (i * 2)));
      }

      return { success: true, values };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async writeRegister(address, value) {
    if (!this.connected) {
      return { success: false, error: 'Not connected to PSU' };
    }

    try {
      const frame = this.createModbusFrame(0x06, address, value);
      const response = await this.sendModbusCommand(frame);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getStatus() {
    if (!this.connected) {
      return { success: false, error: 'Not connected to PSU' };
    }

    try {
      
      const outputResponse = await this.readRegister(0x0001);
      if (!outputResponse.success) throw new Error(outputResponse.error);
      const outputEnabled = outputResponse.values[0] === 1;

      
      const protectionResponse = await this.readRegister(0x0002);
      if (!protectionResponse.success) throw new Error(protectionResponse.error);
      const protectionValue = protectionResponse.values[0];
      const protectionStatus = {
        OVP: !!(protectionValue & 0x01),
        OCP: !!(protectionValue & 0x02),
        OPP: !!(protectionValue & 0x04),
        OTP: !!(protectionValue & 0x08),
        SCP: !!(protectionValue & 0x10)
      };

      
      const voltageResponse = await this.readRegister(0x0010);
      if (!voltageResponse.success) throw new Error(voltageResponse.error);
      const voltage = voltageResponse.values[0] / 100.0;

      
      const currentResponse = await this.readRegister(0x0011);
      if (!currentResponse.success) throw new Error(currentResponse.error);
      const current = currentResponse.values[0] / 1000.0;

      
      const powerResponse = await this.readRegister(0x0012, 2);
      if (!powerResponse.success) throw new Error(powerResponse.error);
      const powerHigh = powerResponse.values[0];
      const powerLow = powerResponse.values[1];
      const power = ((powerHigh << 16) | powerLow) / 1000.0;

      return {
        success: true,
        voltage,
        current,
        power,
        outputEnabled,
        protectionStatus
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async setVoltage(voltage) {
    if (!this.connected) {
      return { success: false, error: 'Not connected to PSU' };
    }

    try {
      const value = Math.round(voltage * 100);
      return await this.writeRegister(0x0030, value);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async setCurrent(current) {
    if (!this.connected) {
      return { success: false, error: 'Not connected to PSU' };
    }

    try {
      const value = Math.round(current * 1000);
      return await this.writeRegister(0x0031, value);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async setOutput(enabled) {
    if (!this.connected) {
      return { success: false, error: 'Not connected to PSU' };
    }

    try {
      return await this.writeRegister(0x0001, enabled ? 1 : 0);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async disconnect() {
    return new Promise((resolve) => {
      if (!this.port) {
        this.connected = false;
        resolve({ success: true });
        return;
      }

      this.port.close((err) => {
        if (err) {
          console.error('Error closing port:', err);
          resolve({ success: false, error: err.message });
        } else {
          this.connected = false;
          this.port = null;
          resolve({ success: true });
        }
      });
    });
  }

  async debugRegisters(startAddress = 0x0001, count = 5) {
    if (!this.connected) {
      return { success: false, error: 'Not connected to PSU' };
    }

    try {
      const results = [];
      for (let i = 0; i < count; i++) {
        const address = startAddress + i;
        const response = await this.readRegister(address);
        if (response.success) {
          results.push({
            address: `0x${address.toString(16).padStart(4, '0')}`,
            value: `0x${response.values[0].toString(16).padStart(4, '0')}`,
            decimal: response.values[0]
          });
        }
      }
      return { success: true, registers: results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getPsuStatus(port) {
    try {
      const status = {
        voltage: await port.readVoltage(),
        current: await port.readCurrent(),
        temperature: await port.readTemperature(),
        mode: await port.getMode(),
        outputEnabled: await port.getOutputState(),
        protectionStatus: await port.getProtectionStatus(),
        regulationMode: await port.getRegulationMode()
      };

      
      status.power = status.voltage * status.current;

      return { success: true, ...status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}