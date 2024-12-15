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
import { useHistory } from './contexts/HistoryContext';

export default function Dashboard({ currentTheme, onThemeChange }) {
  const navigate = useNavigate();
  const { isConnected } = useApi();
  const {
    isCapturing,
    isPaused,
    measurements,
    captureStartTime,
    lastFetchTime,
    refreshRate,
    startCapture,
    pauseCapture,
    stopCapture,
    clearCapture,
    addMeasurements
  } = useHistory();

  
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  
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

  
  useEffect(() => {
    if (isCapturing) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [isCapturing]);

  
  const handleNavigationConfirm = async () => {
    if (pendingNavigation && isCapturing) {
      await stopCapture();
      navigate(pendingNavigation);
    }
    setShowNavigationWarning(false);
    setPendingNavigation(null);
  };

  
  useEffect(() => {
    if (measurements.length > 0) {
      const latestMeasurement = measurements[measurements.length - 1];
      setCurrentState({
        outputEnabled: latestMeasurement.output_enabled,
        protectionStatus: {
          OVP: latestMeasurement.ovp,
          OCP: latestMeasurement.ocp,
          OPP: latestMeasurement.opp,
          OTP: latestMeasurement.otp,
          SCP: latestMeasurement.scp
        }
      });
    }
  }, [measurements]);

  
  useEffect(() => {
    const fetchData = async () => {
      if (!isCapturing) return;

      try {
        const result = await window.electron.ipcRenderer.invoke(
          'capture:getData', 
          lastFetchTime
        );

        if (result.success && result.data.length > 0) {
          addMeasurements(result.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [isCapturing, lastFetchTime]);

  const handleExport = () => {
    if (!measurements.length) return;

    const csvContent = [
      
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
      
      ...measurements.map(m => [
        m.timestamp,
        new Date(m.timestamp).toISOString(),
        m.voltage,
        m.current,
        m.power,
        m.output_enabled ? '1' : '0',
        m.ovp ? '1' : '0',
        m.ocp ? '1' : '0',
        m.opp ? '1' : '0',
        m.otp ? '1' : '0',
        m.scp ? '1' : '0'
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
          onStart={startCapture}
          onPause={pauseCapture}
          onStop={stopCapture}
          onExport={handleExport}
          onClear={clearCapture}
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
              isCapturing={isCapturing}
            />
          </Paper>
          <Paper sx={{ flex: 1, overflow: 'hidden' }}>
            <LiveGraph 
              title="Current Over Time" 
              unit="A" 
              dataKey="current" 
              data={measurements}
              isCapturing={isCapturing}
            />
          </Paper>
          <Paper sx={{ flex: 1, overflow: 'hidden' }}>
            <LiveGraph 
              title="Power Over Time" 
              unit="W" 
              dataKey="power" 
              data={measurements}
              isCapturing={isCapturing}
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