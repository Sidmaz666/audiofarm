#!/usr/bin/env node

/**
 * Diagnostic script to identify issues with the /stream route
 */

const ytdl = require('@distube/ytdl-core');

console.log('🔍 Diagnosing /stream route issues...\n');

async function diagnoseIssues() {
  try {
    // Test 1: Check ytdl-core version and basic functionality
    console.log('1. Checking ytdl-core...');
    console.log(`   Version: ${ytdl.version}`);
    console.log(`   Available functions: ${Object.keys(ytdl).join(', ')}`);
    
    // Test 2: Try to get info for a known video (this might fail)
    console.log('\n2. Testing ytdl.getInfo...');
    try {
      const videoId = 'dQw4w9WgXcQ'; // Rick Roll - should be available
      console.log(`   Testing with video ID: ${videoId}`);
      
      const info = await ytdl.getInfo(videoId);
      console.log('   ✓ Successfully got video info');
      console.log(`   Video title: ${info.videoDetails?.title || 'Unknown'}`);
      console.log(`   Available formats: ${info.formats?.length || 0}`);
      
      if (info.formats && info.formats.length > 0) {
        const suitableFormats = info.formats.filter(fmt => 
          fmt.hasVideo && fmt.hasAudio && fmt.container === 'mp4'
        );
        console.log(`   Suitable formats (MP4 with video+audio): ${suitableFormats.length}`);
        
        if (suitableFormats.length > 0) {
          const preferredFormat = suitableFormats.find(fmt => fmt.itag === 18);
          if (preferredFormat) {
            console.log(`   ✓ Found preferred format (itag 18): ${preferredFormat.url.substring(0, 100)}...`);
          } else {
            console.log(`   ⚠ No itag 18 format, but ${suitableFormats.length} other suitable formats available`);
          }
        } else {
          console.log('   ❌ No suitable formats found - this explains the streaming issue!');
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Failed to get video info: ${error.message}`);
      console.log(`   This is likely the root cause of your streaming issues`);
      
      if (error.message.includes('Video unavailable')) {
        console.log('   YouTube video is unavailable or restricted');
      } else if (error.message.includes('Sign in')) {
        console.log('   YouTube requires authentication');
      } else if (error.message.includes('rate limit')) {
        console.log('   YouTube rate limiting in effect');
      } else if (error.message.includes('network')) {
        console.log('   Network connectivity issue');
      }
    }
    
    // Test 3: Check fetch functionality
    console.log('\n3. Testing fetch functionality...');
    try {
      const response = await fetch('https://httpbin.org/headers');
      const data = await response.json();
      console.log('   ✓ Fetch is working');
      console.log(`   Test response status: ${response.status}`);
    } catch (error) {
      console.log(`   ❌ Fetch failed: ${error.message}`);
    }
    
    // Test 4: Check environment
    console.log('\n4. Environment check...');
    console.log(`   Node.js version: ${process.version}`);
    console.log(`   Platform: ${process.platform}`);
    console.log(`   Architecture: ${process.arch}`);
    console.log(`   Current working directory: ${process.cwd()}`);
    
    // Test 5: Check package versions
    console.log('\n5. Package versions...');
    try {
      const packageJson = require('../package.json');
      console.log(`   ytdl-core: ${packageJson.dependencies['@distube/ytdl-core']}`);
      console.log(`   node-fetch: ${packageJson.dependencies['node-fetch']}`);
      console.log(`   express: ${packageJson.dependencies['express']}`);
    } catch (error) {
      console.log(`   ❌ Could not read package.json: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
}

// Run diagnosis
diagnoseIssues().then(() => {
  console.log('\n🏁 Diagnosis complete!');
  console.log('\n💡 Common solutions:');
  console.log('   - Update ytdl-core: npm update @distube/ytdl-core');
  console.log('   - Check YouTube video availability');
  console.log('   - Verify network connectivity');
  console.log('   - Check for YouTube API changes');
  
  process.exit(0);
}).catch(error => {
  console.error('❌ Diagnosis crashed:', error);
  process.exit(1);
});
