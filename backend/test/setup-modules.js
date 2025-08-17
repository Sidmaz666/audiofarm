// Setup file to handle module mocking
// This runs before Jest loads any modules

// Mock node-fetch globally for all tests
jest.mock('node-fetch', () => {
  const mockFetch = jest.fn();
  
  // Mock response object
  const createMockResponse = (overrides = {}) => ({
    status: 200,
    ok: true,
    headers: {
      get: jest.fn().mockReturnValue(null),
      ...overrides.headers
    },
    body: {
      pipe: jest.fn(),
      on: jest.fn(),
      destroy: jest.fn(),
      ...overrides.body
    },
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue(''),
    ...overrides
  });

  // Default mock implementation
  mockFetch.mockImplementation(() => Promise.resolve(createMockResponse()));

  // Helper to create specific responses
  mockFetch.mockResolvedValue = (response) => {
    mockFetch.mockImplementation(() => Promise.resolve(response));
    return mockFetch;
  };

  mockFetch.mockRejectedValue = (error) => {
    mockFetch.mockImplementation(() => Promise.reject(error));
    return mockFetch;
  };

  // Mock the default export
  mockFetch.default = mockFetch;
  
  return mockFetch;
});

// Make fetch available globally for tests
global.fetch = require('node-fetch');
