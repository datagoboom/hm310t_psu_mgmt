import { createTheme } from '@mui/material'

const themes = {
  defaultTheme: {
    name: 'Default',
    palette: {
      mode: 'dark',
      background: {
        default: '#263238',
        paper: '#37474f',
        sidebar: '#1c2529'
      },
      foreground: '#eeffff',
      primary: '#82aaff',
      secondary: '#c792ea',
      error: '#f07178',
      warning: '#ffcb6b',
      info: '#89ddff',
      success: '#c3e88d',
      graphs: [
        '#82aaff',
        '#c792ea',
        '#ffcb6b',
        '#c3e88d',
        '#f07178',
        '#89ddff'
      ],
      divider: '#546e7a',
      text: {
        primary: '#eeffff',
        secondary: '#b0bec5',
        disabled: '#546e7a'
      }
    }
  },
  agentOrange: {
    name: 'Agent Orange',
    palette: {
      mode: 'dark',
      background: {
        default: '#1a1b26',
        paper: '#24273a',
        sidebar: '#16171f'
      },
      foreground: '#ff9e64',
      primary: '#ff9e64',
      secondary: '#ff9e64',
      error: '#ff9e64',
      warning: '#ff9e64',
      info: '#ff9e64',
      success: '#ff9e64',
      graphs: [
        '#ff9e64',
        '#ffb584',
        '#cc7e50',
        '#ff8b3d',
        '#ffa778',
        '#e68a59'
      ],
      divider: '#ff9e64',
      text: {
        primary: '#ff9e64',
        secondary: 'rgba(255, 158, 100, 0.7)',
        disabled: 'rgba(255, 158, 100, 0.5)'
      }
    }
  },
  dracula: {
    name: 'Dracula',
    palette: {
      mode: 'dark',
      background: {
        default: '#282a36',
        paper: '#44475a',
        sidebar: '#21222c'
      },
      foreground: '#f8f8f2',
      primary: '#bd93f9',
      secondary: '#ff79c6',
      error: '#ff5555',
      warning: '#ffb86c',
      info: '#8be9fd',
      success: '#50fa7b',
      graphs: [
        '#bd93f9',
        '#ff79c6',
        '#ffb86c',
        '#50fa7b',
        '#ff5555',
        '#8be9fd'
      ],
      divider: '#6272a4',
      text: {
        primary: '#f8f8f2',
        secondary: '#6272a4',
        disabled: '#44475a'
      }
    }
  },
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
  marshmallow: {
    name: 'Marshmallow',
    palette: {
      mode: 'light',
      background: {
        default: '#fff5f7',
        paper: '#fdf2f8',
        sidebar: '#fff0f6'
      },
      foreground: '#4a5568',
      primary: '#f0abfc',
      secondary: '#c4b5fd',
      error: '#fda4af',
      warning: '#fcd34d',
      info: '#7aa2f7',
      success: '#86efac',
      graphs: [
        '#f0abfc',
        '#c4b5fd',
        '#fcd34d',
        '#86efac',
        '#fda4af',
        '#7aa2f7'
      ],
      divider: '#e2e8f0',
      text: {
        primary: '#4a5568',
        secondary: '#718096',
        disabled: '#a0aec0'
      }
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
  nightOwl: {
    name: 'Night Owl',
    palette: {
      mode: 'dark',
      background: {
        default: '#011627',
        paper: '#0b2942',
        sidebar: '#001122'
      },
      foreground: '#d6deeb',
      primary: '#82aaff',
      secondary: '#c792ea',
      error: '#ef5350',
      warning: '#ffeb95',
      info: '#7fdbca',
      success: '#22da6e',
      graphs: [
        '#82aaff',
        '#c792ea',
        '#ffeb95',
        '#22da6e',
        '#ef5350',
        '#7fdbca'
      ],
      divider: '#5f7e97',
      text: {
        primary: '#d6deeb',
        secondary: '#5f7e97',
        disabled: '#414868'
      }
    }
  },
  oneDarkPro: {
    name: 'One Dark Pro',
    palette: {
      mode: 'dark',
      background: {
        default: '#282c34',
        paper: '#3e4451',
        sidebar: '#21252b'
      },
      foreground: '#abb2bf',
      primary: '#61afef',
      secondary: '#c678dd',
      error: '#e06c75',
      warning: '#e5c07b',
      info: '#56b6c2',
      success: '#98c379',
      graphs: [
        '#61afef',
        '#c678dd',
        '#e5c07b',
        '#98c379',
        '#e06c75',
        '#56b6c2'
      ],
      divider: '#5c6370',
      text: {
        primary: '#abb2bf',
        secondary: '#5c6370',
        disabled: '#4b5263'
      }
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
  tokyoNight: {
    name: 'Tokyo Night',
    palette: {
      mode: 'dark',
      background: {
        default: '#1a1b26',
        paper: '#24283b',
        sidebar: '#16161e'
      },
      foreground: '#a9b1d6',
      primary: '#7aa2f7',
      secondary: '#bb9af7',
      error: '#f7768e',
      warning: '#e0af68',
      info: '#7dcfff',
      success: '#9ece6a',
      graphs: [
        '#7aa2f7',
        '#bb9af7',
        '#e0af68',
        '#9ece6a',
        '#f7768e',
        '#7dcfff'
      ],
      divider: '#565f89',
      text: {
        primary: '#a9b1d6',
        secondary: '#565f89',
        disabled: '#414868'
      }
    }
  },
  tomorrowNightEighties: {
    name: 'Tomorrow Night Eighties',
    palette: {
      mode: 'dark',
      background: {
        default: '#2d2d2d',
        paper: '#393939',
        sidebar: '#252525'
      },
      foreground: '#cccccc',
      primary: '#6699cc',
      secondary: '#cc99cc',
      error: '#f2777a',
      warning: '#ffcc66',
      info: '#66cccc',
      success: '#99cc99',
      graphs: [
        '#6699cc',
        '#cc99cc',
        '#ffcc66',
        '#99cc99',
        '#f2777a',
        '#66cccc'
      ],
      divider: '#999999',
      text: {
        primary: '#cccccc',
        secondary: '#999999',
        disabled: '#666666'
      }
    }
  },
  
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

