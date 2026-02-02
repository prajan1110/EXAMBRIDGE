/**
 * Certificate Verification Simulator
 * 
 * This tool simulates the certificate verification process with different disability types
 * to test the system's recommendations without requiring real certificates.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { simulateAIVerification } = require('./services/verificationService');
const { readDataFile, writeDataFile } = require('./utils/dataUtils');

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

// Available disability types for simulation
const disabilityTypes = [
  'visual impairment',
  'blindness',
  'low vision',
  'hearing impairment',
  'deaf',
  'mobility impairment',
  'dyslexia',
  'dyscalculia',
  'dysgraphia',
  'attention deficit disorder',
  'adhd',
  'autism spectrum disorder',
  'multiple disabilities'
];

// Generate a test certificate for a specific disability
function generateTestCertificate(disabilityType, severity = 'moderate') {
  return `
MEDICAL CERTIFICATE FOR PERSONS WITH DISABILITIES

Name: Test User (${disabilityType})
Age: 21 years
Gender: Not specified

This is to certify that I have carefully examined the above-named person.

DIAGNOSIS:
The patient has been diagnosed with ${disabilityType}.

DISABILITY ASSESSMENT:
Based on the Guidelines for Assessment of Disabilities under the Rights of Persons with Disabilities Act, 2016, the patient has:
- ${severity} difficulty that impacts academic performance
- Requires accommodations for educational activities and examinations

DISABILITY PERCENTAGE: ${severity === 'mild' ? '30' : severity === 'moderate' ? '45' : '70'}%

RECOMMENDATIONS:
1. Appropriate accessibility features for ${disabilityType}
2. Extended time for examinations where needed
3. Use of assistive technologies
4. Alternative assessment methods if required

This disability is permanent in nature.

Signature: Dr. Medical Expert
Registration No: MED12345
Hospital: Central Medical Institute
Date: ${new Date().toISOString().split('T')[0]}
  `;
}

// Simulate the verification process for a specific disability
async function simulateVerification(disabilityType, severity = 'moderate') {
  console.log(`\n${colors.bright}${colors.blue}Simulating certificate verification for:${colors.reset} ${disabilityType} (${severity})`);
  
  // Generate a test certificate
  const certificateText = generateTestCertificate(disabilityType, severity);
  
  try {
    // Use the verification service to analyze the certificate
    const verificationResult = await simulateAIVerification(certificateText, disabilityType);
    
    console.log(`${colors.green}Analysis results:${colors.reset}`);
    console.log(JSON.stringify(verificationResult, null, 2));
    
    console.log(`\n${colors.cyan}Recommended features:${colors.reset}`);
    const features = verificationResult.recommendedFeatures || [];
    features.forEach((feature, index) => {
      console.log(`  ${index + 1}. ${feature.name} (${feature.category})`);
    });
    
    return verificationResult;
  } catch (error) {
    console.error(`${colors.red}Error in simulation:${colors.reset} ${error.message}`);
    return null;
  }
}

// Save simulation results for future reference
function saveSimulationResults(results) {
  const outputPath = path.join(__dirname, 'data', 'simulation-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n${colors.green}Simulation results saved to:${colors.reset} ${outputPath}`);
}

// Main function to run simulations
async function runSimulations() {
  console.log(`${colors.bright}${colors.magenta}==== Certificate Verification Simulator ====${colors.reset}\n`);
  console.log(`This tool simulates the verification process for different disability types`);
  console.log(`to test the system's feature recommendations.\n`);
  
  // If no arguments provided, show help
  if (process.argv.length <= 2) {
    console.log(`${colors.yellow}Available options:${colors.reset}`);
    console.log(`  node simulate-verification.js all            - Run simulations for all disability types`);
    console.log(`  node simulate-verification.js list           - List all available disability types`);
    console.log(`  node simulate-verification.js <disability>   - Run simulation for a specific disability`);
    console.log(`  node simulate-verification.js <disability> <severity> - Run with specific severity (mild/moderate/severe)\n`);
    console.log(`${colors.yellow}Examples:${colors.reset}`);
    console.log(`  node simulate-verification.js dyslexia`);
    console.log(`  node simulate-verification.js "visual impairment" severe`);
    return;
  }

  // List all available disability types
  if (process.argv[2] === 'list') {
    console.log(`${colors.yellow}Available disability types for simulation:${colors.reset}`);
    disabilityTypes.forEach((type, index) => {
      console.log(`  ${index + 1}. ${type}`);
    });
    return;
  }
  
  const results = [];
  
  // Run all simulations
  if (process.argv[2] === 'all') {
    console.log(`${colors.yellow}Running simulations for all disability types...${colors.reset}\n`);
    
    for (const disabilityType of disabilityTypes) {
      const result = await simulateVerification(disabilityType);
      if (result) results.push({ disabilityType, result });
    }
  } 
  // Run a specific simulation
  else {
    const disabilityType = process.argv[2];
    const severity = process.argv[3] || 'moderate';
    
    if (!['mild', 'moderate', 'severe'].includes(severity)) {
      console.log(`${colors.red}Invalid severity: ${severity}. Using 'moderate' instead.${colors.reset}`);
    }
    
    const result = await simulateVerification(disabilityType, severity);
    if (result) results.push({ disabilityType, severity, result });
  }
  
  // Save results
  if (results.length > 0) {
    saveSimulationResults(results);
  }
}

// Run the simulations
runSimulations();