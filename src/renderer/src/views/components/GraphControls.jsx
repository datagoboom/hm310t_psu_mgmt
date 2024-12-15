import { ToggleButtonGroup, ToggleButton, Box } from '@mui/material'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import BarChartIcon from '@mui/icons-material/BarChart'
import TimelineIcon from '@mui/icons-material/Timeline'

const timeRanges = [
  { value: 60000, label: '1m' },
  { value: 300000, label: '5m' },
  { value: 900000, label: '15m' },
  { value: 1800000, label: '30m' },
  { value: 3600000, label: '1h' },
]

export default function GraphControls({ type, onTypeChange, timeRange, onTimeRangeChange }) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <ToggleButtonGroup
        value={type}
        exclusive
        onChange={(e, value) => value && onTypeChange(value)}
        size="small"
      >
        <ToggleButton value="line">
          <ShowChartIcon />
        </ToggleButton>
        <ToggleButton value="bar">
          <BarChartIcon />
        </ToggleButton>
        <ToggleButton value="area">
          <TimelineIcon />
        </ToggleButton>
      </ToggleButtonGroup>

      <ToggleButtonGroup
        value={timeRange}
        exclusive
        onChange={(e, value) => value && onTimeRangeChange(value)}
        size="small"
      >
        <ToggleButton value={60000}>1m</ToggleButton>
        <ToggleButton value={300000}>5m</ToggleButton>
        <ToggleButton value={900000}>15m</ToggleButton>
        <ToggleButton value={3600000}>1h</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
} 