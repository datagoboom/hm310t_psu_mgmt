import { Box, Paper } from '@mui/material'
import CommandPalette from './components/CommandPalette'
import Terminal from './components/Terminal'
import CommandTopBar from './components/CommandTopBar'
import { useHistory } from './contexts/HistoryContext'

export default function CommandCenter() {
  const { terminalHistory, addTerminalEntry } = useHistory();

  const calculateModbusCRC = (hexString) => {
    
    const cleanHex = hexString.replace(/\s+/g, '').replace(/XX/g, '');
    
    
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
    
    
    const crcLow = (crc & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const crcHigh = ((crc >> 8) & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    
    return `${crcLow} ${crcHigh}`;
  }

  const hexStringToBuffer = (hexString) => {
    
    const cleanHex = hexString.replace(/\s+/g, '').toUpperCase();
    
    
    const bytes = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes.push(parseInt(cleanHex.substr(i, 2), 16));
    }
    
    return bytes;
  }

  const handleCommand = async (command) => {
    try {
      
      console.log('Original command:', command);

      
      const commandWithoutCRC = command.slice(0, -5).trim();  
      console.log('Command without CRC:', commandWithoutCRC);

      const crc = calculateModbusCRC(commandWithoutCRC);
      console.log('Calculated CRC:', crc);

      const fullCommand = `${commandWithoutCRC} ${crc}`;
      console.log('Full command:', fullCommand);

      
      const commandBytes = hexStringToBuffer(fullCommand);
      console.log('Command bytes:', commandBytes);

      
      addTerminalEntry({ 
        type: 'command',
        content: fullCommand
      });

      
      const response = await window.electron.ipcRenderer.invoke('psu:sendCommand', commandBytes)
      console.log('PSU Response:', response);
      
      if (response.success) {
        addTerminalEntry({
          type: 'response',
          content: `Response: ${response.hex || 'No data'}`,
          details: response.raw ? {
            hex: response.hex,
            crc: response.crc
          } : null
        });
      } else {
        addTerminalEntry({
          type: 'error',
          content: `Error: ${response.error}`,
          details: response.details || 'No additional details'
        });
      }
    } catch (error) {
      console.error('Command error:', error);
      addTerminalEntry({
        type: 'error',
        content: `Error: ${error.message}`
      });
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
          <Terminal output={terminalHistory} />
        </Paper>
      </Box>
    </Box>
  )
}