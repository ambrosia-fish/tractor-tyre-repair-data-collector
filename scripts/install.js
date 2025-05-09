/**
 * Installation script
 * Sets up the necessary directories and configuration files
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions
function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Main function
async function setup() {
  console.log('\nWelcome to the Tractor Tyre Repair Data Collector setup!');
  console.log('This script will help you set up the necessary directories and configuration files.\n');
  
  // Ensure data directory exists
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory.');
  }
  
  // Check if config directory exists
  const configDir = path.join(__dirname, '../config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
    console.log('Created config directory.');
  }
  
  // Set up .env file
  const envPath = path.join(configDir, '.env');
  const exampleEnvPath = path.join(configDir, 'example.env');
  
  if (!fs.existsSync(envPath) && fs.existsSync(exampleEnvPath)) {
    const createEnv = await askQuestion('Would you like to create a .env file now? (y/n): ');
    
    if (createEnv.toLowerCase() === 'y') {
      // Copy example.env to .env
      fs.copyFileSync(exampleEnvPath, envPath);
      console.log('Created .env file from example.env.');
      
      // Ask for Google API key
      const apiKey = await askQuestion('Enter your Google API key (press Enter to skip): ');
      
      if (apiKey.trim()) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = envContent.replace('your_google_api_key_here', apiKey.trim());
        fs.writeFileSync(envPath, envContent, 'utf8');
        console.log('Added Google API key to .env file.');
      }
    }
  }
  
  // Ask about Google credentials.json
  const credentialsPath = path.join(configDir, 'credentials.json');
  if (!fs.existsSync(credentialsPath)) {
    console.log('\nTo use the Google Sheets export functionality, you need a credentials.json file.');
    console.log('You can obtain this file from the Google Cloud Console.');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Create a project or select an existing one');
    console.log('3. Enable the Google Sheets API');
    console.log('4. Create OAuth 2.0 credentials');
    console.log('5. Download the credentials.json file');
    console.log('6. Place it in the config/ directory');
  }
  
  console.log('\nSetup completed! You can now run the application with:');
  console.log('- npm run collect (for data collection)');
  console.log('- npm run process (for data processing)');
  console.log('- npm run export (for exporting to Google Sheets)');
  console.log('- npm run all (for the full pipeline)\n');
  
  rl.close();
}

// Run the setup function
setup().catch(err => console.error('Error during setup:', err));
