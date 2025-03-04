// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database');
const { validateNRIC } = require('./nricValidator');
// Optional: require encryption here if needed
// const { encrypt, decrypt } = require('./encryption');

let loginWindow;
let mainWindow;

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 520,
    height: 620,
    resizable: false,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload-login.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  loginWindow.loadFile('login.html');
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(async () => {
  await db.initialize();
  createLoginWindow();

  // Periodic cleanup for PDPA compliance
  setInterval(() => {
    db.cleanupExpiredVisitors();
  }, 24 * 60 * 60 * 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      // If no window exists, open the login window
      createLoginWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handler for login (to be called from the login window)
ipcMain.handle('login', async (event, credentials) => {
  // Replace this with your actual authentication logic
  if (credentials.username === 'admin' && credentials.password === 'password') {
    if (loginWindow) {
      loginWindow.close();
      loginWindow = null;
    }
    createMainWindow();
    return { success: true };
  } else {
    return { success: false, message: "Invalid username or password" };
  }
});

// IPC handlers for your main app
ipcMain.handle('addVisitor', async (event, visitorData) => {
  // Validate NRIC first
  if (!validateNRIC(visitorData.nric)) {
    throw new Error("Invalid NRIC");
  }
  // If you want to encrypt here, do so before calling db.addVisitor
  // visitorData.nric = encrypt(visitorData.nric);
  // visitorData.name = encrypt(visitorData.name);

  const visitorId = await db.addVisitor(visitorData);
  await db.addLog(visitorId, 'IN');
  return visitorId;
});

ipcMain.handle('addLog', async (event, visitorId, action) => {
  await db.addLog(visitorId, action);
});

ipcMain.handle('getLogs', async (event, searchQuery) => {
  return db.getLogs(searchQuery);
});

ipcMain.handle('exit', async () => {
  app.quit();
});
