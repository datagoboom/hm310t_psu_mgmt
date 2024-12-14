// reusable component for live graphs
// will be used in the Dashboard view

import { useRef, useMemo, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useTheme } from '@mui/material/styles'
import GraphControls from './GraphControls'

// Map dataKey to a consistent color index
const colorIndices = {
  voltage: 0,
  current: 1,
  power: 2
}

export default function LiveGraph({ title, unit, dataKey, data }) {
  const containerRef = useRef(null)
  const theme = useTheme()
  const [graphType, setGraphType] = useState('line')
  const [timeRange, setTimeRange] = useState(300000) // Default to 5 minutes

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []
    const cutoffTime = Date.now() - timeRange
    return data.filter(d => d.timestamp >= cutoffTime)
  }, [data, timeRange])

  // Get theme colors for the graph
  const colors = useMemo(() => ({
    primary: theme.graphs[colorIndices[dataKey]], // Use specific color for each graph
    secondary: theme.palette.secondary.main,
    background: theme.palette.background.paper,
    text: theme.palette.text.primary,
    grid: theme.palette.divider
  }), [theme, dataKey])

  // Calculate domain based on current data with minimum range
  const yDomain = useMemo(() => {
    if (!data || data.length === 0) return [0, 1]
    
    const values = data.map(d => d[dataKey]).filter(v => v !== undefined)
    if (values.length === 0) return [0, 1]
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    // If all values are the same, create a reasonable range around the value
    if (min === max) {
      const value = min
      const variance = Math.max(
        // At least 10% of the value, but never less than:
        // 0.001 for small values (like current)
        // 0.1 for medium values (like voltage)
        // 1.0 for large values (like power)
        value === 0 ? 0.1 : value * 0.1,
        value < 0.1 ? 0.001 : value < 10 ? 0.1 : 1.0
      )
      
      return [
        Math.max(0, value - variance), // Don't go below 0
        value + variance
      ]
    }
    
    // Normal case: different min/max values
    const range = max - min
    const padding = Math.max(
      range * 0.1, // At least 10% of the range
      min < 0.1 ? 0.001 : min < 10 ? 0.1 : 1.0 // Minimum padding based on value magnitude
    )
    
    return [
      Math.max(0, min - padding), // Don't go below 0
      max + padding
    ]
  }, [data, dataKey])

  const formatValue = (value) => {
    if (typeof value !== 'number') return ''
    return value < 1 ? value.toFixed(4) : value.toFixed(2)
  }

  const renderChart = (data) => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    const commonAxisProps = {
      stroke: colors.text,
      tick: { fill: colors.text }
    }

    switch (graphType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis 
              {...commonAxisProps}
              dataKey="timestamp" 
              tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis 
              {...commonAxisProps}
              domain={yDomain}
              tickFormatter={formatValue}
              width={60}
            />
            <Tooltip 
              labelFormatter={(time) => new Date(time).toLocaleString()}
              formatter={(value) => [formatValue(value) + unit, dataKey]}
              contentStyle={{ backgroundColor: colors.background }}
            />
            <Bar 
              dataKey={dataKey} 
              fill={colors.primary}
              isAnimationActive={false}
            />
          </BarChart>
        )
      
      default: // 'line', 'monotone', or 'stepAfter'
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis 
              {...commonAxisProps}
              dataKey="timestamp" 
              tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis 
              {...commonAxisProps}
              domain={yDomain}
              tickFormatter={formatValue}
              width={60}
            />
            <Tooltip 
              labelFormatter={(time) => new Date(time).toLocaleString()}
              formatter={(value) => [formatValue(value) + unit, dataKey]}
              contentStyle={{ backgroundColor: colors.background }}
            />
            <Line 
              type={graphType}
              dataKey={dataKey} 
              stroke={colors.primary}
              fill={colors.primary}
              dot={false}
              isAnimationActive={false}
              strokeWidth={2}
              connectNulls
            />
          </LineChart>
        )
    }
  }

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', p: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">{title}</Typography>
        <GraphControls 
          type={graphType} 
          onTypeChange={setGraphType}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      </Box>
      <Box sx={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart(filteredData)}
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}