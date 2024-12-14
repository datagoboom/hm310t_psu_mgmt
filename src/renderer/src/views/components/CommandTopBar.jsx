import { Box, IconButton, FormControl, Select, MenuItem, Tooltip } from '@mui/material'
import LinkIcon from '@mui/icons-material/Link'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import { useApi } from '../contexts/ApiContext'

export default function CommandTopBar() {
  const { 
    isConnected, 
    connect, 
    disconnect,
    selectedPort,
    handlePortChange,
    availablePorts
  } = useApi()

  const handleConnection = async () => {
    if (isConnected) {
      await disconnect()
    } else if (selectedPort) {
      await connect(selectedPort)
    }
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      alignItems: 'center',
      p: 1,
      backgroundColor: 'background.paper',
      borderRadius: 1
    }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={selectedPort}
          onChange={handlePortChange}
          displayEmpty
          variant="outlined"
        >
          <MenuItem value="">
            <em>Select Port</em>
          </MenuItem>
          {availablePorts.map(port => (
            <MenuItem key={port.path} value={port.path}>
              {port.path}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1 
      }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: isConnected ? 'success.main' : 'error.main',
            transition: 'background-color 0.3s'
          }}
        />
        <Tooltip title={isConnected ? "Disconnect" : "Connect"}>
          <span>
            <IconButton
              onClick={handleConnection}
              disabled={!selectedPort}
              sx={{ 
                borderRadius: '50%',
                '&.Mui-disabled': {
                  color: 'action.disabled'
                }
              }}
            >
              {!isConnected ? <LinkIcon /> : <LinkOffIcon />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  )
} 