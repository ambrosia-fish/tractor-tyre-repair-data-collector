/**
 * Company finder script
 * Searches for tractor tyre repair companies in specific areas
 */

require('dotenv').config({ path: './config/.env' });
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Google API key
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions
function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Function to search for companies in a specific area
async function findCompaniesInArea(area) {
  console.log(`Searching for tractor tyre repair companies in ${area}...`);
  
  if (!GOOGLE_API_KEY) {
    console.error('GOOGLE_API_KEY is not set in config/.env file');
    return [];
  }
  
  // Search terms to use
  const searchTerms = [
    `tractor tyre repair ${area}`,
    `farm equipment repair ${area}`,
    `agricultural tyre service ${area}`,
    `tractor service center ${area}`,
    `agricultural machinery repair ${area}`
  ];
  
  const companies = [];
  
  // Process each search term
  for (const term of searchTerms) {
    try {
      console.log(`Searching for: "${term}"`);
      
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/textsearch/json',
        {
          params: {
            query: term,
            key: GOOGLE_API_KEY,
            region: 'za' // South Africa country code
          }
        }
      );
      
      const results = response.data.results;
      console.log(`Found ${results.length} results for "${term}"`);
      
      for (const place of results) {
        // Check if this company is already in our list
        const exists = companies.find(c => c.placeId === place.place_id);
        
        if (!exists) {
          companies.push({
            companyName: place.name,
            placeId: place.place_id,
            address: place.formatted_address,
            location: place.geometry.location,
            rating: place.rating || 'N/A',
            userRatingsTotal: place.user_ratings_total || 0,
            companyType: 'Unknown',
            searchTerm: term,
            area: area
          });
        }
      }
      
      // Respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error(`Error searching for "${term}":`, error.message);
    }
  }
  
  return companies;
}

// Main function
async function main() {
  console.log('Welcome to the Tractor Tyre Repair Company Finder!');
  
  // Ask for specific areas to search in
  const areaInput = await askQuestion('Enter areas to search (comma separated, e.g. "Cape Town,Stellenbosch,Paarl"): ');
  const areas = areaInput.split(',').map(area => area.trim());
  
  const allCompanies = [];
  
  // Search in each area
  for (const area of areas) {
    if (area) {
      const companies = await findCompaniesInArea(area);
      console.log(`Found ${companies.length} unique companies in ${area}`);
      allCompanies.push(...companies);
    }
  }
  
  // Remove any duplicates across areas
  const uniqueCompanies = [];
  const placeIds = new Set();
  
  for (const company of allCompanies) {
    if (!placeIds.has(company.placeId)) {
      uniqueCompanies.push(company);
      placeIds.add(company.placeId);
    }
  }
  
  console.log(`\nFound ${uniqueCompanies.length} unique companies across all areas`);
  
  // Save the results
  const outputPath = path.join(__dirname, '../data/area_search_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(uniqueCompanies, null, 2));
  console.log(`Results saved to ${outputPath}`);
  
  rl.close();
}

// Run the script
if (require.main === module) {
  main().catch(err => console.error('Error:', err));
}
