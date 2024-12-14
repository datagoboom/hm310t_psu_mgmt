import { Box, Button, TextField, Typography } from '@mui/material'
import { useState } from 'react'

const COMMAND_GROUPS = {
  'Output Control': [
    { label: 'Enable Output', command: '01 06 00 01 00 01 XX XX' },
    { label: 'Disable Output', command: '01 06 00 01 00 00 XX XX' }
  ],
  'Measurements': [
    { label: 'Read Voltage', command: '01 03 00 10 00 01 XX XX' },
    { label: 'Read Current', command: '01 03 00 11 00 01 XX XX' },
    { label: 'Read Power', command: '01 03 00 12 00 02 XX XX' }
  ],
  'Protection': [
    { label: 'Read Protection Status', command: '01 03 00 02 00 01 XX XX' },
    { label: 'Clear Protection', command: '01 06 00 02 00 00 XX XX' }
  ]
}

const VOLTAGE_LIMIT = 30
const CURRENT_LIMIT = 10

export default function CommandPalette({ onCommand }) {
  const [voltage, setVoltage] = useState('')
  const [current, setCurrent] = useState('')
  const [voltageError, setVoltageError] = useState('')
  const [currentError, setCurrentError] = useState('')

  const validateVoltage = (value) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      return 'Please enter a valid number'
    }
    if (numValue < 0) {
      return 'Voltage cannot be negative'
    }
    if (numValue > VOLTAGE_LIMIT) {
      return `Voltage cannot exceed ${VOLTAGE_LIMIT}V`
    }
    return ''
  }

  const validateCurrent = (value) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      return 'Please enter a valid number'
    }
    if (numValue < 0) {
      return 'Current cannot be negative'
    }
    if (numValue > CURRENT_LIMIT) {
      return `Current cannot exceed ${CURRENT_LIMIT}A`
    }
    return ''
  }

  const handleVoltageChange = (e) => {
    const value = e.target.value
    setVoltage(value)
    setVoltageError(validateVoltage(value))
  }

  const handleCurrentChange = (e) => {
    const value = e.target.value
    setCurrent(value)
    setCurrentError(validateCurrent(value))
  }

  const handleSetVoltage = () => {
    const error = validateVoltage(voltage)
    if (error) {
      setVoltageError(error)
      return
    }
    const value = Math.round(parseFloat(voltage) * 100)
    const highByte = Math.floor(value / 256).toString(16).padStart(2, '0')
    const lowByte = (value % 256).toString(16).padStart(2, '0')
    onCommand(`01 06 00 30 ${highByte} ${lowByte} XX XX`)
  }

  const handleSetCurrent = () => {
    const error = validateCurrent(current)
    if (error) {
      setCurrentError(error)
      return
    }
    const value = Math.round(parseFloat(current) * 1000)
    const highByte = Math.floor(value / 256).toString(16).padStart(2, '0')
    const lowByte = (value % 256).toString(16).padStart(2, '0')
    onCommand(`01 06 00 31 ${highByte} ${lowByte} XX XX`)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Quick Reference */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Quick Reference:
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          Format: AA FF RR RR NN NN CC CC
          <br />
          AA: Device Address (01)
          <br />
          FF: Function Code (03=read, 06=write)
          <br />
          RR RR: Register Address
          <br />
          NN NN: Number of registers / Value
          <br />
          CC CC: CRC (shown as XX XX)
        </Typography>
      </Box>

      {/* Set Values */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <TextField
          label="Voltage"
          size="small"
          type="number"
          value={voltage}
          sx={{ width: 250 }}
          onChange={handleVoltageChange}
          error={!!voltageError}
          helperText={voltageError || `Max: ${VOLTAGE_LIMIT}V`}
          InputProps={{ 
            endAdornment: 'V',
            inputProps: { 
              min: 0, 
              max: VOLTAGE_LIMIT,
              step: 0.01 
            }
          }}
        />
        <Button 
          variant="contained" 
          onClick={handleSetVoltage}
          disabled={!!voltageError}
        >
          Set Voltage
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <TextField
          label="Current"
          size="small"
          type="number"
          value={current}
          sx={{ width: 250 }}
          onChange={handleCurrentChange}
          error={!!currentError}
          helperText={currentError || `Max: ${CURRENT_LIMIT}A`}
          InputProps={{ 
            endAdornment: 'A',
            inputProps: { 
              min: 0, 
              max: CURRENT_LIMIT,
              step: 0.001 
            }
          }}
        />
        <Button 
          variant="contained" 
          onClick={handleSetCurrent}
          disabled={!!currentError}
        >
          Set Current
        </Button>
      </Box>

      {/* Command Groups */}
      {Object.entries(COMMAND_GROUPS).map(([group, commands]) => (
        <Box key={group}>
          <Typography variant="subtitle1" gutterBottom>
            {group}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {commands.map((cmd) => (
              <Button
                key={cmd.label}
                variant="outlined"
                size="small"
                onClick={() => onCommand(cmd.command)}
              >
                {cmd.label}
              </Button>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  )
} 