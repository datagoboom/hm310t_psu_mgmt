const { ipcMain } = require('electron')
const { SerialPort } = require('serialport')
import { storeMeasurement, getRecentMeasurements } from './database'

let psuInstance = null

export function setupIPCHandlers(psu) {
  // Store the PSU instance
  psuInstance = psu

  // Add the isConnected handler
  ipcMain.handle('psu:isConnected', () => {
    return {
      success: true,
      connected: !!(psuInstance && psuInstance.port && psuInstance.port.isOpen)
    }
  })

  ipcMain.handle('getPorts', async () => {
    try {
      const ports = await SerialPort.list()
      return ports
    } catch (error) {
      console.error('Error listing ports:', error)
      throw error
    }
  })

  // Store current PSU state in database
  async function logPsuState(psu) {
    const status = await psu.getStatus()
    if (status.success) {
      await storeMeasurement(status.voltage, status.current)
    }
    return status
  }

  // Get historical data
  ipcMain.handle('psu:getHistory', async (event, minutes) => {
    try {
      const measurements = await getRecentMeasurements(minutes)
      return { success: true, data: measurements }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // Add this to your existing IPC handlers
  ipcMain.handle('psu:sendCommand', async (event, command) => {
    try {
      if (!psuInstance?.connected) {
        return {
          success: false,
          error: 'PSU not connected. Please connect to a device first.'
        }
      }

      return await psuInstance.sendModbusCommand(command)
    } catch (error) {
      return {
        success: false,
        error: `Command failed: ${error.message}`
      }
    }
  })

  ipcMain.handle('psu:calculateCRC', async (event, command) => {
    try {
      if (!psuInstance) {
        return {
          success: false,
          error: 'PSU not connected. Please connect to a device first.'
        }
      }

      // Parse the command string into bytes
      const bytes = command
        .trim()
        .split(' ')
        .map(byte => parseInt(byte, 16))
      
      if (bytes.some(isNaN)) {
        return {
          success: false,
          error: 'Invalid hex format in command'
        }
      }
      
      const crc = psuInstance.calculateCRC(Buffer.from(bytes))
      const crcLow = (crc & 0xFF).toString(16).padStart(2, '0').toUpperCase()
      const crcHigh = ((crc >> 8) & 0xFF).toString(16).padStart(2, '0').toUpperCase()
      
      return {
        success: true,
        crc: `${crcLow} ${crcHigh}`
      }
    } catch (error) {
      return {
        success: false,
        error: `CRC calculation failed: ${error.message}`
      }
    }
  })
}

// Optional: Add a cleanup function
export function cleanup() {
  psuInstance = null
}

module.exports = { setupIPCHandlers, cleanup } 