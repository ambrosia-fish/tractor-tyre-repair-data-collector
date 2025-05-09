/**
 * Main application entry point
 * Runs the full data collection, processing, and export pipeline
 */

require('dotenv').config({ path: './config/.env' });
const { collectData } = require('./data_collection/index');
const { processData } = require('./data_processing/index');
const { exportToGoogleSheets } = require('./google_sheets/export');

// Main function to run the entire pipeline
async function runPipeline() {
  console.log('=================================');
  console.log('TRACTOR TYRE REPAIR DATA COLLECTOR');
  console.log('=================================');
  console.log('Starting the full data collection pipeline...');
  
  // Step 1: Collect data
  console.log('\n--- STEP 1: DATA COLLECTION ---');
  const rawData = await collectData();
  console.log(`Collected data for ${rawData.length} companies.`);
  
  // Step 2: Process data
  console.log('\n--- STEP 2: DATA PROCESSING ---');
  const processedData = await processData();
  console.log(`Processed data for ${processedData.length} companies.`);
  
  // Step 3: Export to Google Sheets
  console.log('\n--- STEP 3: EXPORT TO GOOGLE SHEETS ---');
  const spreadsheetId = await exportToGoogleSheets();
  
  if (spreadsheetId) {
    console.log('\n=================================');
    console.log('PIPELINE COMPLETED SUCCESSFULLY');
    console.log('=================================');
    console.log(`View your data: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
  } else {
    console.log('\n=================================');
    console.log('PIPELINE COMPLETED WITH ERRORS');
    console.log('=================================');
    console.log('The Google Sheets export step failed. Please check the error logs.');
  }
}

// Run the pipeline if this script is executed directly
if (require.main === module) {
  runPipeline()
    .catch(err => {
      console.error('Error in pipeline execution:', err);
      process.exit(1);
    });
}

module.exports = { runPipeline };