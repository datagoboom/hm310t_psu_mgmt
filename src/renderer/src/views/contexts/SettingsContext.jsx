import { createContext, useContext, useState } from 'react';

const SettingsContext = createContext(null);

const defaultSettings = {
  // ... your existing default settings
  globalGraphSettings: {
    timeRange: 60000,  // 1 minute default
    resolution: 1000   // 1 second default
  }
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const updateGlobalGraphSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      globalGraphSettings: {
        ...prev.globalGraphSettings,
        ...newSettings
      }
    }));
  };

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
      updateGraphPreference,
      globalGraphSettings: settings.globalGraphSettings,
      updateGlobalGraphSettings
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
