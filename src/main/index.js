import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { PowerSupplyController } from './psu'
const { SerialPort } = require('serialport')

// CRC Utilities
function calculateModbusCRC(buffer) {
  let crc = 0xFFFF;
  
  for (let pos = 0; pos < buffer.length; pos++) {
    crc ^= buffer[pos];
    
    for (let i = 8; i !== 0; i--) {
      if ((crc & 0x0001) !== 0) {
        crc >>= 1;
        crc ^= 0xA001;
      } else {
        crc >>= 1;
      }
    }
  }
  
  // Convert to two bytes
  const crcBytes = Buffer.alloc(2);
  crcBytes[0] = crc & 0xFF;         // Low byte
  crcBytes[1] = (crc >> 8) & 0xFF;  // High byte
  
  return crcBytes;
}

function hexStringToBuffer(hexString) {
  // Remove spaces and convert to uppercase
  const cleanHex = hexString.replace(/\s+/g, '').toUpperCase();
  
  // Create buffer from hex string
  const buffer = Buffer.alloc(cleanHex.length / 2);
  
  for (let i = 0; i < cleanHex.length; i += 2) {
    buffer[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  
  return buffer;
}

function bufferToHexString(buffer) {
  return Array.from(buffer)
    .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

let psu = null
let mainWindow = null

const setupIPCHandlers = () => {
  // Get available serial ports
  ipcMain.handle('psu:getPorts', async () => {
    try {
      const ports = await SerialPort.list()
      // Filter for common serial port patterns
      const commonPorts = ports.filter(port => {
        const path = port.path.toLowerCase()
        return (
          path.includes('tty.usbserial') ||  // Mac OS X
          path.includes('ttyusb') ||         // Linux
          path.includes('ttyacm') ||         // Linux
          path.includes('com')               // Windows
        )
      })
      return { 
        success: true, 
        ports: commonPorts.map(port => ({
          path: port.path,
          manufacturer: port.manufacturer || 'Unknown',
          serialNumber: port.serialNumber || 'Unknown'
        }))
      }
    } catch (error) {
      console.error('Error listing ports:', error)
      return { success: false, error: error.message }
    }
  })

  // Connection management

  ipcMain.handle('psu:isConnected', () => {
    return {
      success: true,
      connected: !!psu
    }
  })

  ipcMain.handle('psu:connect', async (_, port) => {
    try {
      if (!psu) {
        psu = new PowerSupplyController()
      }
      const result = await psu.connect(port)
      console.log('Connection result:', result)  // Debug log
      return result
    } catch (error) {
      console.error('Error connecting:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('psu:disconnect', async () => {
    try {
      if (psu) {
        const result = await psu.disconnect()
        psu = null
        return result
      }
      return { success: true }
    } catch (error) {
      console.error('Error disconnecting:', error)
      return { success: false, error: error.message }
    }
  })

  // PSU Controls
  ipcMain.handle('psu:getStatus', async () => {
    try {
      if (!psu) return { success: false, error: 'PSU not connected' }
      const status = await psu.getStatus()
      return { success: true, data: status }
    } catch (error) {
      console.error('Error getting status:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('psu:setVoltage', async (_, voltage) => {
    try {
      if (!psu) return { success: false, error: 'PSU not connected' }
      return await psu.setVoltage(voltage)
    } catch (error) {
      console.error('Error setting voltage:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('psu:setCurrent', async (_, current) => {
    try {
      if (!psu) return { success: false, error: 'PSU not connected' }
      return await psu.setCurrent(current)
    } catch (error) {
      console.error('Error setting current:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('psu:setOutput', async (_, enabled) => {
    try {
      if (!psu) return { success: false, error: 'PSU not connected' }
      return await psu.setOutput(enabled)
    } catch (error) {
      console.error('Error setting output:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('psu:sendCommand', async (_, command) => {
    try {
      if (!psu) {
        return { 
          success: false, 
          error: 'PSU not connected' 
        }
      }
      
      console.log('Sending command:', command);
      const result = await psu.sendModbusCommand(Buffer.from(command))
      console.log('Command result:', result);
      
      if (result.success && result.data) {
        return {
          success: true,
          hex: bufferToHexString(result.data),
          raw: result.data,
          crc: bufferToHexString(result.data.slice(-2)),
          originalCommand: command
        }
      }
      
      return {
        success: false,
        error: result.error || 'No response data',
        originalCommand: command
      }
    } catch (error) {
      console.error('Detailed error:', error);
      const isTimeout = error.message?.includes('timeout') || 
                       error.error?.includes('timeout');
      return {
        success: false,
        error: isTimeout ? 
          'Device did not respond (timeout). Please check the connection and try again.' : 
          (error.message || 'Unknown error occurred'),
        details: error.toString(),
        originalCommand: command,
        isTimeout
      }
    }
  })
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (is.dev) {
      mainWindow.webContents.openDevTools()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  // Set up IPC handlers before creating the window
  setupIPCHandlers()
  
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Cleanup on quit
app.on('before-quit', async () => {
  if (psu) {
    await psu.disconnect()
    psu = null
  }
})
