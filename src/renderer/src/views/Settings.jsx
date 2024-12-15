


import { Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { themeNames } from '../theme'

export default function Settings({ currentTheme, onThemeChange }) {
  const handleThemeChange = (event) => {
    onThemeChange(event.target.value)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Settings</Typography>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Appearance</Typography>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="theme-select-label">Theme</InputLabel>
          <Select
            labelId="theme-select-label"
            id="theme-select"
            value={currentTheme}
            label="Theme"
            onChange={handleThemeChange}
          >
            {themeNames.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      
      
    </Box>
  )
}