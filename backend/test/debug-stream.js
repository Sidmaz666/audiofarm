#!/usr/bin/env node

/**
 * Debug script for the /stream route
 * Run this with: node test/debug-stream.js
 */

const request = require('supertest');
const express = require('express');

// Start the server
const app = require('../index');
const server = app.listen(3001);

console.log('🚀 Debug server started on port 3001');
console.log('📺 Testing /stream route...\n');

async function debugStreamRoute() {
  try {
    console.log('=== Testing /stream route ===');
    
    // Test 1: Missing video ID
    console.log('1. Testing missing video ID...');
    try {
      const response = await request(app)
        .get('/stream')
        .timeout(5000);
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, response.body);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

    // Test 2: Empty video ID
    console.log('\n2. Testing empty video ID...');
    try {
      const response = await request(app)
        .get('/stream?id=')
        .timeout(5000);
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, response.body);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

    // Test 3: Valid video ID (this will likely fail due to missing mocks)
    console.log('\n3. Testing with valid video ID...');
    try {
      const response = await request(app)
        .get('/stream?id=dQw4w9WgXcQ')
        .timeout(10000);
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Headers:`, response.headers);
      console.log(`   Response:`, response.body);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
      console.log(`   This is expected since we don't have real YouTube API access`);
    }

    // Test 4: Check server health
    console.log('\n4. Testing server health...');
    try {
      const response = await request(app)
        .get('/')
        .timeout(5000);
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Server is responding`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    // Clean up
    server.close(() => {
      console.log('\n🔒 Debug server closed');
      process.exit(0);
    });
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down...');
  server.close(() => {
    console.log('🔒 Debug server closed');
    process.exit(0);
  });
});

// Run the debug
debugStreamRoute();
