// Test setup file
// This file runs before each test file

// Increase timeout for tests that might take longer
jest.setTimeout(10000);

// Suppress console.log during tests unless there's an error
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Suppress console.log during tests
  console.log = jest.fn();
  // Keep console.error for debugging
  console.error = jest.fn();
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Global test utilities
global.testUtils = {
  // Helper to create mock video info
  createMockVideoInfo: (formats = []) => ({
    formats,
    videoDetails: {
      title: 'Test Video',
      description: 'Test Description',
      lengthSeconds: '120'
    }
  }),
  
  // Helper to create mock format
  createMockFormat: (overrides = {}) => ({
    itag: 18,
    container: 'mp4',
    hasVideo: true,
    hasAudio: true,
    url: 'https://example.com/video.mp4',
    ...overrides
  })
};
