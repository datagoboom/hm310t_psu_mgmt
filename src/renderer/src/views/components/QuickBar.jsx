import { Box, IconButton, TextField, Tooltip, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew'
import { useState } from 'react'
import { useApi } from '../contexts/ApiContext'
import { useSettings } from '../contexts/SettingsContext'

export default function QuickBar({ children }) {
  const { 
    isConnected, 
    selectedPort,
    availablePorts,
    handlePortChange,
    setOutput, 
    writeRegister 
  } = useApi()

  const { updateGlobalGraphSettings, globalGraphSettings } = useSettings()
  
  const timeRangeOptions = [
    { value: 10000, label: '10s' },
    { value: 30000, label: '30s' },
    { value: 60000, label: '1m' },
    { value: 300000, label: '5m' },
    { value: 600000, label: '10m' },
    { value: 1800000, label: '30m' },
    { value: 3600000, label: '1h' }
  ]

  const resolutionOptions = [
    { value: 100, label: '100ms' },
    { value: 500, label: '500ms' },
    { value: 1000, label: '1s' }
  ]

  const handleTimeRangeChange = (event) => {
    updateGlobalGraphSettings({ timeRange: event.target.value });
  };

  const handleResolutionChange = (event) => {
    updateGlobalGraphSettings({ resolution: event.target.value });
  };

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

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          borderLeft: 1,
          borderColor: 'divider',
          pl: 2
        }}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="time-range-label">Time Span</InputLabel>
            <Select
              labelId="time-range-label"
              id="time-range-select"
              value={globalGraphSettings?.timeRange || 60000}
              label="Time Span"
              onChange={handleTimeRangeChange}
            >
              {timeRangeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="resolution-label">Resolution</InputLabel>
            <Select
              labelId="resolution-label"
              id="resolution-select"
              value={globalGraphSettings?.resolution || 1000}
              label="Resolution"
              onChange={handleResolutionChange}
            >
              {resolutionOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {children}
      </Box>

      <Box sx={{ flex: 1 }} />
    </Box>
  )
}