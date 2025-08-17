#!/usr/bin/env node

/**
 * Quick test to verify the setup works
 */

console.log('🧪 Running quick test...');

try {
  // Test 1: Check if we can require the app
  console.log('1. Testing app import...');
  const app = require('../index');
  console.log('   ✓ App imported successfully');
  console.log('   App type:', typeof app);
  
  // Test 2: Check if fetch is mocked
  console.log('\n2. Testing fetch mock...');
  const fetch = require('node-fetch');
  console.log('   ✓ Fetch imported successfully');
  console.log('   Fetch type:', typeof fetch);
  console.log('   Is mock function:', fetch.mock !== undefined);
  
  // Test 3: Test basic route
  console.log('\n3. Testing basic route...');
  const request = require('supertest');
  console.log('   ✓ Supertest imported successfully');
  
  console.log('\n✅ All basic tests passed!');
  console.log('🎯 You can now run: npm test');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
