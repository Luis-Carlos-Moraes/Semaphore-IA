const { app, BrowserWindow, ipcMain, Tray, Menu, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net');
const os = require('os');

const configManager = require('./config');
const stateManager = require('./state');

let mainWindow = null;
let settingsWindow = null;
let tray = null;
let timeoutTimer = null;
let ipcServer = null;
let fileWatcher = null;
let currentWatchedWorkspace = '';
const activePromptSockets = {};

const ASSETS_DIR = path.join(__dirname, '../assets');
const TRAY_ICON_PATH = path.join(ASSETS_DIR, 'tray.png');
const APP_ICON_PATH = path.join(ASSETS_DIR, 'icon.png');

// Ensure assets directory and default icons exist
function ensureAssetsExist() {
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  // Basic 16x16 PNG icon in base64 format (semáforo de 3 cores vertical simples)
  const iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAcElEQVQ4y2NgGFrgPxAzMjD8x4IHwDRRghlIMwPVAAQDNjY2/2GCRhADSC1MkhguIDQ05B+KAdgAIwzAbQC6AeQYQI4B5BhAyABy0j8hA8h/ALkPYCsY8fmAVp4hNEh7A16hMKoB+Az4/x8KGF4wDAwAANd8L01hS1y5AAAAAElFTkSuQmCC';
  if (!fs.existsSync(TRAY_ICON_PATH)) {
    fs.writeFileSync(TRAY_ICON_PATH, Buffer.from(iconBase64, 'base64'));
  }
  if (!fs.existsSync(APP_ICON_PATH)) {
    fs.writeFileSync(APP_ICON_PATH, Buffer.from(iconBase64, 'base64'));
  }
}

// Get dimensions based on theme configuration
function getWidgetDimensions(theme) {
  return theme === 'horizontal' ? { w: 116, h: 46 } : { w: 46, h: 116 };
}

function createMainWindow() {
  const config = configManager.loadConfig();
  const dim = getWidgetDimensions(config.theme);

  // Get screen bounds to position at top-right
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;
  const x = width - dim.w - 20;
  const y = 40;

  mainWindow = new BrowserWindow({
    width: dim.w,
    height: dim.h,
    x: x,
    y: y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    hasShadow: false,
    icon: APP_ICON_PATH,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  // Apply stealth mode configuration
  mainWindow.setContentProtection(config.stealth);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 420,
    height: 380,
    resizable: false,
    frame: true,
    autoHideMenuBar: true,
    title: 'Configurações - Semaphore JS',
    icon: APP_ICON_PATH,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  settingsWindow.loadFile(path.join(__dirname, 'renderer/settings.html'));

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function createTray() {
  // Use template image on macOS to look native in dark/light menu bars
  let trayImage = nativeImage.createFromPath(TRAY_ICON_PATH);
  if (process.platform === 'darwin') {
    trayImage.setTemplateImage(true);
  }

  tray = new Tray(trayImage);
  tray.setToolTip('Semaphore JS');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Mostrar Widget',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          createMainWindow();
        }
      }
    },
    {
      label: 'Ocultar Widget',
      click: () => {
        if (mainWindow) mainWindow.hide();
      }
    },
    { type: 'separator' },
    {
      label: 'Testar Luzes',
      submenu: [
        { label: 'Verde (Ocioso)', click: () => stateManager.setSessionState('test', 'green') },
        { label: 'Amarelo (Pensando)', click: () => stateManager.setSessionState('test', 'yellow') },
        { label: 'Vermelho (Escrevendo)', click: () => stateManager.setSessionState('test', 'red') },
        { label: 'Limpar Teste', click: () => stateManager.clearAll() }
      ]
    },
    {
      label: 'Configurações',
      click: () => createSettingsWindow()
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // Show window on double click
  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    } else {
      createMainWindow();
    }
  });
}

// Start IPC server to receive state updates from CLI
function startIpcServer() {
  const ipcPath = os.platform() === 'win32'
    ? '\\\\.\\pipe\\semaphore-js'
    : '/tmp/semaphore-js.sock';

  // Clean old UNIX socket
  if (os.platform() !== 'win32') {
    try {
      if (fs.existsSync(ipcPath)) {
        fs.unlinkSync(ipcPath);
      }
    } catch (err) {
      console.error('Failed to unlink socket:', err);
    }
  }

  ipcServer = net.createServer((socket) => {
    let buffer = '';
    socket.on('data', (chunk) => {
      buffer += chunk.toString();
      try {
        const payload = JSON.parse(buffer.trim());
        if (payload.cmd === 'prompt') {
          if (payload.workspace) {
            updateWorkspaceWatcher(payload.workspace);
            const config = configManager.loadConfig();
            if (config.workspacePath !== payload.workspace) {
              config.workspacePath = payload.workspace;
              configManager.saveConfig(config);
            }
          }
          if (mainWindow && !mainWindow.isDestroyed()) {
            // Expand window size to fit the prompt
            mainWindow.setSize(220, 116);
            
            mainWindow.webContents.send('show-prompt', {
              session: payload.session,
              question: payload.question,
              options: payload.options.split(',')
            });
            activePromptSockets[payload.session] = socket;
            stateManager.setSessionState(payload.session, 'red');
          } else {
            socket.write(JSON.stringify({ error: 'Window not available' }));
            socket.end();
          }
        } else if (payload.cmd === 'set') {
          if (payload.workspace) {
            updateWorkspaceWatcher(payload.workspace);
            const config = configManager.loadConfig();
            if (config.workspacePath !== payload.workspace) {
              config.workspacePath = payload.workspace;
              configManager.saveConfig(config);
            }
          }
          stateManager.setSessionState(payload.session, payload.state);
          socket.end();
        }
        buffer = '';
      } catch (err) {
        // Wait for complete JSON payload
      }
    });

    socket.on('end', () => {
      try {
        if (buffer.trim()) {
          const payload = JSON.parse(buffer);
          if (payload.cmd === 'set') {
            stateManager.setSessionState(payload.session, payload.state);
          }
        }
      } catch (err) {
        // Ignored if already parsed on data
      }
    });

    socket.on('error', (err) => {
      console.error('Socket connection error:', err);
    });
  });

  ipcServer.listen(ipcPath, () => {
    console.log(`IPC server running at: ${ipcPath}`);
  });

  ipcServer.on('error', (err) => {
    console.error('IPC server error:', err);
  });
}

