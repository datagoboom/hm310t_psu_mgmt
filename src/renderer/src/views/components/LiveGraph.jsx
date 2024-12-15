import { useRef, useMemo } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts'
import { useTheme } from '@mui/material/styles'
import GraphControls from './GraphControls'
import { useSettings } from '../contexts/SettingsContext'

const colorIndices = {
  voltage: 0,
  current: 1,
  power: 2,
  temperature: 3
}

export default function LiveGraph({ title, unit, dataKey, data, isCapturing }) {
  const theme = useTheme()
  const { graphPreferences, updateGraphPreference } = useSettings()
  
  const preferences = graphPreferences[dataKey] || {
    type: 'line',
    timeRange: 60000
  }

  const colors = useMemo(() => ({
    primary: theme.graphs[colorIndices[dataKey] || 0],
    background: theme.palette.background.paper,
    text: theme.palette.text.primary,
    grid: theme.palette.divider
  }), [theme, dataKey])

  const handleTypeChange = (newType) => {
    updateGraphPreference(dataKey, { type: newType });
  };

  const handleTimeRangeChange = (newRange) => {
    updateGraphPreference(dataKey, { timeRange: newRange });
  };

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []
    const cutoffTime = Date.now() - preferences.timeRange
    return data.filter(d => d.timestamp >= cutoffTime)
  }, [data, preferences.timeRange])

  
  const yDomain = useMemo(() => {
    if (!data || data.length === 0) return [0, 1]
    
    const values = data.map(d => d[dataKey]).filter(v => v !== undefined)
    if (values.length === 0) return [0, 1]
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    
    if (min === max) {
      const value = min
      const variance = Math.max(
        
        
        
        
        value === 0 ? 0.1 : value * 0.1,
        value < 0.1 ? 0.001 : value < 10 ? 0.1 : 1.0
      )
      
      return [
        Math.max(0, value - variance), 
        value + variance
      ]
    }
    
    
    const range = max - min
    const padding = Math.max(
      range * 0.1, 
      min < 0.1 ? 0.001 : min < 10 ? 0.1 : 1.0 
    )
    
    return [
      Math.max(0, min - padding), 
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

    switch (preferences.type) {
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
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
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
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={colors.primary}
              fill={colors.primary}
              fillOpacity={0.3}
              isAnimationActive={false}
              strokeWidth={2}
              connectNulls
            />
          </AreaChart>
        )
      
      default:
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
              type="monotone"
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

  
  const showLoading = isCapturing && (!data || data.length === 0)

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: 1,
      gap: 1
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        <GraphControls
          type={preferences.type}
          onTypeChange={handleTypeChange}
          timeRange={preferences.timeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />
      </Box>
      
      <Box sx={{ 
        width: '100%', 
        height: 'calc(100% - 50px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {showLoading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 2
          }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Waiting for data...
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart(filteredData)}
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  );
}