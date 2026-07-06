/**
 * Manages the multi-session states of local AI agents.
 */
class StateManager {
  constructor() {
    /** @type {Object.<string, {state: string, updatedAt: number}>} Holds session states */
    this.sessions = {}; 
    /** @type {function(string): void} Callback function triggered when the global state changes */
    this.onStateChange = null;
  }

  /**
   * Sets or updates the state of a specific session.
   * @param {string} sessionId - The identifier of the agent session.
   * @param {string} state - The state color ('green', 'yellow', or 'red').
   */
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

  /**
   * Scans all active sessions and removes those that have exceeded the timeout threshold.
   * @param {number} timeoutMs - Timeout limit in milliseconds.
   */
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

  /**
   * Resolves and returns the global consolidated state based on active sessions priorities.
   * Priority logic: red > yellow > green.
   * @returns {string} The resolved global state ('red', 'yellow', or 'green').
   */
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

  /**
   * Triggers the registered onStateChange callback with the latest global state.
   */
  triggerChange() {
    if (this.onStateChange) {
      this.onStateChange(this.getGlobalState());
    }
  }

  /**
   * Clears all active agent sessions and resets the global state to green.
   */
  clearAll() {
    this.sessions = {};
    this.triggerChange();
  }
}

module.exports = new StateManager();
