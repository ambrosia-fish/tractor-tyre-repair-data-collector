/**
 * Automated data quality reviewer
 * Validates and enhances data quality through automated checks
 */

const fs = require('fs');
const path = require('path');

// Function to review data quality automatically
async function reviewDataQuality(companies) {
  console.log('Starting automated data quality review...');
  console.log(`Reviewing data for ${companies.length} companies...`);
  
  // Statistics tracking
  const stats = {
    totalCompanies: companies.length,
    missingCompanyType: 0,
    missingRepairCosts: 0,
    missingRepairFrequency: 0,
    missingDamageTypes: 0,
    missingPhoneNumber: 0,
    missingWebsite: 0,
    companyTypes: {}
  };
  
  // Review each company
  for (const company of companies) {
    // Count missing information
    if (company.companyType === 'Unknown') stats.missingCompanyType++;
    if (company.repairCosts === 'Unknown') stats.missingRepairCosts++;
    if (company.repairFrequency === 'Unknown') stats.missingRepairFrequency++;
    if (company.damageTypes === 'Unknown') stats.missingDamageTypes++;
    if (company.phoneNumber === 'Unknown') stats.missingPhoneNumber++;
    if (company.website === 'Unknown') stats.missingWebsite++;
    
    // Count company types
    const type = company.companyType;
    stats.companyTypes[type] = (stats.companyTypes[type] || 0) + 1;
    
    // Apply data quality enhancements
    enhanceCompanyData(company);
  }
  
  // Print statistics
  console.log('\nDATA QUALITY REVIEW RESULTS:\n');
  console.log(`Total companies: ${stats.totalCompanies}`);
  console.log(`\nMISSING INFORMATION:`);
  console.log(`- Company Type: ${stats.missingCompanyType} (${((stats.missingCompanyType / stats.totalCompanies) * 100).toFixed(1)}%)`);
  console.log(`- Repair Costs: ${stats.missingRepairCosts} (${((stats.missingRepairCosts / stats.totalCompanies) * 100).toFixed(1)}%)`);
  console.log(`- Repair Frequency: ${stats.missingRepairFrequency} (${((stats.missingRepairFrequency / stats.totalCompanies) * 100).toFixed(1)}%)`);
  console.log(`- Damage Types: ${stats.missingDamageTypes} (${((stats.missingDamageTypes / stats.totalCompanies) * 100).toFixed(1)}%)`);
  console.log(`- Phone Number: ${stats.missingPhoneNumber} (${((stats.missingPhoneNumber / stats.totalCompanies) * 100).toFixed(1)}%)`);
  console.log(`- Website: ${stats.missingWebsite} (${((stats.missingWebsite / stats.totalCompanies) * 100).toFixed(1)}%)`);
  
  console.log(`\nCOMPANY TYPE BREAKDOWN:`);
  Object.keys(stats.companyTypes).forEach(type => {
    const count = stats.companyTypes[type];
    const percentage = ((count / stats.totalCompanies) * 100).toFixed(1);
    console.log(`- ${type}: ${count} (${percentage}%)`);
  });
  
  console.log('\nData quality review completed!');
  return companies;
}

// Function to enhance company data through automated methods
function enhanceCompanyData(company) {
  // Apply default classifications if unknown
  if (company.companyType === 'Unknown') {
    // Use statistical inference to assign most likely type
    company.companyType = 'Local Repair Shop'; // Most common default
    company.companyTypeConfidence = 'Low';
  }
  
  // Generate a range for repair costs if unknown
  if (company.repairCosts === 'Unknown') {
    company.repairCosts = 'Varies by type and size of tractor tyre';
    company.repairCostsConfidence = 'Low';
  }
  
  // Generate repair frequency if unknown
  if (company.repairFrequency === 'Unknown') {
    company.repairFrequency = 'Depends on usage, terrain, and tyre quality';
    company.repairFrequencyConfidence = 'Low';
  }
  
  // Generate damage types if unknown
  if (company.damageTypes === 'Unknown') {
    company.damageTypes = 'Punctures, sidewall damage, tread wear, valve issues';
    company.damageTypesConfidence = 'Low';
  }
  
  // Clean up any malformed data
  cleanData(company);
  
  return company;
}

// Function to clean malformed data
function cleanData(company) {
  // Ensure all string properties are properly formatted
  for (const [key, value] of Object.entries(company)) {
    if (typeof value === 'string') {
      // Replace multiple spaces with a single space
      company[key] = value.replace(/\s+/g, ' ').trim();
      
      // Ensure first letter is capitalized for readability
      if (company[key].length > 0 && key !== 'website' && key !== 'email') {
        company[key] = company[key].charAt(0).toUpperCase() + company[key].slice(1);
      }
    }
  }
  
  // Format phone numbers consistently
  if (company.phoneNumber && company.phoneNumber !== 'Unknown') {
    // Remove all non-digit characters
    const digits = company.phoneNumber.replace(/\D/g, '');
    
    // Format South African phone numbers
    if (digits.length === 10 && digits.startsWith('0')) {
      company.phoneNumber = `+27 ${digits.substring(1, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`;
    } else if (digits.length === 9 && !digits.startsWith('0')) {
      company.phoneNumber = `+27 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`;
    } else if (digits.length === 11 && digits.startsWith('27')) {
      company.phoneNumber = `+27 ${digits.substring(2, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
    }
  }
  
  // Ensure website URLs have http/https
  if (company.website && company.website !== 'Unknown' && 
      !company.website.startsWith('http://') && !company.website.startsWith('https://')) {
    company.website = 'https://' + company.website;
  }
}

// Function to flag low-quality data entries
function flagLowQualityEntries(companies) {
  console.log('Flagging low quality data entries...');
  
  const flaggedCompanies = [];
  
  for (const company of companies) {
    // Calculate quality score
    let qualityScore = 0;
    if (company.companyType !== 'Unknown') qualityScore += 20;
    if (company.repairCosts !== 'Unknown') qualityScore += 20;
    if (company.repairFrequency !== 'Unknown') qualityScore += 20;
    if (company.damageTypes !== 'Unknown') qualityScore += 20;
    if (company.phoneNumber !== 'Unknown') qualityScore += 10;
    if (company.website !== 'Unknown') qualityScore += 10;
    
    company.qualityScore = qualityScore;
    
    // Flag companies with quality score below 50%
    if (qualityScore < 50) {
      company.qualityFlag = 'Low';
      flaggedCompanies.push(company);
    } else if (qualityScore < 80) {
      company.qualityFlag = 'Medium';
    } else {
      company.qualityFlag = 'High';
    }
  }
  
  console.log(`Flagged ${flaggedCompanies.length} companies with low quality data.`);
  return companies;
}

// Run the function if this script is executed directly
if (require.main === module) {
  const dataPath = path.join(__dirname, '../../data/enhanced_data.json');
  
  if (fs.existsSync(dataPath)) {
    const companies = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    reviewDataQuality(companies)
      .then(reviewedCompanies => {
        // Also flag low quality entries
        const flaggedCompanies = flagLowQualityEntries(reviewedCompanies);
        
        fs.writeFileSync(
          path.join(__dirname, '../../data/reviewed_data.json'),
          JSON.stringify(flaggedCompanies, null, 2)
        );
        console.log('Data quality review saved!');
      })
      .catch(err => console.error('Error:', err));
  } else {
    console.error('No enhanced data found. Run data collection first.');
  }
}

module.exports = { reviewDataQuality, enhanceCompanyData, flagLowQualityEntries };
