import { Box, IconButton, Tooltip, Divider } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import TerminalIcon from '@mui/icons-material/Terminal'
import SettingsIcon from '@mui/icons-material/Settings'
import { useTheme } from '@mui/material/styles'

export default function Sidebar({ currentView, onViewChange }) {
  const theme = useTheme()

  const menuItems = [
    { id: 'dashboard', icon: DashboardIcon},
    { id: 'command_center', icon: TerminalIcon},
    { id: 'settings', icon: SettingsIcon}
  ]

  return (
    <Box
      sx={{
        width: 60,
        height: '100vh',
        backgroundColor: 'background.sidebar',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 2,
        borderRight: 1,
        borderColor: 'divider'
      }}
    >
      {menuItems.map((item, index) => (
        <Box key={item.id}>
          {index > 0 && <Divider sx={{ width: '40px', my: 1 }} />}
          <Tooltip title={item.label} placement="right">
            <IconButton
              onClick={() => onViewChange(item.id)}
              color={currentView === item.id ? 'primary' : 'inherit'}
              sx={{
                width: 40,
                height: 40,
                mb: 1,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected
                }
              }}
            >
              <item.icon />
            </IconButton>
          </Tooltip>
        </Box>
      ))}
    </Box>
  )
} 