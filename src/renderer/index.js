const { ipcRenderer } = require('electron');

const semaphoreEl = document.getElementById('semaphore');
const redLight = document.getElementById('light-red');
const yellowLight = document.getElementById('light-yellow');
const greenLight = document.getElementById('light-green');
const btnRotate = document.getElementById('btn-rotate');
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
  semaphoreEl.classList.remove('prompt-active');
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
  updateDynamicIcon(state);
});

ipcRenderer.on('theme-changed', (event, theme) => {
  updateTheme(theme);
});

ipcRenderer.on('show-prompt', (event, { session, question, options }) => {
  isPromptActive = true;
  semaphoreEl.classList.add('prompt-active');
  
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
  semaphoreEl.classList.remove('prompt-active');
  const promptPanel = document.getElementById('prompt-panel');
  promptPanel.classList.add('hidden');
  
  // Request configuration to restore preferred theme
  ipcRenderer.send('get-initial-state');
});

// Button Controls
btnRotate.addEventListener('click', () => {
  ipcRenderer.send('toggle-theme');
});

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

function updateDynamicIcon(state) {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  // Desenha o fundo escuro do semáforo
  ctx.fillStyle = '#1e1e1e';
  ctx.beginPath();
  ctx.arc(16, 16, 14, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Cor do LED ativo
  let color = '#00e676'; // Verde
  if (state === 'red') {
    color = '#ff1744';
  } else if (state === 'yellow') {
    color = '#ffd600';
  }

  // Brilho externo (glow)
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;

  // Desenha o LED ativo
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(16, 16, 8, 0, 2 * Math.PI);
  ctx.fill();

  // Envia a imagem gerada ao processo principal
  const dataUrl = canvas.toDataURL('image/png');
  ipcRenderer.send('update-icon', dataUrl);
}
