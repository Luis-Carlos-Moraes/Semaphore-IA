const fs = require('fs');
const path = require('path');
const os = require('os');

class IdeWatcher {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.brainPath = this.getBrainPath();
    this.currentTailedFile = null;
    this.pollInterval = null;
    this.tailInterval = null;
    this.lastSize = 0;
  }

  getBrainPath() {
    const homeDir = os.homedir();
    return path.join(homeDir, '.gemini', 'antigravity-ide', 'brain');
  }

  start() {
    console.log(`[IDE Watcher] Starting native polling watcher on: ${this.brainPath}`);
    this.ensureBrainPathAndWatch();
  }

  ensureBrainPathAndWatch() {
    // Poll the directory every 2 seconds to find the newest transcript
    this.pollInterval = setInterval(() => {
      if (!fs.existsSync(this.brainPath)) return;
      this.findAndTailNewestTranscript();
    }, 2000);
  }

  findAndTailNewestTranscript() {
    let newestFile = null;
    let newestTime = 0;

    try {
      const convDirs = fs.readdirSync(this.brainPath);
      for (const convDir of convDirs) {
        const transcriptPath = path.join(this.brainPath, convDir, '.system_generated', 'logs', 'transcript.jsonl');
        if (fs.existsSync(transcriptPath)) {
          const stats = fs.statSync(transcriptPath);
          if (stats.mtimeMs > newestTime) {
            newestTime = stats.mtimeMs;
            newestFile = transcriptPath;
          }
        }
      }

      if (newestFile && newestFile !== this.currentTailedFile) {
        this.tailFile(newestFile);
      }
    } catch (err) {
      console.error('[IDE Watcher] Error reading brain path:', err);
    }
  }

  tailFile(filePath) {
    if (this.tailInterval) {
      clearInterval(this.tailInterval);
    }

    this.currentTailedFile = filePath;
    console.log(`[IDE Watcher] Tailing active conversation: ${filePath}`);

    try {
      this.lastSize = fs.statSync(filePath).size;
    } catch (e) {
      this.lastSize = 0;
    }

    // Poll the file for new content every 500ms
    this.tailInterval = setInterval(() => {
      try {
        if (!fs.existsSync(filePath)) return;
        
        const fd = fs.openSync(filePath, 'r');
        const stats = fs.fstatSync(fd);
        
        if (stats.size > this.lastSize) {
          const buffer = Buffer.alloc(stats.size - this.lastSize);
          fs.readSync(fd, buffer, 0, buffer.length, this.lastSize);
          this.lastSize = stats.size;
          fs.closeSync(fd);
          
          const newText = buffer.toString('utf8');
          const lines = newText.split('\n');
          for (const line of lines) {
            this.processTranscriptLine(line);
          }
        } else {
          fs.closeSync(fd);
          if (stats.size < this.lastSize) {
            // File was truncated or reset
            this.lastSize = stats.size;
          }
        }
      } catch (err) {
        // Ignore read errors
      }
    }, 500);
  }

  processTranscriptLine(line) {
    try {
      if (!line.trim()) return;
      const event = JSON.parse(line);

      const session = path.basename(path.dirname(path.dirname(path.dirname(this.currentTailedFile))));

      console.log(`[IDE Watcher] Event Detected: ${event.type}`);

      if (event.type === 'USER_INPUT') {
        this.stateManager.setSessionState(session, 'yellow');
      } 
      else if (event.type === 'PLANNER_RESPONSE') {
        if (event.tool_calls && event.tool_calls.length > 0) {
          this.stateManager.setSessionState(session, 'red');
        }
        
        if (event.status === 'DONE' && (!event.tool_calls || event.tool_calls.length === 0)) {
          this.stateManager.setSessionState(session, 'green');
        }
      }
      else {
        // Any other event (like tool responses VIEW_FILE, RUN_COMMAND)
        if (event.source === 'MODEL' && event.type !== 'PLANNER_RESPONSE') {
          if (event.status === 'DONE' || event.status === 'ERROR') {
            // A ferramenta terminou (ou falhou), o agente volta a pensar
            this.stateManager.setSessionState(session, 'yellow');
          } else {
            // A ferramenta está rodando ou aguardando permissão do usuário
            this.stateManager.setSessionState(session, 'red');
          }
        }
      }

      const activeSess = JSON.stringify(this.stateManager.sessions);
      console.log(`[IDE Watcher] GLOBAL STATE: ${this.stateManager.getGlobalState()} | SESSIONS: ${activeSess}`);
    } catch (err) {
      // Ignore parse errors
    }
  }

  stop() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.tailInterval) clearInterval(this.tailInterval);
  }
}

module.exports = IdeWatcher;
