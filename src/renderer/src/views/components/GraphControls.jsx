import { ToggleButtonGroup, ToggleButton, Box } from '@mui/material'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import BarChartIcon from '@mui/icons-material/BarChart'
import TimelapseIcon from '@mui/icons-material/Timelapse'

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
        size="small"
        value={timeRange}
        exclusive
        onChange={(e, value) => value && onTimeRangeChange(value)}
        aria-label="time range"
      >
        {timeRanges.map(({ value, label }) => (
          <ToggleButton key={value} value={value} aria-label={`${label} range`}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <ToggleButtonGroup
        size="small"
        value={type}
        exclusive
        onChange={(e, value) => value && onTypeChange(value)}
        aria-label="graph type"
      >
        <ToggleButton value="line" aria-label="line graph">
          <ShowChartIcon />
        </ToggleButton>
        <ToggleButton value="bar" aria-label="bar graph">
          <BarChartIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
} 