// Setup background timer for inactive sessions
function startTimeoutTimer() {
  if (timeoutTimer) clearInterval(timeoutTimer);

  timeoutTimer = setInterval(() => {
    const config = configManager.loadConfig();
    stateManager.checkTimeouts(config.timeout);
  }, 2000); // Check timeouts every 2 seconds
}

// Apply auto start settings
function applyAutoStart(enabled) {
  try {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: app.getPath('exe')
    });
  } catch (err) {
    console.error('Failed to set login item settings:', err);
  }
}

// Listen to state changes and push to renderer
stateManager.onStateChange = (globalState) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('state-changed', globalState);
  }
};

// Handle IPC messages from Renderer
ipcMain.on('get-initial-state', (event) => {
  const config = configManager.loadConfig();
  event.reply('theme-changed', config.theme);
  event.reply('state-changed', stateManager.getGlobalState());
});

ipcMain.handle('get-config', () => {
  return configManager.loadConfig();
});

ipcMain.on('save-config', (event, updatedConfig) => {
  configManager.saveConfig(updatedConfig);
  updateWorkspaceWatcher(updatedConfig.workspacePath);

  // Apply visual changes immediately
  if (mainWindow && !mainWindow.isDestroyed()) {
    const dim = getWidgetDimensions(updatedConfig.theme);
    
    // Adjust size based on layout theme
    mainWindow.setSize(dim.w, dim.h);
    mainWindow.webContents.send('theme-changed', updatedConfig.theme);
    mainWindow.setContentProtection(updatedConfig.stealth);
  }

  // Apply auto start
  applyAutoStart(updatedConfig.autoStart);

  // Close configurations window
  if (settingsWindow) {
    settingsWindow.close();
  }
});

ipcMain.on('close-settings-window', () => {
  if (settingsWindow) settingsWindow.close();
});

ipcMain.on('open-settings', () => {
  createSettingsWindow();
});

ipcMain.on('close-widget', () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.on('submit-prompt-response', (event, { session, option }) => {
  const socket = activePromptSockets[session];
  if (socket && !socket.destroyed) {
    socket.write(JSON.stringify({ result: option }));
    socket.end();
    delete activePromptSockets[session];
  }
  stateManager.setSessionState(session, 'green');

  // Shrink window back to user's preferred layout dimensions
  if (mainWindow && !mainWindow.isDestroyed()) {
    const config = configManager.loadConfig();
    const dim = getWidgetDimensions(config.theme);
    mainWindow.setSize(dim.w, dim.h);
  }
});

function updateWorkspaceWatcher(workspacePath) {
  if (!workspacePath) return;
  const targetPath = path.resolve(workspacePath);
  if (currentWatchedWorkspace === targetPath) return;

  // Close existing watcher
  if (fileWatcher) {
    fileWatcher.close();
    fileWatcher = null;
  }

  const stateFilePath = path.join(targetPath, '.agents/state.json');
  const dirPath = path.dirname(stateFilePath);

  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create state directory:', err);
  }

  const updateStateFromFile = () => {
    try {
      if (fs.existsSync(stateFilePath)) {
        const fileContent = fs.readFileSync(stateFilePath, 'utf8');
        const data = JSON.parse(fileContent);
        if (data && data.state) {
          stateManager.setSessionState(data.session || 'default', data.state);
        }
      }
    } catch (err) {
      // Ignore reading/parsing errors during writes
    }
  };

  updateStateFromFile();

  try {
    fileWatcher = fs.watch(dirPath, (eventType, filename) => {
      if (filename === 'state.json') {
        updateStateFromFile();
      }
    });
    currentWatchedWorkspace = targetPath;
    console.log(`Watching workspace state at: ${stateFilePath}`);
  } catch (err) {
    console.error('Failed to start file watcher for workspace:', err);
  }
}

function startStateFileWatcher() {
  const config = configManager.loadConfig();
  if (config.workspacePath) {
    updateWorkspaceWatcher(config.workspacePath);
  } else {
    // Fallback to relative workspace root (development)
    const fallbackPath = path.join(__dirname, '../');
    updateWorkspaceWatcher(fallbackPath);
  }
}

// App Startup Lifecycle
app.whenReady().then(() => {
  ensureAssetsExist();
  createMainWindow();
  createTray();
  startIpcServer();
  startTimeoutTimer();
  startStateFileWatcher();

  // Hide Dock icon on macOS
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Keep running in system tray
  if (process.platform !== 'darwin') {
    // We don't quit, let the tray run the app
  }
});

app.on('before-quit', () => {
  // Clean up IPC server
  if (fileWatcher) fileWatcher.close();
  if (ipcServer) ipcServer.close();
  if (timeoutTimer) clearInterval(timeoutTimer);

  const ipcPath = os.platform() === 'win32'
    ? '\\\\.\\pipe\\semaphore-js'
    : '/tmp/semaphore-js.sock';

  if (os.platform() !== 'win32') {
    try {
      if (fs.existsSync(ipcPath)) {
        fs.unlinkSync(ipcPath);
      }
    } catch (err) {
      // Ignore
    }
  }
});
