const { contextBridge, ipcRenderer } = require('electron');
const { validateNRIC } = require('./nricValidator');

contextBridge.exposeInMainWorld('api', {
  addVisitor: (visitorData) => ipcRenderer.invoke('addVisitor', visitorData),
  addLog: (visitorId, action) => ipcRenderer.invoke('addLog', visitorId, action),
  getLogs: (searchQuery) => ipcRenderer.invoke('getLogs', searchQuery),
  validateNRIC: (nric) => validateNRIC(nric)
});