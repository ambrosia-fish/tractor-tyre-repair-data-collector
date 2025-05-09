/**
 * Data validation script
 * Checks the quality of the collected data
 */

const fs = require('fs');
const path = require('path');

// Function to validate data quality
function validateData() {
  console.log('Validating data quality...');
  
  // Check if processed data exists
  const dataPath = path.join(__dirname, '../data/processed_data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('No processed data found. Please run the data processing script first.');
    return;
  }
  
  // Load the data
  const companies = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`Validating ${companies.length} companies...`);
  
  // Statistics
  const stats = {
    totalCompanies: companies.length,
    missingCompanyType: 0,
    missingRepairCosts: 0,
    missingRepairFrequency: 0,
    missingDamageTypes: 0,
    missingPhoneNumber: 0,
    missingWebsite: 0,
    companyTypes: {},
    qualityScore: 0
  };
  
  // Analyze each company
  companies.forEach(company => {
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
    
    // Calculate quality score for this company
    let companyScore = 0;
    if (company.companyType !== 'Unknown') companyScore += 20;
    if (company.repairCosts !== 'Unknown') companyScore += 20;
    if (company.repairFrequency !== 'Unknown') companyScore += 20;
    if (company.damageTypes !== 'Unknown') companyScore += 20;
    if (company.phoneNumber !== 'Unknown') companyScore += 10;
    if (company.website !== 'Unknown') companyScore += 10;
    
    stats.qualityScore += companyScore;
  });
  
  // Calculate average quality score
  stats.qualityScore = stats.qualityScore / (companies.length * 100);
  
  // Print statistics
  console.log('\nDATA VALIDATION RESULTS:\n');
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
  
  console.log(`\nOVERALL DATA QUALITY:`);
  console.log(`Quality Score: ${(stats.qualityScore * 100).toFixed(1)}%`);
  
  // Data quality assessment
  let qualityAssessment = '';
  if (stats.qualityScore >= 0.8) {
    qualityAssessment = 'Excellent';
  } else if (stats.qualityScore >= 0.6) {
    qualityAssessment = 'Good';
  } else if (stats.qualityScore >= 0.4) {
    qualityAssessment = 'Fair';
  } else {
    qualityAssessment = 'Poor';
  }
  console.log(`Assessment: ${qualityAssessment}`);
  
  // Recommendations
  console.log('\nRECOMMENDATIONS:');
  if (stats.missingCompanyType > stats.totalCompanies * 0.3) {
    console.log('- Focus on identifying company types for more businesses');
  }
  if (stats.missingRepairCosts > stats.totalCompanies * 0.3) {
    console.log('- Gather more information about repair costs');
  }
  if (stats.missingRepairFrequency > stats.totalCompanies * 0.3) {
    console.log('- Collect more data on repair frequency');
  }
  if (stats.missingDamageTypes > stats.totalCompanies * 0.3) {
    console.log('- Research more about types of damages handled');
  }
  
  console.log('\nValidation completed!');
}

// Run the validation
validateData();