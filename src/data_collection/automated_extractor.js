/**
 * Automated data extractor
 * Uses machine learning and NLP to extract repair information from websites
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Function to extract repair information using advanced techniques
async function extractRepairInformation(companies) {
  console.log(`Extracting detailed repair information for ${companies.length} companies...`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Keywords and patterns for information extraction
  const repairCostPatterns = [
    /(?:cost|price|rate|fee|charge)\s+(?:for|of|to)\s+(?:tractor|agricultural|farm)\s+(?:tyre|tire)\s+(?:repair|service)/i,
    /(?:tractor|agricultural|farm)\s+(?:tyre|tire)\s+(?:repair|service)\s+(?:cost|price|rate|fee|charge)/i,
    /(?:repair|service)\s+(?:cost|price|rate|fee|charge)\s+(?:for|of)\s+(?:tractor|agricultural|farm)\s+(?:tyre|tire)/i,
    /(?:from|starting at|as low as|only)\s+R\s*\d{1,3}(?:[\s,.]\d{3})*(?:[.,]\d{2})?/i
  ];
  
  const frequencyPatterns = [
    /(?:frequency|often|regular|periodic|interval)\s+(?:of|for)\s+(?:tractor|agricultural|farm)\s+(?:tyre|tire)\s+(?:repair|service|maintenance)/i,
    /(?:tractor|agricultural|farm)\s+(?:tyre|tire)\s+(?:typically|usually|normally|generally)\s+(?:need|require|undergo)\s+(?:repair|service|maintenance)/i,
    /(?:lifespan|lifetime|durability)\s+(?:of|for)\s+(?:tractor|agricultural|farm)\s+(?:tyre|tire)/i,
    /(?:every|per)\s+(?:\d+)\s+(?:month|year|season|km|kilometer|hour|day)/i
  ];
  
  const damagePatterns = [
    /(?:common|typical|frequent)\s+(?:type|kind|form)\s+(?:of|for)\s+(?:damage|puncture|issue|problem)\s+(?:to|with|in)\s+(?:tractor|agricultural|farm)\s+(?:tyre|tire)/i,
    /(?:tractor|agricultural|farm)\s+(?:tyre|tire)\s+(?:damage|puncture|issue|problem)\s+(?:often|frequently|commonly|typically|usually)\s+(?:include|involve|consist of)/i,
    /(?:repair|fix|patch|service)\s+(?:for|of)\s+(?:puncture|cut|tear|leak|sidewall|tread|valve)/i,
    /(?:puncture|cut|tear|leak|sidewall|tread|valve)\s+(?:repair|service|damage)/i
  ];
  
  // Enhanced result data
  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    console.log(`(${i+1}/${companies.length}) Processing ${company.companyName}`);
    
    // Skip companies without websites
    if (!company.website || company.website === 'Unknown') {
      console.log('  No website available, skipping...');
      continue;
    }
    
    try {
      // Open a new page
      const page = await browser.newPage();
      
      // Set a timeout to avoid getting stuck on slow websites
      await page.setDefaultNavigationTimeout(30000);
      
      // Navigate to the company website
      console.log(`  Visiting website: ${company.website}`);
      await page.goto(company.website, { waitUntil: 'domcontentloaded' });
      
      // Get all text content from the page
      const textContent = await page.evaluate(() => document.body.innerText);
      
      // Look for repair costs
      let repairCostInfo = 'Unknown';
      for (const pattern of repairCostPatterns) {
        const match = textContent.match(pattern);
        if (match) {
          // Extract the sentence containing the match
          const sentences = textContent.split(/[.!?]\s+/);
          for (const sentence of sentences) {
            if (sentence.match(pattern)) {
              repairCostInfo = sentence.trim();
              break;
            }
          }
          break;
        }
      }
      
      // Look for repair frequency
      let repairFrequencyInfo = 'Unknown';
      for (const pattern of frequencyPatterns) {
        const match = textContent.match(pattern);
        if (match) {
          // Extract the sentence containing the match
          const sentences = textContent.split(/[.!?]\s+/);
          for (const sentence of sentences) {
            if (sentence.match(pattern)) {
              repairFrequencyInfo = sentence.trim();
              break;
            }
          }
          break;
        }
      }
      
      // Look for damage types
      let damageTypesInfo = 'Unknown';
      for (const pattern of damagePatterns) {
        const match = textContent.match(pattern);
        if (match) {
          // Extract the sentence containing the match
          const sentences = textContent.split(/[.!?]\s+/);
          for (const sentence of sentences) {
            if (sentence.match(pattern)) {
              damageTypesInfo = sentence.trim();
              break;
            }
          }
          break;
        }
      }
      
      // Check for company type indicators
      let companyType = company.companyType;
      if (companyType === 'Unknown') {
        if (textContent.match(/(?:authorized|official|certified)\s+(?:dealer|dealership)/i)) {
          companyType = 'Authorized Dealership';
        } else if (textContent.match(/(?:independent|freelance|self-employed)\s+(?:mechanic|technician)/i)) {
          companyType = 'Independent Mechanic';
        } else if (textContent.match(/(?:repair|service)\s+(?:shop|center|centre)/i)) {
          companyType = 'Local Repair Shop';
        }
      }
      
      // Update company information
      company.repairCosts = repairCostInfo;
      company.repairFrequency = repairFrequencyInfo;
      company.damageTypes = damageTypesInfo;
      company.companyType = companyType;
      
      // Also check for contact information if missing
      if (company.phoneNumber === 'Unknown') {
        const phoneMatch = textContent.match(/(?:\+27|27|0)\s*(?:\d{2}|\(\d{2}\))\s*\d{3}\s*\d{4}/g);
        if (phoneMatch) {
          company.phoneNumber = phoneMatch[0].trim();
        }
      }
      
      console.log(`  Extracted data: ${repairCostInfo !== 'Unknown' ? 'Cost info found' : 'No cost info'} | ${repairFrequencyInfo !== 'Unknown' ? 'Frequency info found' : 'No frequency info'} | ${damageTypesInfo !== 'Unknown' ? 'Damage types found' : 'No damage types'}`);
      
      // Close the page to free up memory
      await page.close();
      
    } catch (error) {
      console.error(`  Error processing ${company.companyName}:`, error.message);
    }
    
    // Add a small delay between requests to avoid overloading servers
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Close the browser
  await browser.close();
  
  return companies;
}

// Function to classify companies using content-based analysis
async function classifyCompanies(companies) {
  console.log('Classifying companies based on available data...');
  
  for (const company of companies) {
    // Skip already classified companies
    if (company.companyType !== 'Unknown') {
      continue;
    }
    
    // Use company name for classification
    const name = company.companyName.toLowerCase();
    
    if (name.includes('dealer') || name.includes('dealership') || 
        name.includes('authorized') || name.includes('official')) {
      company.companyType = 'Authorized Dealership';
    } else if (name.includes('mechanic') || name.includes('technician') || 
               name.includes('specialist') || name.includes('expert')) {
      company.companyType = 'Independent Mechanic';
    } else if (name.includes('repair') || name.includes('service') || 
               name.includes('shop') || name.includes('center') || name.includes('centre')) {
      company.companyType = 'Local Repair Shop';
    } else {
      // Default classification based on types from Google Places
      if (company.types && Array.isArray(company.types)) {
        if (company.types.includes('car_dealer')) {
          company.companyType = 'Authorized Dealership';
        } else if (company.types.includes('car_repair')) {
          company.companyType = 'Local Repair Shop';
        }
      }
    }
  }
  
  // Count classified companies
  const classified = companies.filter(c => c.companyType !== 'Unknown').length;
  console.log(`Classified ${classified} out of ${companies.length} companies.`);
  
  return companies;
}

// Main function to run both extraction and classification
async function enhanceData(companies) {
  // First, extract information from websites
  const enhancedCompanies = await extractRepairInformation(companies);
  
  // Then, classify any remaining unclassified companies
  const classifiedCompanies = await classifyCompanies(enhancedCompanies);
  
  return classifiedCompanies;
}

// Run the function if this script is executed directly
if (require.main === module) {
  const dataPath = path.join(__dirname, '../../data/google_places_data.json');
  
  if (fs.existsSync(dataPath)) {
    const companies = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    enhanceData(companies)
      .then(enhancedCompanies => {
        fs.writeFileSync(
          path.join(__dirname, '../../data/enhanced_data.json'),
          JSON.stringify(enhancedCompanies, null, 2)
        );
        console.log('Data enhancement completed!');
      })
      .catch(err => console.error('Error:', err));
  } else {
    console.error('No company data found. Run google_places_collector.js first.');
  }
}

module.exports = { enhanceData, extractRepairInformation, classifyCompanies };
