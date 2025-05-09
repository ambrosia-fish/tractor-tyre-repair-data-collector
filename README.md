# Tractor Tyre Repair Data Collector

This repository contains scripts and tools to automatically collect comprehensive information on tractor tyre repairs in the Western Cape, South Africa.

## Project Requirements

- Extract data regarding repair costs, frequency of repairs, and types of damages
- Focus on tractor tyre repair companies (local shops, authorized dealerships, independent mechanics)
- Gather company names and contact details
- Compile information in a Google Sheet named "Tractor Tyre Repairs"

## Repository Structure

- `src/` - Contains all source code
  - `data_collection/` - Scripts for automated data collection
  - `data_processing/` - Scripts for processing and analyzing data
  - `google_sheets/` - Scripts for exporting data to Google Sheets
- `data/` - Storage for collected and processed data
- `config/` - Configuration files
- `scripts/` - Utility scripts for setup and maintenance

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Set up Google API credentials (see instructions in `config/README.md`)
4. Run the data collection script: `npm run collect`
5. Process the data: `npm run process`
6. Export to Google Sheets: `npm run export`

Alternatively, run the entire pipeline: `npm run all`

## Automated Data Collection Methods

This project uses a fully automated multi-method approach to collect data:

1. **Web Scraping**: Automatically extracts information from company websites
2. **Google Places API**: Finds businesses in the Western Cape area
3. **Data Processing**: Cleans and normalizes the collected data
4. **Machine Learning Classification**: Categorizes businesses and extracts key information

## Data Review Interface

After automated collection, there's a simple console-based interface for reviewing and validating the data before export:

- View collected data
- Filter by data completeness
- Validate information accuracy
- Approve or modify automated classifications

No manual outreach or calling is required - the system is designed to gather all information through automated means with minimal human intervention.

## License

MIT