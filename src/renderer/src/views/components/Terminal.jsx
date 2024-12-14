import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useEffect, useRef } from 'react'

const translateResponse = (response) => {
  // Remove any spaces and get clean hex string
  const hex = response.replace(/Response: /, '').replace(/\s+/g, '')
  
  if (!hex || hex === 'Nodata') return null

  try {
    const bytes = hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    
    // Check if it's a valid Modbus response (at least 5 bytes: addr, func, len/data, crc)
    if (bytes.length < 5) return null

    const address = bytes[0]
    const functionCode = bytes[1]

    let translation = {
      address,
      functionCode,
      type: ''
    }

    switch (functionCode) {
      case 0x03: // Read registers
        translation.type = 'Read Response'
        translation.byteCount = bytes[2]
        translation.values = []
        for (let i = 0; i < translation.byteCount; i += 2) {
          const value = (bytes[3 + i] << 8) | bytes[4 + i]
          translation.values.push(value)
        }
        
        // Add register-specific translations
        const register = (bytes[2] << 8) | bytes[3]
        switch (register) {
          case 0x0010: // Voltage reading
            translation.description = `Voltage: ${(translation.values[0] / 100).toFixed(2)}V`
            break
          case 0x0011: // Current reading
            translation.description = `Current: ${(translation.values[0] / 1000).toFixed(3)}A`
            break
          case 0x0012: // Power reading
            translation.description = `Power: ${(translation.values[0] / 10).toFixed(1)}W`
            break
        }
        break

      case 0x06: // Write single register
        translation.type = 'Write Response'
        translation.register = (bytes[2] << 8) | bytes[3]
        translation.value = (bytes[4] << 8) | bytes[5]
        break

      default:
        translation.type = 'Unknown Response'
        translation.rawData = bytes.slice(2, -2)
    }

    translation.crc = `${bytes[bytes.length-2].toString(16).padStart(2, '0')}${bytes[bytes.length-1].toString(16).padStart(2, '0')}`
    return translation
  } catch (error) {
    console.error('Error translating response:', error)
    return null
  }
}

export default function Terminal({ output }) {
  const theme = useTheme()
  const terminalRef = useRef(null)

  const getColor = (type) => {
    switch (type) {
      case 'command':
        return theme.palette.info.main
      case 'response':
        return theme.palette.success.main
      case 'error':
        return theme.palette.error.main
      default:
        return theme.palette.text.primary
    }
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  return (
    <Box 
      ref={terminalRef}
      sx={{ 
        flex: 1,
        bgcolor: 'background.default',
        p: 1,
        borderRadius: 1,
        fontFamily: 'monospace',
        overflow: 'auto',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {output.map((line, index) => (
        <Box key={index} sx={{ mb: 1 }}>
          <Typography 
            component="span" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.8rem',
              mr: 1 
            }}
          >
            [{line.timestamp.toLocaleTimeString()}]
          </Typography>
          <Typography 
            component="span"
            sx={{ 
              color: getColor(line.type),
              fontFamily: 'monospace'
            }}
          >
            {line.content}
          </Typography>
          {line.type === 'response' && (
            <Box sx={{ ml: 4, mt: 0.5, color: 'text.secondary', fontSize: '0.8rem' }}>
              {(() => {
                const translation = translateResponse(line.content)
                if (!translation) return null
                
                return (
                  <>
                    <div>Type: {translation.type}</div>
                    <div>Address: {translation.address}</div>
                    <div>Function: 0x{translation.functionCode.toString(16).padStart(2, '0')}</div>
                    {translation.byteCount !== undefined && (
                      <div>Byte Count: {translation.byteCount}</div>
                    )}
                    {translation.values && (
                      <div>Values: [{translation.values.join(', ')}]</div>
                    )}
                    {translation.register !== undefined && (
                      <>
                        <div>Register: 0x{translation.register.toString(16).padStart(4, '0')}</div>
                        <div>Value: {translation.value} (0x{translation.value.toString(16).padStart(4, '0')})</div>
                      </>
                    )}
                    <div>CRC: 0x{translation.crc}</div>
                  </>
                )
              })()}
            </Box>
          )}
          {line.details && (
            <Typography 
              component="div"
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.8rem',
                ml: 4,
                fontFamily: 'monospace'
              }}
            >
              {typeof line.details === 'string' 
                ? line.details 
                : Object.entries(line.details).map(([key, value]) => (
                    <div key={key}>{key}: {value}</div>
                  ))
              }
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  )
} 