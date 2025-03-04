// preload-login.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('loginAPI', {
  login: (credentials) => ipcRenderer.invoke('login', credentials),
  exit: () => ipcRenderer.invoke('exit')
});

