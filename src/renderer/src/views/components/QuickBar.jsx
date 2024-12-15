


import { Box, IconButton, TextField, Tooltip, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew'
import { useState } from 'react'
import { useApi } from '../contexts/ApiContext'

export default function QuickBar({ children }) {
  const { 
    isConnected, 
    selectedPort,
    availablePorts,
    handlePortChange,
    setOutput, 
    writeRegister 
  } = useApi()
  
  const [voltage, setVoltage] = useState('')
  const [current, setCurrent] = useState('')
  const [outputEnabled, setOutputEnabled] = useState(false)

  const handlePowerToggle = async () => {
    if (!isConnected) return
    const newState = !outputEnabled
    const result = await setOutput(newState)
    if (result.success) {
      setOutputEnabled(newState)
    }
  }

  const handleVoltageSet = async () => {
    if (!isConnected || !voltage) return
    const value = Math.round(parseFloat(voltage) * 100)
    await writeRegister(0x30, value)
  }

  const handleCurrentSet = async () => {
    if (!isConnected || !current) return
    const value = Math.round(parseFloat(current) * 1000)
    await writeRegister(0x31, value)
  }

  return (
    <Box sx={{ 
      p: 1, 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2,
      borderBottom: 1,
      borderColor: 'divider'
    }}>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="port-select-label">Serial Port</InputLabel>
          <Select
            labelId="port-select-label"
            id="port-select"
            value={selectedPort}
            label="Serial Port"
            onChange={handlePortChange}
            size="small"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {availablePorts.map((port) => (
              <MenuItem key={port.path} value={port.path}>
                {port.path} - {port.manufacturer || 'Unknown'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {children}
      </Box>

      
      <Box sx={{ flex: 1 }} />

    </Box>
  )
}