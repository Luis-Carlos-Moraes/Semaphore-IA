const path = require('path');
const fs = require('fs');

const tempDir = path.join(__dirname, 'temp-config');

// Mock electron before importing config.js
jest.mock('electron', () => {
  const path = require('path');
  return {
    app: {
      getPath: jest.fn(() => path.join(__dirname, 'temp-config'))
    }
  };
});

const configManager = require('../src/config');

describe('ConfigManager', () => {
  // Clean up any test config files/directories before and after
  const cleanTempDir = () => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  };

  beforeEach(() => {
    cleanTempDir();
  });

  afterAll(() => {
    cleanTempDir();
  });

  test('should return default config if config file does not exist', () => {
    const config = configManager.loadConfig();
    expect(config).toEqual(configManager.DEFAULT_CONFIG);
  });

  test('should save configuration successfully and load it back', () => {
    const newConfig = {
      timeout: 120000,
      stealth: true,
      theme: 'horizontal',
      autoStart: true,
      workspacePath: ''
    };

    configManager.saveConfig(newConfig);

    // Verify config file was created physically
    const filePath = path.join(tempDir, 'config.json');
    expect(fs.existsSync(filePath)).toBe(true);

    // Load configuration back
    const loadedConfig = configManager.loadConfig();
    expect(loadedConfig).toEqual(newConfig);
  });

  test('should merge loaded config with default config when properties are missing', () => {
    const incompleteConfig = {
      theme: 'horizontal'
    };

    configManager.saveConfig(incompleteConfig);

    const loadedConfig = configManager.loadConfig();
    
    // It should have the saved theme and the default values for the rest
    expect(loadedConfig.theme).toBe('horizontal');
    expect(loadedConfig.timeout).toBe(configManager.DEFAULT_CONFIG.timeout);
    expect(loadedConfig.stealth).toBe(configManager.DEFAULT_CONFIG.stealth);
    expect(loadedConfig.autoStart).toBe(configManager.DEFAULT_CONFIG.autoStart);
    expect(loadedConfig.workspacePath).toBe(configManager.DEFAULT_CONFIG.workspacePath);
  });
});
