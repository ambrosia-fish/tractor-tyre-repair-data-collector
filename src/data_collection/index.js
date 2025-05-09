/**
 * Main data collection script
 * Orchestrates the various automated data collection methods
 */

require('dotenv').config({ path: './config/.env' });
const fs = require('fs');
const path = require('path');

// Import collection methods
const googlePlacesCollector = require('./google_places_collector');
const automatedExtractor = require('./automated_extractor');
const dataReviewer = require('./data_reviewer');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Main function to orchestrate data collection
async function collectData() {
  console.log('Starting automated data collection process...');
  
  // Step 1: Collect data from Google Places API
  console.log('Collecting data from Google Places API...');
  const googlePlacesData = await googlePlacesCollector.findTractorTyreRepairCompanies();
  
  // Save Google Places data
  fs.writeFileSync(
    path.join(dataDir, 'google_places_data.json'),
    JSON.stringify(googlePlacesData, null, 2)
  );
  console.log(`Found ${googlePlacesData.length} companies from Google Places API`);
  
  // Step 2: Enhance data with automated extraction
  console.log('Enhancing data with automated extraction...');
  const enhancedData = await automatedExtractor.enhanceData(googlePlacesData);
  
  // Save enhanced data
  fs.writeFileSync(
    path.join(dataDir, 'enhanced_data.json'),
    JSON.stringify(enhancedData, null, 2)
  );
  
  // Step 3: Review data quality with automated tool
  console.log('Starting automated data quality review...');
  const finalData = await dataReviewer.reviewDataQuality(enhancedData);
  
  // Save final data
  fs.writeFileSync(
    path.join(dataDir, 'final_data.json'),
    JSON.stringify(finalData, null, 2)
  );
  
  console.log('Data collection completed successfully!');
  return finalData;
}

// Run the collection if this script is executed directly
if (require.main === module) {
  collectData()
    .then(() => console.log('Data collection process completed!'))
    .catch(err => console.error('Error in data collection process:', err));
}

module.exports = { collectData };
