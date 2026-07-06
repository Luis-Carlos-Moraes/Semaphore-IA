const { app } = require('electron');
const path = require('path');
const fs = require('fs');

/**
 * Default configuration values for the application.
 * @constant {Object}
 * @property {number} timeout - Session inactivity timeout in milliseconds (default: 5 minutes).
 * @property {boolean} stealth - Whether stealth mode is enabled to protect from screenshots.
 * @property {string} theme - Layout orientation theme ('vertical' or 'horizontal').
 * @property {boolean} autoStart - Whether the app starts automatically on OS login.
 * @property {string} workspacePath - The absolute path to the active workspace.
 */
const DEFAULT_CONFIG = {
  timeout: 300000, 
  stealth: false,
  theme: 'vertical',
  autoStart: false,
  workspacePath: ''
};

/** @type {string} Stores cached configuration file path */
let configPath = '';

/**
 * Resolves and caches the absolute path to the config.json file.
 * @returns {string} The path to the configuration file.
 */
function getConfigPath() {
  if (!configPath) {
    configPath = path.join(app.getPath('userData'), 'config.json');
  }
  return configPath;
}

/**
 * Loads the user configuration from the config file, merging with defaults.
 * @returns {Object} The complete configuration object.
 */
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

/**
 * Persists the configuration object to the disk.
 * @param {Object} config - The configuration object to save.
 */
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
