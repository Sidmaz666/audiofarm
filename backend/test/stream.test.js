const request = require('supertest');
const express = require('express');
const ytdl = require('@distube/ytdl-core');

// Mock the external dependencies
jest.mock('@distube/ytdl-core');

// Import the app after mocking
const app = require('../index');

describe('/stream route tests', () => {
  let server;

  beforeAll(() => {
    // Start the server for testing
    server = app.listen(0); // Use port 0 to get a random available port
  });

  afterAll((done) => {
    // Clean up server
    server.close(done);
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /stream', () => {
    it('should return 400 when video ID is missing', async () => {
      const response = await request(app)
        .get('/stream')
        .expect(400);

      expect(response.body).toEqual({
        error: 'Video ID (id) is required'
      });
    });

    it('should return 400 when video ID is empty', async () => {
      const response = await request(app)
        .get('/stream?id=')
        .expect(400);

      expect(response.body).toEqual({
        error: 'Video ID (id) is required'
      });
    });

    it('should return 404 when video info cannot be fetched', async () => {
      // Mock ytdl.getInfo to throw an error
      ytdl.getInfo.mockRejectedValue(new Error('Video not found'));

      const response = await request(app)
        .get('/stream?id=dQw4w9WgXcQ')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Video formats not found'
      });
    });

    it('should return 400 when no suitable format is found', async () => {
      // Mock ytdl.getInfo to return video info without suitable formats
      ytdl.getInfo.mockResolvedValue({
        formats: [
          {
            itag: 1,
            container: 'webm',
            hasVideo: true,
            hasAudio: false
          }
        ]
      });

      const response = await request(app)
        .get('/stream?id=dQw4w9WgXcQ')
        .expect(400);

      expect(response.body).toEqual({
        error: 'No suitable format found for streaming'
      });
    });

    it('should return 500 when content length cannot be determined', async () => {
      // Mock ytdl.getInfo to return valid video info
      ytdl.getInfo.mockResolvedValue({
        formats: [
          {
            itag: 18,
            container: 'mp4',
            hasVideo: true,
            hasAudio: true,
            url: 'https://example.com/video.mp4'
          }
        ]
      });

      // Mock fetch to return response without content-length header
      fetch.mockResolvedValue({
        method: 'HEAD',
        headers: {
          get: jest.fn().mockReturnValue(null) // No content-length
        }
      });

      const response = await request(app)
        .get('/stream?id=dQw4w9WgXcQ')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Unable to determine content length'
      });
    });

    it('should stream video successfully without range request', async () => {
      const mockVideoInfo = {
        formats: [
          {
            itag: 18,
            container: 'mp4',
            hasVideo: true,
            hasAudio: true,
            url: 'https://example.com/video.mp4'
          }
        ]
      };

      const mockVideoStream = {
        body: {
          pipe: jest.fn(),
          on: jest.fn(),
          destroy: jest.fn()
        }
      };

      // Mock ytdl.getInfo
      ytdl.getInfo.mockResolvedValue(mockVideoInfo);

      // Mock fetch for HEAD request
      fetch.mockResolvedValueOnce({
        method: 'HEAD',
        headers: {
          get: jest.fn()
            .mockReturnValueOnce('1000000') // content-length
            .mockReturnValueOnce('video/mp4') // content-type
        }
      });

      // Mock fetch for video stream
      fetch.mockResolvedValueOnce(mockVideoStream);

      const response = await request(app)
        .get('/stream?id=dQw4w9WgXcQ')
        .expect(200);

      // Verify headers are set correctly
      expect(response.headers['content-type']).toBe('video/mp4');
      expect(response.headers['accept-ranges']).toBe('bytes');
      expect(response.headers['cache-control']).toBe('public, max-age=31536000');
      expect(response.headers['connection']).toBe('keep-alive');
      expect(response.headers['content-disposition']).toBe('inline');
      expect(response.headers['content-length']).toBe('1000000');
    });

    it('should handle range requests correctly', async () => {
      const mockVideoInfo = {
        formats: [
          {
            itag: 18,
            container: 'mp4',
            hasVideo: true,
            hasAudio: true,
            url: 'https://example.com/video.mp4'
          }
        ]
      };

      const mockVideoStream = {
        body: {
          pipe: jest.fn(),
          on: jest.fn(),
          destroy: jest.fn()
        }
      };

      // Mock ytdl.getInfo
      ytdl.getInfo.mockResolvedValue(mockVideoInfo);

      // Mock fetch for HEAD request
      fetch.mockResolvedValueOnce({
        method: 'HEAD',
        headers: {
          get: jest.fn()
            .mockReturnValueOnce('1000000') // content-length
            .mockReturnValueOnce('video/mp4') // content-type
        }
      });

      // Mock fetch for video stream with range
      fetch.mockResolvedValueOnce(mockVideoStream);

      const response = await request(app)
        .get('/stream?id=dQw4w9WgXcQ')
        .set('Range', 'bytes=0-999999')
        .expect(206);

      // Verify range response headers
      expect(response.headers['content-range']).toBe('bytes 0-999999/1000000');
      expect(response.headers['content-length']).toBe('1000000');
    });

    it('should return 416 for invalid range requests', async () => {
      const mockVideoInfo = {
        formats: [
          {
            itag: 18,
            container: 'mp4',
            hasVideo: true,
            hasAudio: true,
            url: 'https://example.com/video.mp4'
          }
        ]
      };

      // Mock ytdl.getInfo
      ytdl.getInfo.mockResolvedValue(mockVideoInfo);

      // Mock fetch for HEAD request
      fetch.mockResolvedValueOnce({
        method: 'HEAD',
        headers: {
          get: jest.fn()
            .mockReturnValueOnce('1000000') // content-length
            .mockReturnValueOnce('video/mp4') // content-type
        }
      });

      const response = await request(app)
        .get('/stream?id=dQw4w9WgXcQ')
        .set('Range', 'bytes=2000000-3000000') // Range beyond content length
        .expect(416);

      expect(response.body).toEqual({
        error: 'Requested range not satisfiable'
      });
    });

    it('should handle video stream errors gracefully', async () => {
      const mockVideoInfo = {
        formats: [
          {
            itag: 18,
            container: 'mp4',
            hasVideo: true,
            hasAudio: true,
            url: 'https://example.com/video.mp4'
          }
        ]
      };

      const mockVideoStream = {
        body: {
          pipe: jest.fn(),
          on: jest.fn((event, callback) => {
            if (event === 'error') {
              // Simulate error after a short delay
              setTimeout(() => callback(new Error('Stream error')), 10);
            }
          }),
          destroy: jest.fn()
        }
      };

      // Mock ytdl.getInfo
      ytdl.getInfo.mockResolvedValue(mockVideoInfo);

      // Mock fetch for HEAD request
      fetch.mockResolvedValueOnce({
        method: 'HEAD',
        headers: {
          get: jest.fn()
            .mockReturnValueOnce('1000000') // content-length
            .mockReturnValueOnce('video/mp4') // content-type
        }
      });

      // Mock fetch for video stream
      fetch.mockResolvedValueOnce(mockVideoStream);

      // This test might be flaky due to timing, but it tests error handling
      const response = await request(app)
        .get('/stream?id=dQw4w9WgXcQ')
        .timeout(5000); // 5 second timeout

      // The response should still be successful initially
      expect(response.status).toBe(200);
    });
  });

  describe('Error handling', () => {
    it('should handle ytdl errors gracefully', async () => {
      // Mock ytdl.getInfo to throw a specific error
      ytdl.getInfo.mockRejectedValue(new Error('Network error'));

      const response = await request(app)
        .get('/stream?id=dQw4w9WgXcQ')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Video formats not found'
      });
    });

    it('should handle fetch errors gracefully', async () => {
      // Mock ytdl.getInfo to return valid video info
      ytdl.getInfo.mockResolvedValue({
        formats: [
          {
            itag: 18,
            container: 'mp4',
            hasVideo: true,
            hasAudio: true,
            url: 'https://example.com/video.mp4'
          }
        ]
      });

      // Mock fetch to throw an error
      fetch.mockRejectedValue(new Error('Network fetch error'));

      const response = await request(app)
        .get('/stream?id=dQw4w9WgXcQ')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Internal Server Error'
      });
    });
  });
});
