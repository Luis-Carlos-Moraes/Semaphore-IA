const stateManager = require('../src/state');

describe('StateManager', () => {
  beforeEach(() => {
    stateManager.clearAll();
    stateManager.onStateChange = null;
  });

  test('should return green as global state initially when no sessions exist', () => {
    expect(stateManager.getGlobalState()).toBe('green');
  });

  test('should set session state correctly', () => {
    stateManager.setSessionState('session1', 'yellow');
    expect(stateManager.sessions['session1']).toBeDefined();
    expect(stateManager.sessions['session1'].state).toBe('yellow');
    expect(typeof stateManager.sessions['session1'].updatedAt).toBe('number');
  });

  test('should normalize unknown states to green', () => {
    stateManager.setSessionState('session1', 'invalid-state');
    expect(stateManager.sessions['session1'].state).toBe('green');
  });

  test('should resolve global state priority: red > yellow > green', () => {
    // 1. Single green session
    stateManager.setSessionState('s1', 'green');
    expect(stateManager.getGlobalState()).toBe('green');

    // 2. Yellow overrides green
    stateManager.setSessionState('s2', 'yellow');
    expect(stateManager.getGlobalState()).toBe('yellow');

    // 3. Red overrides yellow
    stateManager.setSessionState('s3', 'red');
    expect(stateManager.getGlobalState()).toBe('red');

    // 4. Removing red (or changing state) returns to yellow
    stateManager.setSessionState('s3', 'green');
    expect(stateManager.getGlobalState()).toBe('yellow');
  });

  test('should trigger onStateChange callback when state changes', () => {
    const mockCallback = jest.fn();
    stateManager.onStateChange = mockCallback;

    stateManager.setSessionState('s1', 'yellow');
    expect(mockCallback).toHaveBeenCalledWith('yellow');

    stateManager.setSessionState('s1', 'red');
    expect(mockCallback).toHaveBeenCalledWith('red');
  });

  test('should clear sessions and trigger onStateChange in clearAll', () => {
    const mockCallback = jest.fn();
    stateManager.setSessionState('s1', 'yellow');
    
    stateManager.onStateChange = mockCallback;
    stateManager.clearAll();

    expect(stateManager.getGlobalState()).toBe('green');
    expect(mockCallback).toHaveBeenCalledWith('green');
  });

  test('should clear timeout sessions in checkTimeouts', () => {
    const mockCallback = jest.fn();
    
    // Set a session
    stateManager.setSessionState('s1', 'red');
    stateManager.onStateChange = mockCallback;
    
    // Manually backdate the session's updatedAt time
    stateManager.sessions['s1'].updatedAt = Date.now() - 5000; // 5 seconds ago
    
    // Check timeouts with 3 seconds threshold -> should clean up s1
    stateManager.checkTimeouts(3000);
    expect(stateManager.sessions['s1']).toBeUndefined();
    expect(stateManager.getGlobalState()).toBe('green');
    expect(mockCallback).toHaveBeenCalledWith('green');
  });

  test('should keep active sessions within timeout in checkTimeouts', () => {
    stateManager.setSessionState('s1', 'red');
    
    // Check timeouts with 5 seconds threshold -> should keep s1 (it was just updated)
    stateManager.checkTimeouts(5000);
    expect(stateManager.sessions['s1']).toBeDefined();
    expect(stateManager.getGlobalState()).toBe('red');
  });
});
