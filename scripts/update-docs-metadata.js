#!/usr/bin/env node

/**
 * Documentation Metadata Update Script
 * 
 * This script updates the documentation metadata file with the current date
 * and tracks which documentation files have been modified since the last update.
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const METADATA_FILE = path.join(DOCS_DIR, 'docs-metadata.json');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

/**
 * Main function to update the documentation metadata
 */
async function updateMetadata() {
  console.log(`${colors.blue}Updating documentation metadata...${colors.reset}`);
  
  // Load the current metadata
  let metadata = {};
  try {
    const metadataContent = await fs.promises.readFile(METADATA_FILE, 'utf8');
    metadata = JSON.parse(metadataContent);
  } catch (error) {
    console.log(`${colors.yellow}No existing metadata file found or error reading it. Creating new metadata.${colors.reset}`);
    metadata = {
      lastUpdated: "",
      version: "0.1.0",
      documentationStatus: "Initial setup",
      filesCreated: [],
      pendingDocumentation: [],
      documentationCoverage: {
        codebase: "0%",
        api: "0%",
        features: "0%",
        database: "0%"
      }
    };
  }

  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const lastUpdated = metadata.lastUpdated;

  // Get all markdown files in the docs directory
  const docFiles = await getDocumentationFiles();
  
  // Check which files have been modified since the last update
  const modifiedFiles = await getModifiedFiles(docFiles, lastUpdated);
  
  // Update the metadata
  metadata.lastUpdated = currentDate;
  
  // Track modified files
  if (!metadata.filesUpdated) {
    metadata.filesUpdated = [];
  }
  
  modifiedFiles.forEach(file => {
    const existingIndex = metadata.filesUpdated.findIndex(f => f.file === file.name);
    
    if (existingIndex >= 0) {
      metadata.filesUpdated[existingIndex] = {
        file: file.name,
        status: "Updated",
        lastUpdated: currentDate
      };
    } else {
      metadata.filesUpdated.push({
        file: file.name,
        status: "Updated",
        lastUpdated: currentDate
      });
    }
  });
  
  // Save the updated metadata
  await fs.promises.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2), 'utf8');
  
  console.log(`${colors.green}Documentation metadata updated successfully!${colors.reset}`);
  console.log(`${colors.blue}Last updated: ${currentDate}${colors.reset}`);
  
  if (modifiedFiles.length === 0) {
    console.log(`${colors.yellow}No documentation files have been modified since the last update.${colors.reset}`);
  } else {
    console.log(`${colors.green}Modified files:${colors.reset}`);
    modifiedFiles.forEach(file => {
      console.log(`  - ${file.name}`);
    });
  }
}

/**
 * Get all documentation files in the docs directory
 */
async function getDocumentationFiles() {
  const files = await fs.promises.readdir(DOCS_DIR);
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => ({
      name: file,
      path: path.join(DOCS_DIR, file)
    }));
}

/**
 * Get files that have been modified since the last update
 */
async function getModifiedFiles(files, lastUpdated) {
  if (!lastUpdated) {
    return files;
  }
  
  const lastUpdateDate = new Date(lastUpdated);
  const modifiedFiles = [];
  
  for (const file of files) {
    const stats = await fs.promises.stat(file.path);
    const modifiedDate = new Date(stats.mtime);
    
    if (modifiedDate > lastUpdateDate) {
      modifiedFiles.push(file);
    }
  }
  
  return modifiedFiles;
}

// Run the main function
updateMetadata().catch(error => {
  console.error(`${colors.red}Error updating metadata:${colors.reset}`, error);
  process.exit(1);
}); 