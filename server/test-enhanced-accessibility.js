/**
 * Test file for enhanced accessibility features
 * Tests keyboard navigation, text highlighting, word spacing, and color themes
 */

require('dotenv').config();
const axios = require('axios');
const puppeteer = require('puppeteer');
const { chromium } = require('playwright');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const APP_URL = process.env.APP_URL || 'http://localhost:8080';
let authToken = '';
let userId = '';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Helper function to log steps
const logStep = (step, message) => {
  console.log(`${colors.bright}${colors.blue}Step ${step}:${colors.reset} ${message}`);
};

// Helper function to log results
const logResult = (message, success = true) => {
  const color = success ? colors.green : colors.red;
  const prefix = success ? '✓ SUCCESS' : '✗ FAILED';
  console.log(`  ${color}${prefix}:${colors.reset} ${message}`);
};

// Helper function to log section headers
const logSection = (message) => {
  console.log(`\n${colors.bright}${colors.magenta}=== ${message} ===${colors.reset}\n`);
};

// Step 1: Register a test user with disability
async function registerTestUser() {
  logStep(1, 'Registering test user with disability');
  
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      name: 'Enhanced A11y Test User',
      email: `a11y.test.${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'student',
      hasDisability: true,
      disabilityType: 'dyslexia'
    });
    
    authToken = response.data.token;
    userId = response.data.userId;
    
    logResult(`User registered successfully with ID: ${userId}`);
    return true;
  } catch (error) {
    logResult(`Registration failed: ${error.response?.data?.message || error.message}`, false);
    return false;
  }
}

// Step 2: Test the new accessibility features via API
async function testNewAccessibilityFeatures() {
  logStep(2, 'Testing new accessibility features via API');
  
  try {
    // Get current features
    const getResponse = await axios.get(
      `${API_URL}/api/features`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    // Check if new features exist in the response
    const features = getResponse.data.features;
    
    const newFeaturesExist = 
      'textHighlighter' in features && 
      'wordSpacing' in features && 
      'colorTheme' in features && 
      'lineFocusMode' in features && 
      'screenMagnifier' in features && 
      'voiceCommands' in features;
    
    if (!newFeaturesExist) {
      logResult('New features not found in API response', false);
      return false;
    }
    
    // Update features with new values
    const updateResponse = await axios.put(
      `${API_URL}/api/features`,
      {
        features: {
          textHighlighter: true,
          wordSpacing: 3,
          colorTheme: 'protanopia',
          lineFocusMode: true,
          screenMagnifier: true,
          voiceCommands: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    // Verify the update was successful
    if (updateResponse.status !== 200) {
      logResult(`Feature update failed with status: ${updateResponse.status}`, false);
      return false;
    }
    
    // Get updated features
    const verifyResponse = await axios.get(
      `${API_URL}/api/features`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    const updatedFeatures = verifyResponse.data.features;
    
    // Check if the features were actually updated
    const featuresUpdated = 
      updatedFeatures.textHighlighter === true && 
      updatedFeatures.wordSpacing === 3 && 
      updatedFeatures.colorTheme === 'protanopia' && 
      updatedFeatures.lineFocusMode === true &&
      updatedFeatures.screenMagnifier === true && 
      updatedFeatures.voiceCommands === true;
    
    if (!featuresUpdated) {
      logResult('Features were not updated correctly', false);
      return false;
    }
    
    logResult('Successfully tested new accessibility features via API');
    return true;
  } catch (error) {
    logResult(`API test failed: ${error.response?.data?.message || error.message}`, false);
    return false;
  }
}

// Step 3: Test keyboard navigation in the quiz
async function testKeyboardNavigation() {
  logStep(3, 'Testing keyboard navigation in quiz');
  
  try {
    const browser = await puppeteer.launch({
      headless: false, // Set to true for CI environments
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the login page
    await page.goto(`${APP_URL}/auth`);
    
    // Login with the test user
    await page.type('input[type="email"]', `a11y.test.${Date.now()}@example.com`);
    await page.type('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForNavigation();
    
    // Navigate to a quiz page
    await page.goto(`${APP_URL}/student/quiz/1`);
    await page.waitForSelector('.quiz-container');
    
    // Test keyboard navigation
    // Tab to the first quiz option
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if the first option is focused
    const focusedElementType = await page.evaluate(() => {
      return document.activeElement.classList.contains('quiz-option');
    });
    
    if (!focusedElementType) {
      logResult('Keyboard focus is not on quiz option', false);
      await browser.close();
      return false;
    }
    
    // Press down arrow to move to next option
    await page.keyboard.press('ArrowDown');
    
    // Check if the second option is now focused
    const secondOptionFocused = await page.evaluate(() => {
      return document.activeElement.classList.contains('quiz-option') && 
             document.activeElement.textContent.includes('B.');
    });
    
    if (!secondOptionFocused) {
      logResult('Arrow key navigation not working for quiz options', false);
      await browser.close();
      return false;
    }
    
    // Select the current option with Enter key
    await page.keyboard.press('Enter');
    
    // Check if the option was selected
    const optionSelected = await page.evaluate(() => {
      return document.activeElement.getAttribute('aria-selected') === 'true';
    });
    
    if (!optionSelected) {
      logResult('Enter key not selecting quiz options', false);
      await browser.close();
      return false;
    }
    
    // Tab to the Next button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if the Next button is focused
    const nextButtonFocused = await page.evaluate(() => {
      return document.activeElement.textContent.includes('Next');
    });
    
    if (!nextButtonFocused) {
      logResult('Tab navigation to Next button not working', false);
      await browser.close();
      return false;
    }
    
    // Press the Next button
    await page.keyboard.press('Enter');
    
    // Check if we moved to the next question
    const movedToNextQuestion = await page.evaluate(() => {
      return document.querySelector('.quiz-progress').textContent.includes('Question 2');
    });
    
    if (!movedToNextQuestion) {
      logResult('Next button not functioning with keyboard', false);
      await browser.close();
      return false;
    }
    
    logResult('Successfully tested keyboard navigation in quiz');
    await browser.close();
    return true;
  } catch (error) {
    logResult(`Keyboard navigation test failed: ${error.message}`, false);
    return false;
  }
}

// Step 4: Test visual accessibility features
async function testVisualAccessibilityFeatures() {
  logStep(4, 'Testing visual accessibility features');
  
  try {
    // Using Playwright for more advanced test capabilities
    const browser = await chromium.launch({ 
      headless: false // Set to true for CI environments
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to the login page
    await page.goto(`${APP_URL}/auth`);
    
    // Login with the test user
    await page.fill('input[type="email"]', `a11y.test.${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForNavigation();
    
    // Open accessibility toolbar
    await page.click('button[aria-label="Accessibility Settings"]');
    await page.waitForSelector('.popover-content');
    
    // Test text highlighter
    await page.click('#text-highlighter');
    
    // Navigate to a quiz
    await page.goto(`${APP_URL}/student/quiz/1`);
    await page.waitForSelector('.quiz-container');
    
    // Check if text highlighter is applied
    const highlighterApplied = await page.evaluate(() => {
      return document.documentElement.classList.contains('text-highlighter-enabled');
    });
    
    if (!highlighterApplied) {
      logResult('Text highlighter not applied', false);
      await browser.close();
      return false;
    }
    
    // Test word spacing
    await page.goto(`${APP_URL}/auth`);
    await page.click('button[aria-label="Accessibility Settings"]');
    
    // Set word spacing to 5px
    await page.waitForSelector('#word-spacing');
    await page.click('#word-spacing');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    
    // Navigate to a quiz
    await page.goto(`${APP_URL}/student/quiz/1`);
    
    // Check if word spacing is applied
    const wordSpacingApplied = await page.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);
      return style.getPropertyValue('--word-spacing') !== '0px';
    });
    
    if (!wordSpacingApplied) {
      logResult('Word spacing not applied', false);
      await browser.close();
      return false;
    }
    
    // Test color theme
    await page.goto(`${APP_URL}/auth`);
    await page.click('button[aria-label="Accessibility Settings"]');
    
    // Set color theme to deuteranopia
    await page.waitForSelector('#color-theme');
    await page.click('#color-theme');
    await page.click('text=Deuteranopia');
    
    // Navigate to a quiz
    await page.goto(`${APP_URL}/student/quiz/1`);
    
    // Check if color theme is applied
    const colorThemeApplied = await page.evaluate(() => {
      return document.documentElement.classList.contains('theme-deuteranopia');
    });
    
    if (!colorThemeApplied) {
      logResult('Color theme not applied', false);
      await browser.close();
      return false;
    }
    
    logResult('Successfully tested visual accessibility features');
    await browser.close();
    return true;
  } catch (error) {
    logResult(`Visual features test failed: ${error.message}`, false);
    return false;
  }
}

// Main test function
async function runTests() {
  logSection('ENHANCED ACCESSIBILITY FEATURES TEST');
  
  console.log(`${colors.yellow}Testing API at: ${API_URL}${colors.reset}`);
  console.log(`${colors.yellow}Testing App at: ${APP_URL}${colors.reset}`);
  
  try {
    // Check if server is running
    await axios.get(`${API_URL}/api/health`);
    
    // Run test steps
    const userRegistered = await registerTestUser();
    if (!userRegistered) {
      throw new Error('Failed to register test user, aborting tests');
    }
    
    await testNewAccessibilityFeatures();
    await testKeyboardNavigation();
    await testVisualAccessibilityFeatures();
    
    logSection('TEST SUMMARY');
    console.log(`${colors.green}All tests completed!${colors.reset}`);
  } catch (error) {
    logSection('TEST FAILED');
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    }
    
    process.exit(1);
  }
}

// Run the tests
runTests();