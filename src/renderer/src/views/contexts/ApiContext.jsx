import { createContext, useContext, useRef, useState, useEffect } from 'react'

const ApiContext = createContext()

export function ApiProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false)
  const [selectedPort, setSelectedPort] = useState('')
  const [availablePorts, setAvailablePorts] = useState([])
  const [refreshRate, setRefreshRate] = useState(1000)
  const pollInterval = useRef(null)

  // Get available ports on mount
  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const result = await window.electron.ipcRenderer.invoke('psu:getPorts')
        if (result.success) {
          setAvailablePorts(result.ports)
        }
      } catch (error) {
        console.error('Error fetching ports:', error)
      }
    }

    fetchPorts()
    // You could also set up a periodic check for ports here if needed
  }, [])

  const connect = async (port) => {
    try {
      const result = await window.electron.ipcRenderer.invoke('psu:connect', port)
      if (result.success) {
        setIsConnected(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Connection error:', error)
      return false
    }
  }

  const disconnect = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('psu:disconnect')
      if (result.success) {
        setIsConnected(false)
        return true
      }
      return false
    } catch (error) {
      console.error('Disconnection error:', error)
      return false
    }
  }

  const getStatus = async () => {
    try {
      return await window.electron.ipcRenderer.invoke('psu:getStatus')
    } catch (error) {
      console.error('Status error:', error)
      return { success: false, error: error.message }
    }
  }

  const handlePortChange = async (event) => {
    const port = event.target.value
    setSelectedPort(port)
    
    if (port) {
      await connect(port)
    } else {
      await disconnect()
    }
  }

  const value = {
    isConnected,
    selectedPort,
    availablePorts,
    refreshRate,
    setRefreshRate,
    connect,
    disconnect,
    getStatus,
    handlePortChange,
    pollInterval
  }

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}

export const useApi = () => useContext(ApiContext)