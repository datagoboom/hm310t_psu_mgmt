import { createContext, useContext, useState } from 'react';

const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [captureStartTime, setCaptureStartTime] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [refreshRate, setRefreshRate] = useState(1000);
  
  
  const [terminalHistory, setTerminalHistory] = useState([]);

  const startCapture = async () => {
    if (isPaused) {
      setIsPaused(false);
      return;
    }

    const result = await window.electron.ipcRenderer.invoke('capture:start');
    if (result.success) {
      setMeasurements([]);
      setIsCapturing(true);
      setCaptureStartTime(Date.now());
      setLastFetchTime(Date.now());
    }
  };

  const pauseCapture = () => {
    setIsPaused(true);
  };

  const stopCapture = async () => {
    await window.electron.ipcRenderer.invoke('capture:stop');
    setIsCapturing(false);
    setIsPaused(false);
    setCaptureStartTime(null);
  };

  const clearCapture = () => {
    setMeasurements([]);
  };

  const addMeasurements = (newMeasurements) => {
    setMeasurements(prev => [...prev, ...newMeasurements]);
    if (newMeasurements.length > 0) {
      setLastFetchTime(newMeasurements[newMeasurements.length - 1].timestamp);
    }
  };

  
  const addTerminalEntry = (entry) => {
    setTerminalHistory(prev => [...prev, {
      ...entry,
      timestamp: new Date()
    }]);
  };

  const clearTerminalHistory = () => {
    setTerminalHistory([]);
  };

  return (
    <HistoryContext.Provider value={{
      
      isCapturing,
      isPaused,
      measurements,
      captureStartTime,
      lastFetchTime,
      refreshRate,
      setRefreshRate,
      startCapture,
      pauseCapture,
      stopCapture,
      clearCapture,
      addMeasurements,
      
      
      terminalHistory,
      addTerminalEntry,
      clearTerminalHistory
    }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
