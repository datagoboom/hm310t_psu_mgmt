import { Box, Typography, Paper } from '@mui/material'
import TimerIcon from '@mui/icons-material/Timer'
import DataUsageIcon from '@mui/icons-material/DataUsage'
import SpeedIcon from '@mui/icons-material/Speed'

export default function CaptureInfo({ 
  isCapturing,
  isPaused,
  measurements,
  startTime,
  refreshRate
}) {
  const formatDuration = (ms) => {
    if (!ms) return '00:00:00'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  const calculateStats = () => {
    if (!measurements?.length) return { samples: 0, rate: 0 }
    const duration = (new Date().getTime() - startTime) / 1000 
    return {
      samples: measurements.length,
      rate: (measurements.length / duration).toFixed(1)
    }
  }

  const stats = calculateStats()

  return (
    <Paper sx={{ p: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TimerIcon color="action" />
        <Box>
          <Typography variant="caption" color="text.secondary">Duration</Typography>
          <Typography variant="body2">
            {formatDuration(startTime ? new Date().getTime() - startTime : 0)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DataUsageIcon color="action" />
        <Box>
          <Typography variant="caption" color="text.secondary">Samples</Typography>
          <Typography variant="body2">{stats.samples}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SpeedIcon color="action" />
        <Box>
          <Typography variant="caption" color="text.secondary">Sample Rate</Typography>
          <Typography variant="body2">{stats.rate} Hz</Typography>
        </Box>
      </Box>

      {isPaused && (
        <Typography 
          variant="body2" 
          color="warning.main" 
          sx={{ fontWeight: 'bold' }}
        >
          PAUSED
        </Typography>
      )}
    </Paper>
  )
} 