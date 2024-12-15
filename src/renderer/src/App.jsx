import { useState, useMemo } from 'react'
import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import { BrowserRouter as Router } from 'react-router-dom'
import Sidebar from './views/components/Sidebar'
import { createCustomTheme } from './theme'


import { ApiProvider } from './views/contexts/ApiContext'
import { HistoryProvider } from './views/contexts/HistoryContext'


import Dashboard from './views/Dashboard'
import CommandCenter from './views/CommandCenter'
import Settings from './views/Settings'

function App() {
  const [currentTheme, setCurrentTheme] = useState('defaultTheme')
  const [currentView, setCurrentView] = useState('dashboard')
  
  const theme = useMemo(() => createCustomTheme(currentTheme), [currentTheme])

  const handleThemeChange = (newTheme) => {
    console.log('Changing theme to:', newTheme)
    setCurrentTheme(newTheme)
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'command_center':
        return <CommandCenter />
      case 'settings':
        return (
          <Settings 
            currentTheme={currentTheme} 
            onThemeChange={handleThemeChange}
          />
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ApiProvider>
          <HistoryProvider>
            <Box sx={{ display: 'flex', width: '100vw', height: '100vh' }}>
              <Sidebar 
                currentView={currentView}
                onViewChange={setCurrentView}
              />
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {renderView()}
              </Box>
            </Box>
          </HistoryProvider>
        </ApiProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App

