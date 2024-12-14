import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, ...args) => {
      const validChannels = [
        'psu:connect',
        'psu:disconnect',
        'psu:getStatus',
        'psu:getPorts',
        'psu:setVoltage',
        'psu:setCurrent',
        'psu:setOutput',
        'psu:sendCommand',
        'psu:calculateCRC',
        'psu:isConnected'
      ]
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args)
      }
      throw new Error(`Invalid channel: ${channel}`)
    },
    send: (channel, ...args) => {
      const validChannels = ['connect', 'disconnect']
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, ...args)
      }
    }
  }
})
