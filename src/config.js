const { app } = require('electron');
const path = require('path');
const fs = require('fs');

const DEFAULT_CONFIG = {
  timeout: 300000, // 5 minutes in milliseconds
  stealth: false,
  theme: 'vertical',
  autoStart: false
};

let configPath = '';

function getConfigPath() {
  if (!configPath) {
    configPath = path.join(app.getPath('userData'), 'config.json');
  }
  return configPath;
}

function loadConfig() {
  try {
    const p = getConfigPath();
    if (fs.existsSync(p)) {
      const data = fs.readFileSync(p, 'utf8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error loading config, using defaults:', err);
  }
  return { ...DEFAULT_CONFIG };
}

function saveConfig(config) {
  try {
    const p = getConfigPath();
    // Ensure parent dir exists
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(p, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving config:', err);
  }
}

module.exports = {
  loadConfig,
  saveConfig,
  DEFAULT_CONFIG
};
