
import { Box, IconButton, Tooltip } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import StopIcon from '@mui/icons-material/Stop'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import ClearIcon from '@mui/icons-material/Clear'

export default function CaptureControls({ 
  isCapturing,
  isPaused,
  onStart,
  onPause,
  onStop,
  onExport,
  onClear,
  disabled,
  measurements
}) {
  const buttonStyle = {
    backgroundColor: 'action.selected',
    '&:hover': {
      backgroundColor: 'action.hover',
    },
    '&.Mui-disabled': {
      backgroundColor: 'action.disabledBackground',
    }
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        {!isCapturing || isPaused ? (
          <Tooltip title="Start Capture (Space)">
            <span>
              <IconButton 
                onClick={onStart}
                disabled={disabled}
                color="primary"
                size="large"
                sx={buttonStyle}
                variant="outlined"
              >
                <PlayArrowIcon />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <Tooltip title="Pause Capture (Space)">
            <span>
              <IconButton
                onClick={onPause}
                disabled={disabled}
                color="warning"
                size="large"
                sx={buttonStyle}
              >
                <PauseIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
        
        <Tooltip title="Stop Capture (S)">
          <span>
            <IconButton
              onClick={onStop}
              disabled={!isCapturing || disabled}
              color="error"
              size="large"
              sx={buttonStyle}
            >
              <StopIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>


      
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        <Tooltip title="Export to CSV (E)">
          <span>
            <IconButton 
              onClick={onExport}
              disabled={isCapturing || !measurements?.length}
              color="primary"
              size="large"
              sx={buttonStyle}
            >
              <FileDownloadIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Clear Data (C)">
          <span>
            <IconButton 
              onClick={onClear}
              disabled={isCapturing || !measurements?.length}
              color="default"
              size="large"
              sx={buttonStyle}
            >
              <ClearIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  )
}