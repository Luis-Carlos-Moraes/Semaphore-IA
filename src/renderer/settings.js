const { ipcRenderer } = require('electron');

const themeSelect = document.getElementById('theme-select');
const timeoutInput = document.getElementById('timeout-input');
const stealthCheckbox = document.getElementById('stealth-checkbox');
const autostartCheckbox = document.getElementById('autostart-checkbox');
const workspaceInput = document.getElementById('workspace-input');
const btnSave = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel');

// Load configuration
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const config = await ipcRenderer.invoke('get-config');
    themeSelect.value = config.theme || 'vertical';
    timeoutInput.value = Math.round((config.timeout || 300000) / 1000);
    stealthCheckbox.checked = !!config.stealth;
    autostartCheckbox.checked = !!config.autoStart;
    workspaceInput.value = config.workspacePath || '';
  } catch (err) {
    console.error('Failed to load config', err);
  }
});

btnSave.addEventListener('click', () => {
  const timeoutVal = parseInt(timeoutInput.value, 10);
  if (isNaN(timeoutVal) || timeoutVal < 10) {
    alert('O tempo limite de inatividade deve ser de pelo menos 10 segundos.');
    return;
  }

  const updatedConfig = {
    theme: themeSelect.value,
    timeout: timeoutVal * 1000,
    stealth: stealthCheckbox.checked,
    autoStart: autostartCheckbox.checked,
    workspacePath: workspaceInput.value.trim()
  };

  ipcRenderer.send('save-config', updatedConfig);
});

btnCancel.addEventListener('click', () => {
  ipcRenderer.send('close-settings-window');
});
