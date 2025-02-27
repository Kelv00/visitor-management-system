const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database');
const { validateNRIC } = require('./nricValidator');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.loadFile('index.html');
}

app.whenReady().then(async () => {
  await db.initialize(); // Initialize connection to SQL Express and ensure tables exist
  createWindow();

  // Periodic cleanup for PDPA compliance (delete records older than 3 months from last visit)
  setInterval(() => {
    db.cleanupExpiredVisitors();
  }, 24 * 60 * 60 * 1000); // every 24 hours

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for renderer communication

ipcMain.handle('addVisitor', async (event, visitorData) => {
  // Validate NRIC first
  if (!validateNRIC(visitorData.nric)) {
    throw new Error("Invalid NRIC");
  }
  try {
    const visitorId = await db.addVisitor(visitorData);
    // Log the visitor "IN" action after successful registration
    await db.addLog(visitorId, 'IN');
    return visitorId;
  } catch (err) {
    throw err;
  }
});

ipcMain.handle('addLog', async (event, visitorId, action) => {
  try {
    await db.addLog(visitorId, action);
  } catch (err) {
    throw err;
  }
});

ipcMain.handle('getLogs', async (event, searchQuery) => {
  try {
    const logs = await db.getLogs(searchQuery);
    return logs;
  } catch (err) {
    throw err;
  }
});
