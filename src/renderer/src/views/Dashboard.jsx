import { Box, Paper } from '@mui/material';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useBeforeUnload } from 'react-router-dom';
import QuickBar from './components/QuickBar';
import LiveGraph from './components/LiveGraph';
import StatusIndicator from './components/StatusIndicator';
import CaptureControls from './components/CaptureControls';
import NavigationWarningModal from './components/NavigationWarningModal';
import { useApi } from './contexts/ApiContext';
import CaptureInfo from './components/CaptureInfo';

export default function Dashboard({ currentTheme, onThemeChange }) {
  const navigate = useNavigate();
  const { isConnected, getStatus, refreshRate, pollInterval } = useApi();
  const [measurements, setMeasurements] = useState([]);
  const [currentState, setCurrentState] = useState({
    outputEnabled: false,
    protectionStatus: {
      OVP: false,
      OCP: false,
      OPP: false,
      OTP: false,
      SCP: false
    }
  });

  // Capture state
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [captureStartTime, setCaptureStartTime] = useState(null);

  // Handle navigation attempts
  const handleNavigationAttempt = (to) => {
    if (isCapturing) {
      setShowNavigationWarning(true);
      setPendingNavigation(to);
      return false;
    }
    return true;
  };

  // Handle navigation confirmation
  const handleNavigationConfirm = () => {
    handleStop();
    setShowNavigationWarning(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  // Polling effect
  useEffect(() => {
    const startPolling = async () => {
      if (!isConnected || !isCapturing || isPaused) return;

      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }

      const poll = async () => {
        try {
          const result = await getStatus();
          if (result.success) {
            const timestamp = Date.now();
            
            setMeasurements(prev => {
              const newMeasurement = {
                voltage: result.data.voltage,
                current: result.data.current,
                power: result.data.power,
                timestamp
              };
              return [...prev, newMeasurement];
            });

            console.log(result.data)
            setCurrentState({
              outputEnabled: result.data.outputEnabled,
              protectionStatus: result.data.protectionStatus
            });
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      };

      await poll();
      pollInterval.current = setInterval(poll, refreshRate);
    };

    startPolling();

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    };
  }, [isConnected, isCapturing, isPaused, refreshRate]);

  // Capture controls
  const handleStart = () => {
    if (isPaused) {
      setIsPaused(false);
    } else {
      setMeasurements([]);
      setIsCapturing(true);
      setCaptureStartTime(new Date().getTime());
    }
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleStop = () => {
    setIsCapturing(false);
    setIsPaused(false);
    setCaptureStartTime(null);
  };

  const handleExport = () => {
    if (!measurements.length) return;

    const csvContent = [
      // Header - expanded with all fields
      [
        'Unix Timestamp (ms)', 
        'Time', 
        'Voltage (V)', 
        'Current (A)', 
        'Power (W)',
        'Output Enabled',
        'OVP',
        'OCP',
        'OPP',
        'OTP',
        'SCP'
      ],
      // Data rows - expanded with all fields
      ...measurements.map(m => [
        m.timestamp,
        new Date(m.timestamp).toISOString(),
        m.voltage,
        m.current,
        m.power,
        currentState.outputEnabled ? '1' : '0',
        currentState.protectionStatus.OVP ? '1' : '0',
        currentState.protectionStatus.OCP ? '1' : '0',
        currentState.protectionStatus.OPP ? '1' : '0',
        currentState.protectionStatus.OTP ? '1' : '0',
        currentState.protectionStatus.SCP ? '1' : '0'
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `psu_capture_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add keyboard shortcut handler
  const handleKeyPress = useCallback((event) => {
    if (event.target.tagName === 'INPUT') return // Ignore if typing in an input

    switch(event.key.toLowerCase()) {
      case ' ': // Space bar
        event.preventDefault()
        if (!isCapturing) {
          handleStart()
        } else if (!isPaused) {
          handlePause()
        } else {
          handleStart() // Resume
        }
        break
      case 's':
        if (isCapturing) {
          event.preventDefault()
          handleStop()
        }
        break
      case 'e':
        if (!isCapturing && measurements.length > 0) {
          event.preventDefault()
          handleExport()
        }
        break
      case 'c':
        if (!isCapturing && measurements.length > 0) {
          event.preventDefault()
          handleClear()
        }
        break
    }
  }, [isCapturing, isPaused, measurements.length])

  // Add effect for keyboard shortcuts
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  // Add clear handler
  const handleClear = () => {
    setMeasurements([])
  }

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      bgcolor: 'background.default'
    }}>
      <QuickBar 
        onThemeChange={onThemeChange} 
        currentTheme={currentTheme}
      >
        <CaptureControls
          isCapturing={isCapturing}
          isPaused={isPaused}
          onStart={handleStart}
          onPause={handlePause}
          onStop={handleStop}
          onExport={handleExport}
          onClear={handleClear}
          disabled={!isConnected}
          measurements={measurements}
        />
      </QuickBar>
      
      {isCapturing && (
        <Box sx={{ px: 2, pt: 1 }}>
          <CaptureInfo
            isCapturing={isCapturing}
            isPaused={isPaused}
            measurements={measurements}
            startTime={captureStartTime}
            refreshRate={refreshRate}
          />
        </Box>
      )}

      <Box sx={{ 
        flex: 1,
        display: 'flex',
        p: 2,
        gap: 2,
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          flex: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflow: 'hidden'
        }}>
          <Paper sx={{ flex: 1, overflow: 'hidden' }}>
            <LiveGraph 
              title="Voltage Over Time" 
              unit="V" 
              dataKey="voltage" 
              data={measurements}
            />
          </Paper>
          <Paper sx={{ flex: 1, overflow: 'hidden' }}>
            <LiveGraph 
              title="Current Over Time" 
              unit="A" 
              dataKey="current" 
              data={measurements}
            />
          </Paper>
          <Paper sx={{ flex: 1, overflow: 'hidden' }}>
            <LiveGraph 
              title="Power Over Time" 
              unit="W" 
              dataKey="power" 
              data={measurements}
            />
          </Paper>
        </Box>

        <Paper sx={{ 
          flex: 1,
          p: 2,
          overflow: 'auto'
        }}>
          <StatusIndicator 
            measurements={measurements[measurements.length - 1]} 
            state={currentState}
          />
        </Paper>
      </Box>

      <NavigationWarningModal
        open={showNavigationWarning}
        onClose={() => setShowNavigationWarning(false)}
        onConfirm={handleNavigationConfirm}
      />
    </Box>
  );
}