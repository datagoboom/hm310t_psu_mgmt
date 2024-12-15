import { createContext, useContext, useState } from 'react';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  // Graph preferences
  const [graphPreferences, setGraphPreferences] = useState({
    voltage: {
      type: 'line',
      timeRange: 60000, // 1 minute default
    },
    current: {
      type: 'line',
      timeRange: 60000,
    },
    power: {
      type: 'line',
      timeRange: 60000,
    },
    temperature: {
      type: 'line',
      timeRange: 60000,
    }
  });

  const updateGraphPreference = (graphId, settings) => {
    setGraphPreferences(prev => ({
      ...prev,
      [graphId]: {
        ...prev[graphId],
        ...settings
      }
    }));
  };

  return (
    <SettingsContext.Provider value={{
      graphPreferences,
      updateGraphPreference
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
