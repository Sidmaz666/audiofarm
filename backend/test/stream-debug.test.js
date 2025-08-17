const request = require('supertest');
const ytdl = require('@distube/ytdl-core');

// Mock the external dependencies
jest.mock('@distube/ytdl-core');

// Import the app after mocking
const app = require('../index');

describe('Stream Route Debug Tests', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Stream Route Debugging', () => {
    it('should debug the complete flow with real-like data', async () => {
      console.log('=== Starting debug test ===');
      
      // Mock ytdl.getInfo with realistic data
      const mockVideoInfo = {
        formats: [
          {
            itag: 18,
            container: 'mp4',
            hasVideo: true,
            hasAudio: true,
            url: 'https://r4---sn-4g5e6n7s.googlevideo.com/videoplayback?expire=1234567890&id=dQw4w9WgXcQ&itag=18&source=youtube&requiressl=yes&mh=123&mm=31&mn=sn-4g5e6n7s&ms=au&mv=m&pl=24&ei=abcdefghijklmnop&susc=123&mime=video%2Fmp4&gir=yes&clen=1234567&dur=120.000&lmt=1234567890&mt=1234567890&fvip=4&c=WEB&txp=123456&sparams=expire%2Cei%2Cip%2Cipbits%2Citag%2Csource%2Crequiressl%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cpl%2Csusc%2Cmime%2Cgir%2Cclen%2Cdur%2Clmt&ipbits=0&ip=127.0.0.1&signature=ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU2OpZGEBLdrc&ratebypass=yes&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cpl%2Csusc&lsig=ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz'
          },
          {
            itag: 22,
            container: 'mp4',
            hasVideo: true,
            hasAudio: true,
            url: 'https://r4---sn-4g5e6n7s.googlevideo.com/videoplayback?expire=1234567890&id=dQw4w9WgXcQ&itag=22&source=youtube&requiressl=yes&mh=123&mm=31&mn=sn-4g5e6n7s&ms=au&mv=m&pl=24&ei=abcdefghijklmnop&susc=123&mime=video%2Fmp4&gir=yes&clen=2345678&dur=120.000&lmt=1234567890&mt=1234567890&fvip=4&c=WEB&txp=123456&sparams=expire%2Cei%2Cip%2Cipbits%2Citag%2Csource%2Crequiressl%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cpl%2Csusc%2Cmime%2Cgir%2Cclen%2Cdur%2Clmt&ipbits=0&ip=127.0.0.1&signature=ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU2OpZGEBLdrc&ratebypass=yes&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cpl%2Csusc&lsig=ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz'
          }
        ],
        videoDetails: {
          title: 'Test Video Title',
          description: 'Test video description',
          lengthSeconds: '120',
          viewCount: '1000',
          author: 'Test Author'
        }
      };

      ytdl.getInfo.mockResolvedValue(mockVideoInfo);
      console.log('✓ Mocked ytdl.getInfo successfully');

      // Mock fetch for HEAD request
      const mockHeadResponse = {
        method: 'HEAD',
        headers: {
          get: jest.fn()
            .mockReturnValueOnce('1234567') // content-length
            .mockReturnValueOnce('video/mp4') // content-type
        }
      };

      fetch.mockResolvedValueOnce(mockHeadResponse);
      console.log('✓ Mocked fetch HEAD request successfully');

      // Mock fetch for video stream
      const mockVideoStream = {
        body: {
          pipe: jest.fn((res) => {
            console.log('✓ Video stream pipe called');
            return res;
          }),
          on: jest.fn((event, callback) => {
            if (event === 'error') {
              console.log('✓ Error event handler attached');
            }
            return mockVideoStream.body;
          }),
          destroy: jest.fn(() => {
            console.log('✓ Video stream destroy called');
          })
        }
      };

      fetch.mockResolvedValueOnce(mockVideoStream);
      console.log('✓ Mocked fetch video stream successfully');

      console.log('=== Making request to /stream ===');
      
      try {
        const response = await request(app)
          .get('/stream?id=dQw4w9WgXcQ')
          .timeout(10000);

        console.log('✓ Response received:', {
          status: response.status,
          headers: response.headers,
          body: response.body
        });

        // Verify the response
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('video/mp4');
        expect(response.headers['accept-ranges']).toBe('bytes');
        expect(response.headers['content-length']).toBe('1234567');

        console.log('✓ All assertions passed');
        
      } catch (error) {
        console.error('✗ Test failed:', error.message);
        throw error;
      }
    });

    it('should debug format selection logic', async () => {
      console.log('=== Testing format selection logic ===');
      
      // Test with different format combinations
      const testCases = [
        {
          name: 'Only audio format',
          formats: [
            {
              itag: 140,
              container: 'm4a',
              hasVideo: false,
              hasAudio: true,
              url: 'https://example.com/audio.m4a'
            }
          ],
          shouldFail: true
        },
        {
          name: 'Only video format',
          formats: [
            {
              itag: 137,
              container: 'mp4',
              hasVideo: true,
              hasAudio: false,
              url: 'https://example.com/video.mp4'
            }
          ],
          shouldFail: true
        },
        {
          name: 'Mixed formats with preferred itag 18',
          formats: [
            {
              itag: 18,
              container: 'mp4',
              hasVideo: true,
              hasAudio: true,
              url: 'https://example.com/video18.mp4'
            },
            {
              itag: 22,
              container: 'mp4',
              hasVideo: true,
              hasAudio: true,
              url: 'https://example.com/video22.mp4'
            }
          ],
          shouldFail: false,
          expectedItag: 18
        }
      ];

      for (const testCase of testCases) {
        console.log(`\n--- Testing: ${testCase.name} ---`);
        
        ytdl.getInfo.mockResolvedValue({
          formats: testCase.formats
        });

        if (testCase.shouldFail) {
          const response = await request(app)
            .get('/stream?id=dQw4w9WgXcQ')
            .expect(400);

          console.log(`✓ Correctly failed with: ${response.body.error}`);
        } else {
          // Mock the HEAD request for successful cases
          fetch.mockResolvedValueOnce({
            method: 'HEAD',
            headers: {
              get: jest.fn()
                .mockReturnValueOnce('1000000')
                .mockReturnValueOnce('video/mp4')
            }
          });

          const mockVideoStream = {
            body: {
              pipe: jest.fn(),
              on: jest.fn(),
              destroy: jest.fn()
            }
          };

          fetch.mockResolvedValueOnce(mockVideoStream);

          const response = await request(app)
            .get('/stream?id=dQw4w9WgXcQ')
            .expect(200);

          console.log(`✓ Successfully handled format selection`);
          
          // Verify the correct format was selected
          if (testCase.expectedItag) {
            // This would require checking the actual format used in the response
            // For now, we just verify the request succeeded
            expect(response.status).toBe(200);
          }
        }
      }
    });

    it('should debug error handling scenarios', async () => {
      console.log('=== Testing error handling scenarios ===');
      
      const errorScenarios = [
        {
          name: 'ytdl.getInfo throws error',
          mockYtdl: () => ytdl.getInfo.mockRejectedValue(new Error('Video unavailable')),
          expectedStatus: 404,
          expectedError: 'Video formats not found'
        },
        {
          name: 'fetch HEAD request fails',
          mockYtdl: () => ytdl.getInfo.mockResolvedValue({
            formats: [{
              itag: 18,
              container: 'mp4',
              hasVideo: true,
              hasAudio: true,
              url: 'https://example.com/video.mp4'
            }]
          }),
          mockFetch: () => fetch.mockRejectedValue(new Error('Network error')),
          expectedStatus: 500,
          expectedError: 'Internal Server Error'
        }
      ];

      for (const scenario of errorScenarios) {
        console.log(`\n--- Testing: ${scenario.name} ---`);
        
        if (scenario.mockYtdl) scenario.mockYtdl();
        if (scenario.mockFetch) scenario.mockFetch();

        try {
          const response = await request(app)
            .get('/stream?id=dQw4w9WgXcQ')
            .expect(scenario.expectedStatus);

          console.log(`✓ Correctly handled error: ${response.body.error}`);
          expect(response.body.error).toBe(scenario.expectedError);
          
        } catch (error) {
          console.error(`✗ Failed to handle error scenario: ${error.message}`);
          throw error;
        }
      }
    });
  });
});
