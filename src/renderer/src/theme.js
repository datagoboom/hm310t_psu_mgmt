import { createTheme } from '@mui/material'

const themes = {
  gruvboxDark: {
    name: 'Gruvbox Dark',
    palette: {
      mode: 'dark',
      background: {
        default: '#282828',
        paper: '#3c3836',
        sidebar: '#1d2021'
      },
      foreground: '#ebdbb2',
      primary: '#458588',
      secondary: '#689d6a',
      error: '#cc241d',
      warning: '#d79921',
      info: '#83a598',
      success: '#98971a',
      graphs: ['#458588', '#b16286', '#d79921', '#98971a', '#cc241d', '#689d6a'],
      divider: '#504945'
    }
  },
  gruvboxLight: {
    name: 'Gruvbox Light',
    palette: {
      mode: 'light',
      background: {
        default: '#fbf1c7',
        paper: '#ebdbb2',
        sidebar: '#d5c4a1'
      },
      foreground: '#3c3836',
      primary: '#076678',
      secondary: '#427b58',
      error: '#9d0006',
      warning: '#b57614',
      info: '#458588',
      success: '#79740e',
      graphs: ['#076678', '#8f3f71', '#b57614', '#79740e', '#9d0006', '#427b58'],
      divider: '#bdae93'
    }
  },
  monokaiDark: {
    name: 'Monokai Dark',
    palette: {
      mode: 'dark',
      background: {
        default: '#272822',
        paper: '#3e3d32',
        sidebar: '#1e1f1c'
      },
      foreground: '#f8f8f2',
      primary: '#66d9ef',
      secondary: '#a6e22e',
      error: '#f92672',
      warning: '#fd971f',
      info: '#ae81ff',
      success: '#a6e22e',
      graphs: ['#66d9ef', '#f92672', '#fd971f', '#a6e22e', '#ae81ff', '#e6db74'],
      divider: '#49483e'
    }
  },
  monokaiLight: {
    name: 'Monokai Light',
    palette: {
      mode: 'light',
      background: {
        default: '#fafafa',
        paper: '#f5f5f5',
        sidebar: '#e6e6e6'
      },
      foreground: '#272822',
      primary: '#0089bd',
      secondary: '#70a20f',
      error: '#f92672',
      warning: '#fd971f',
      info: '#7c5af5',
      success: '#70a20f',
      graphs: ['#0089bd', '#f92672', '#fd971f', '#70a20f', '#7c5af5', '#c5a332'],
      divider: '#dcdcdc'
    }
  },
  solarizedDark: {
    name: 'Solarized Dark',
    palette: {
      mode: 'dark',
      background: {
        default: '#002b36',
        paper: '#073642',
        sidebar: '#00252e'
      },
      foreground: '#839496',
      primary: '#268bd2',
      secondary: '#2aa198',
      error: '#dc322f',
      warning: '#b58900',
      info: '#6c71c4',
      success: '#859900',
      graphs: ['#268bd2', '#d33682', '#b58900', '#859900', '#dc322f', '#2aa198'],
      divider: '#586e75'
    }
  },
  solarizedLight: {
    name: 'Solarized Light',
    palette: {
      mode: 'light',
      background: {
        default: '#fdf6e3',
        paper: '#eee8d5',
        sidebar: '#e4dabd'
      },
      foreground: '#657b83',
      primary: '#268bd2',
      secondary: '#2aa198',
      error: '#dc322f',
      warning: '#b58900',
      info: '#6c71c4',
      success: '#859900',
      graphs: ['#268bd2', '#d33682', '#b58900', '#859900', '#dc322f', '#2aa198'],
      divider: '#93a1a1'
    }
  },
  defaultTheme: {
    name: 'Default',
    palette: {
      mode: 'light',
      background: {
        default: '#ffffff',
        paper: '#f5f5f5',
        sidebar: '#eeeeee'
      },
      foreground: '#000000',
      primary: '#1976d2',
      secondary: '#9c27b0',
      error: '#d32f2f',
      warning: '#ed6c02',
      info: '#0288d1',
      success: '#2e7d32',
      graphs: ['#1976d2', '#9c27b0', '#ed6c02', '#2e7d32', '#d32f2f', '#0288d1'],
      divider: 'rgba(0, 0, 0, 0.12)'
    }
  }
}

export const createCustomTheme = (themeName) => {
  const theme = themes[themeName]
  if (!theme) throw new Error(`Theme ${themeName} not found`)

  return createTheme({
    palette: {
      mode: theme.palette.mode,
      primary: {
        main: theme.palette.primary
      },
      secondary: {
        main: theme.palette.secondary
      },
      error: {
        main: theme.palette.error
      },
      warning: {
        main: theme.palette.warning
      },
      info: {
        main: theme.palette.info
      },
      success: {
        main: theme.palette.success
      },
      background: theme.palette.background,
      text: {
        primary: theme.palette.foreground,
        secondary: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
      },
      divider: theme.palette.divider
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none'
          }
        }
      }
    },
    graphs: theme.palette.graphs
  })
}
export const themeNames = Object.keys(themes).map(key => ({
  value: key,
  label: themes[key].name
}))

