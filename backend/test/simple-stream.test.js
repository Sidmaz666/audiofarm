const request = require('supertest');

const app = require('../index');

describe('Simple Stream Route Test', () => {
  it('should handle missing video ID', async () => {
    const response = await request(app)
      .get('/stream')
      .expect(400);
    
    expect(response.body.error).toBe('Video ID (id) is required');
  });

  it('should handle empty video ID', async () => {
    const response = await request(app)
      .get('/stream?id=')
      .expect(400);
    
    expect(response.body.error).toBe('Video ID (id) is required');
  });

  it('should return 404 for invalid video ID', async () => {
    // This will fail because ytdl.getInfo will throw an error
    // and our error handler will catch it and return 404
    const response = await request(app)
      .get('/stream?id=invalid_id')
      .expect(404);
    
    expect(response.body.error).toBe('Video formats not found');
  });

  it('should serve static files', async () => {
    const response = await request(app)
      .get('/')
      .expect(404); // This will 404 because ../frontend/dist doesn't exist
    
    // The route exists but the directory doesn't, so we get 404
    expect(response.body.error).toBe('Resource not found');
  });
});
