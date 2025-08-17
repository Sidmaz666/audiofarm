# Testing Guide for AudioFarm Backend

This directory contains comprehensive tests for the backend API, specifically focused on debugging the `/stream` route.

## Test Files

### 1. `stream.test.js` - Comprehensive Unit Tests
- Tests all error scenarios
- Tests successful streaming
- Tests range requests
- Tests format selection logic

### 2. `stream-debug.test.js` - Debug-Focused Tests
- Detailed logging for debugging
- Tests with realistic YouTube data
- Step-by-step flow verification

### 3. `debug-stream.js` - Standalone Debug Script
- Can be run independently
- Tests the actual server without mocks
- Useful for quick debugging

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Debug Tests Only
```bash
npx jest test/stream-debug.test.js
```

### Run Standalone Debug Script
```bash
node test/debug-stream.js
```

## Debugging the /stream Route

The `/stream` route might be failing for several reasons:

### 1. YouTube API Issues
- **ytdl-core version**: The `@distube/ytdl-core` package might be outdated
- **YouTube changes**: YouTube frequently changes their API, breaking ytdl-core
- **Rate limiting**: YouTube might be blocking requests

### 2. Format Selection Issues
- **No suitable formats**: The route requires formats with both video and audio
- **Container format**: Prefers MP4 containers
- **itag preference**: Tries to use itag 18 (360p MP4) first

### 3. Network Issues
- **CORS**: Frontend might not be able to access the stream
- **Headers**: Missing or incorrect response headers
- **Streaming**: Issues with piping the video stream

## Common Issues and Solutions

### Issue: "No suitable format found for streaming"
**Cause**: ytdl-core returned formats without both video and audio
**Solution**: Check if YouTube video has combined formats, or implement fallback to separate audio/video streams

### Issue: "Unable to determine content length"
**Cause**: YouTube's HEAD request failed or returned no content-length
**Solution**: Implement fallback content-length handling or skip content-length requirement

### Issue: Stream not playing in browser
**Cause**: Missing CORS headers or incorrect content-type
**Solution**: Ensure proper headers are set and CORS is configured

## Testing Strategy

1. **Start with unit tests** to verify logic
2. **Use debug tests** to see detailed flow
3. **Run standalone debug** to test real server
4. **Check browser console** for CORS/network errors
5. **Verify YouTube video availability** manually

## Mocking Strategy

The tests use Jest mocks for:
- `@distube/ytdl-core` - YouTube video info
- `node-fetch` - HTTP requests
- External dependencies

This allows testing without real YouTube API calls.

## Next Steps

1. Run the tests to identify specific failures
2. Check the debug output for detailed error information
3. Verify YouTube video availability
4. Test with different video IDs
5. Check browser network tab for actual requests
