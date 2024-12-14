import { Box, Paper, Grid } from '@mui/material'
import CommandPalette from './components/CommandPalette'
import Terminal from './components/Terminal'
import CommandTopBar from './components/CommandTopBar'
import { useState } from 'react'

export default function CommandCenter() {
  const [terminalOutput, setTerminalOutput] = useState([])

  const calculateModbusCRC = (hexString) => {
    // Remove spaces and XX placeholders
    const cleanHex = hexString.replace(/\s+/g, '').replace(/XX/g, '');
    
    // Convert hex string to byte array
    const bytes = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes.push(parseInt(cleanHex.substr(i, 2), 16));
    }
    
    let crc = 0xFFFF;
    for (let pos = 0; pos < bytes.length; pos++) {
      crc ^= bytes[pos];
      for (let i = 8; i !== 0; i--) {
        if ((crc & 0x0001) !== 0) {
          crc >>= 1;
          crc ^= 0xA001;
        } else {
          crc >>= 1;
        }
      }
    }
    
    // Convert CRC to two bytes in hex
    const crcLow = (crc & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const crcHigh = ((crc >> 8) & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    
    return `${crcLow} ${crcHigh}`;
  }

  const hexStringToBuffer = (hexString) => {
    // Remove spaces and convert to uppercase
    const cleanHex = hexString.replace(/\s+/g, '').toUpperCase();
    
    // Create byte array
    const bytes = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes.push(parseInt(cleanHex.substr(i, 2), 16));
    }
    
    return bytes;
  }

  const handleCommand = async (command) => {
    try {
      // Log original command
      console.log('Original command:', command);

      // Replace XX XX with calculated CRC
      const commandWithoutCRC = command.slice(0, -5).trim();  // Remove "XX XX"
      console.log('Command without CRC:', commandWithoutCRC);

      const crc = calculateModbusCRC(commandWithoutCRC);
      console.log('Calculated CRC:', crc);

      const fullCommand = `${commandWithoutCRC} ${crc}`;
      console.log('Full command:', fullCommand);

      // Convert command to byte array before sending
      const commandBytes = hexStringToBuffer(fullCommand);
      console.log('Command bytes:', commandBytes);

      // Add command to terminal output
      const timestamp = new Date()
      setTerminalOutput(prev => [...prev, 
        { 
          type: 'command',
          content: fullCommand,
          timestamp
        }
      ])

      // Send the command bytes to the PSU through IPC
      const response = await window.electron.ipcRenderer.invoke('psu:sendCommand', commandBytes)
      console.log('PSU Response:', response);
      
      if (response.success) {
        setTerminalOutput(prev => [...prev, {
          type: 'response',
          content: `Response: ${response.hex || 'No data'}`,
          timestamp: new Date(),
          details: response.raw ? {
            hex: response.hex,
            crc: response.crc
          } : null
        }])
      } else {
        setTerminalOutput(prev => [...prev, {
          type: 'error',
          content: `Error: ${response.error}`,
          timestamp: new Date(),
          details: response.details || 'No additional details'
        }])
      }
    } catch (error) {
      console.error('Command error:', error);
      setTerminalOutput(prev => [...prev, {
        type: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      }])
    }
  }

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100vh',
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      bgcolor: 'background.default'
    }}>
      <CommandTopBar />
      
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        p: 2,
        gap: 2,
        overflow: 'hidden'
      }}>
        <Paper sx={{ 
          flex: 1,
          p: 2,
          overflow: 'hidden',
          display: 'flex'
        }}>
          <CommandPalette onCommand={handleCommand} />
        </Paper>

        <Paper sx={{ 
          flex: 1,
          p: 2,
          overflow: 'hidden',
          display: 'flex'
        }}>
          <Terminal output={terminalOutput} />
        </Paper>
      </Box>
    </Box>
  )
}