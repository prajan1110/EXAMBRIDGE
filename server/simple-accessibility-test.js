/**
 * Simple accessibility features test
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const http = require('http');

const API_URL = 'http://localhost:3001';

// Test user data
const testUser = {
  name: 'Test Disabled User',
  email: `test.user.${Date.now()}@example.com`,
  password: 'Password123!',
  role: 'student',
  disabilityType: 'dyslexia'
};

console.log('=== ACCESSIBILITY FEATURES TEST ===');
console.log(`\nTesting with user: ${testUser.email}`);

// First check if server is running
console.log('\nChecking server status...');

// Try a direct test to the root endpoint which should be available in any Express server
const req = http.get(`${API_URL}`, (res) => {
  console.log(`Server is running. Status code: ${res.statusCode}`);
  
  // Continue with tests
  runTests();
});

req.on('error', (error) => {
  console.error(`✗ Error connecting to server: ${error.message}`);
  console.error('Make sure the server is running on port 3001');
  console.error('\nTrying to continue tests anyway in case server is running but has no root endpoint...');
  runTests();
});

// Set a timeout for the request
req.setTimeout(3000, () => {
  console.error('✗ Server connection timed out');
  console.error('Make sure the server is running on port 3001');
  console.error('\nTrying to continue tests anyway in case server is just slow...');
  runTests();
});

// Function to run all the tests
function runTests() {
  // Step 1: Register a test user
  console.log('\nStep 1: Registering test user...');
  axios.post(`${API_URL}/api/auth/signup`, testUser)
    .then(response => {
      console.log('✓ User registered successfully');
      console.log('User ID:', response.data.user?.id || 'Unknown');
      console.log('Token:', response.data.token?.substring(0, 20) + '...' || 'Unknown');
      
      // Get the token for further requests
      const token = response.data.token;
      
      // Step 2: Update user profile with accessibility needs
      console.log('\nStep 2: Updating user profile...');
      return axios.put(
        `${API_URL}/api/auth/profile`,
        { 
          disabilityType: 'dyslexia',
          accessibilityFeatures: {
            tts: true,
            dyslexicFont: true,
            extraTime: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      .then(response => {
        console.log('✓ Profile updated successfully');
        console.log(JSON.stringify(response.data, null, 2));
        
        // Step 3: Get user profile with accessibility features
        console.log('\nStep 3: Getting user profile with accessibility features...');
        return axios.get(
          `${API_URL}/api/auth/me`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
      })
      .then(response => {
        console.log('✓ Retrieved user profile with accessibility features');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
      });
    })
    .catch(error => {
      console.error('✗ Test failed:');
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error('Response:', error.response.data);
      } else {
        console.error(error.message);
      }
    });
}