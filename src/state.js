class StateManager {
  constructor() {
    this.sessions = {}; // maps: sessionId -> { state, updatedAt }
    this.onStateChange = null;
  }

  setSessionState(sessionId, state) {
    if (!sessionId) {
      sessionId = 'default';
    }
    
    // Normalize state
    state = (state || 'green').toLowerCase();
    if (!['green', 'yellow', 'red'].includes(state)) {
      state = 'green';
    }

    this.sessions[sessionId] = {
      state,
      updatedAt: Date.now()
    };

    this.triggerChange();
  }

  checkTimeouts(timeoutMs) {
    const now = Date.now();
    let changed = false;
    
    for (const [sessionId, session] of Object.entries(this.sessions)) {
      if (now - session.updatedAt > timeoutMs) {
        delete this.sessions[sessionId];
        changed = true;
      }
    }

    if (changed) {
      this.triggerChange();
    }
  }

  getGlobalState() {
    const activeSessions = Object.values(this.sessions);
    if (activeSessions.length === 0) {
      return 'green';
    }

    // Check priorities: red > yellow > green
    const states = activeSessions.map(s => s.state);
    if (states.includes('red')) {
      return 'red';
    }
    if (states.includes('yellow')) {
      return 'yellow';
    }
    return 'green';
  }

  triggerChange() {
    if (this.onStateChange) {
      this.onStateChange(this.getGlobalState());
    }
  }

  clearAll() {
    this.sessions = {};
    this.triggerChange();
  }
}

module.exports = new StateManager();
