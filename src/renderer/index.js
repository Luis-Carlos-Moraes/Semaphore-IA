const { ipcRenderer } = require('electron');

const semaphoreEl = document.getElementById('semaphore');
const redLight = document.getElementById('light-red');
const yellowLight = document.getElementById('light-yellow');
const greenLight = document.getElementById('light-green');
const btnSettings = document.getElementById('btn-settings');
const btnClose = document.getElementById('btn-close');

// Function to update visual lights
function updateLights(state) {
  redLight.classList.remove('active');
  yellowLight.classList.remove('active');
  greenLight.classList.remove('active');

  if (state === 'red') {
    redLight.classList.add('active');
  } else if (state === 'yellow') {
    yellowLight.classList.add('active');
  } else {
    greenLight.classList.add('active');
  }
}

let isPromptActive = false;

// Function to update orientation/theme
function updateTheme(theme) {
  if (isPromptActive) return; // Prevent layout updates during prompt
  if (theme === 'horizontal') {
    semaphoreEl.classList.remove('vertical');
    semaphoreEl.classList.add('horizontal');
  } else {
    semaphoreEl.classList.remove('horizontal');
    semaphoreEl.classList.add('vertical');
  }
}

// IPC Listeners
ipcRenderer.on('state-changed', (event, state) => {
  updateLights(state);
});

ipcRenderer.on('theme-changed', (event, theme) => {
  updateTheme(theme);
});

ipcRenderer.on('show-prompt', (event, { session, question, options }) => {
  isPromptActive = true;
  
  // Set to vertical temporarily to look nice with prompt panel on the right
  semaphoreEl.classList.remove('horizontal');
  semaphoreEl.classList.add('vertical');

  const promptPanel = document.getElementById('prompt-panel');
  const promptQuestion = document.getElementById('prompt-question');
  const promptButtons = document.getElementById('prompt-buttons');

  promptQuestion.textContent = question;
  promptButtons.innerHTML = '';

  options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'prompt-btn no-drag';
    btn.textContent = option.trim();
    btn.addEventListener('click', () => {
      ipcRenderer.send('submit-prompt-response', { session, option: option.trim() });
    });
    promptButtons.appendChild(btn);
  });

  promptPanel.classList.remove('hidden');
});

ipcRenderer.on('hide-prompt', () => {
  isPromptActive = false;
  const promptPanel = document.getElementById('prompt-panel');
  promptPanel.classList.add('hidden');
  
  // Request configuration to restore preferred theme
  ipcRenderer.send('get-initial-state');
});

// Button Controls
btnSettings.addEventListener('click', () => {
  ipcRenderer.send('open-settings');
});

btnClose.addEventListener('click', () => {
  ipcRenderer.send('close-widget');
});

// Request initial state and configuration
window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.send('get-initial-state');
});
