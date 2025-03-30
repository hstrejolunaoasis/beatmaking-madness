#!/usr/bin/env node

/**
 * Documentation Status Check Script
 * 
 * This script analyzes the project documentation and provides a status report
 * on documentation coverage and identifies outdated documentation.
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const METADATA_FILE = path.join(DOCS_DIR, 'docs-metadata.json');
const SOURCE_DIR = path.join(__dirname, '..', 'src');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

/**
 * Main function to check documentation status
 */
async function checkDocumentationStatus() {
  console.log(`${colors.blue}Checking documentation status...${colors.reset}`);
  
  // Load the metadata
  let metadata = {};
  try {
    const metadataContent = await fs.promises.readFile(METADATA_FILE, 'utf8');
    metadata = JSON.parse(metadataContent);
  } catch (error) {
    console.error(`${colors.red}Error reading metadata file:${colors.reset}`, error.message);
    process.exit(1);
  }
  
  // Get documentation files
  const docFiles = await getDocumentationFiles();
  
  // Check for outdated documentation
  const outdatedDocs = await checkOutdatedDocumentation(docFiles, metadata);
  
  // Check for pending documentation
  const pendingDocs = metadata.pendingDocumentation || [];
  
  // Check for documentation coverage
  const sourceFiles = await getSourceFiles();
  const coverageStats = calculateCoverageStats(sourceFiles, docFiles, metadata);
  
  // Display report
  displayStatusReport(metadata, outdatedDocs, pendingDocs, coverageStats);
}

/**
 * Get all documentation files
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
 * Get source code files
 */
async function getSourceFiles() {
  const components = await walkDirectory(path.join(SOURCE_DIR, 'components'));
  const app = await walkDirectory(path.join(SOURCE_DIR, 'app'));
  const lib = await walkDirectory(path.join(SOURCE_DIR, 'lib'));
  
  return [...components, ...app, ...lib];
}

/**
 * Recursively walk a directory to get all files
 */
async function walkDirectory(dir) {
  let results = [];
  
  // Skip if directory doesn't exist
  try {
    await fs.promises.access(dir);
  } catch (error) {
    return results;
  }
  
  const items = await fs.promises.readdir(dir, { withFileTypes: true });
  
  for (const item of items) {
    const itemPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      const nestedResults = await walkDirectory(itemPath);
      results = [...results, ...nestedResults];
    } else if (item.isFile() && (
      itemPath.endsWith('.ts') || 
      itemPath.endsWith('.tsx') || 
      itemPath.endsWith('.js') || 
      itemPath.endsWith('.jsx')
    )) {
      results.push({ 
        name: item.name, 
        path: itemPath,
        type: categorizeFile(itemPath)
      });
    }
  }
  
  return results;
}

/**
 * Categorize a file based on its path
 */
function categorizeFile(filePath) {
  if (filePath.includes('/api/')) {
    return 'api';
  } else if (filePath.includes('/components/')) {
    return 'component';
  } else if (filePath.includes('/lib/')) {
    return 'utility';
  } else {
    return 'page';
  }
}

/**
 * Check for outdated documentation based on last modified date
 */
async function checkOutdatedDocumentation(docFiles, metadata) {
  const outdatedDocs = [];
  const lastUpdateDate = new Date(metadata.lastUpdated);
  const filesUpdated = metadata.filesUpdated || [];
  
  for (const file of docFiles) {
    const stats = await fs.promises.stat(file.path);
    const fileUpdateInfo = filesUpdated.find(f => f.file === file.name);
    
    if (!fileUpdateInfo) {
      // No update record, consider it outdated
      outdatedDocs.push({
        name: file.name,
        reason: 'Not tracked in metadata',
        lastModified: stats.mtime
      });
    } else {
      const lastUpdated = new Date(fileUpdateInfo.lastUpdated);
      const modifiedDate = new Date(stats.mtime);
      
      // If the file was modified after its last recorded update
      if (modifiedDate > lastUpdated) {
        outdatedDocs.push({
          name: file.name,
          reason: 'Modified after last recorded update',
          lastModified: stats.mtime,
          lastUpdated: fileUpdateInfo.lastUpdated
        });
      }
      
      // If the file hasn't been updated in more than 30 days
      const daysSinceUpdate = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate > 30) {
        outdatedDocs.push({
          name: file.name,
          reason: `Last updated ${daysSinceUpdate} days ago`,
          lastModified: stats.mtime,
          lastUpdated: fileUpdateInfo.lastUpdated
        });
      }
    }
  }
  
  return outdatedDocs;
}

/**
 * Calculate coverage statistics
 */
function calculateCoverageStats(sourceFiles, docFiles, metadata) {
  const stats = {
    total: sourceFiles.length,
    apiCount: sourceFiles.filter(file => file.type === 'api').length,
    componentCount: sourceFiles.filter(file => file.type === 'component').length,
    pageCount: sourceFiles.filter(file => file.type === 'page').length,
    utilityCount: sourceFiles.filter(file => file.type === 'utility').length,
    docCount: docFiles.length,
    coverage: metadata.documentationCoverage || {}
  };
  
  return stats;
}

/**
 * Display the status report
 */
function displayStatusReport(metadata, outdatedDocs, pendingDocs, coverageStats) {
  console.log(`\n${colors.cyan}==============================================${colors.reset}`);
  console.log(`${colors.cyan}        DOCUMENTATION STATUS REPORT           ${colors.reset}`);
  console.log(`${colors.cyan}==============================================${colors.reset}\n`);
  
  console.log(`${colors.blue}Project Version:${colors.reset} ${metadata.version}`);
  console.log(`${colors.blue}Last Documentation Update:${colors.reset} ${metadata.lastUpdated}`);
  console.log(`${colors.blue}Documentation Status:${colors.reset} ${metadata.documentationStatus}`);
  
  console.log(`\n${colors.yellow}Documentation Coverage:${colors.reset}`);
  console.log(`  ${colors.blue}Overall:${colors.reset} ${metadata.documentationCoverage?.codebase || '0%'}`);
  console.log(`  ${colors.blue}API:${colors.reset} ${metadata.documentationCoverage?.api || '0%'}`);
  console.log(`  ${colors.blue}Features:${colors.reset} ${metadata.documentationCoverage?.features || '0%'}`);
  console.log(`  ${colors.blue}Database:${colors.reset} ${metadata.documentationCoverage?.database || '0%'}`);
  
  console.log(`\n${colors.yellow}Source Code Stats:${colors.reset}`);
  console.log(`  ${colors.blue}Total Files:${colors.reset} ${coverageStats.total}`);
  console.log(`  ${colors.blue}API Files:${colors.reset} ${coverageStats.apiCount}`);
  console.log(`  ${colors.blue}Component Files:${colors.reset} ${coverageStats.componentCount}`);
  console.log(`  ${colors.blue}Page Files:${colors.reset} ${coverageStats.pageCount}`);
  console.log(`  ${colors.blue}Utility Files:${colors.reset} ${coverageStats.utilityCount}`);
  console.log(`  ${colors.blue}Documentation Files:${colors.reset} ${coverageStats.docCount}`);
  
  if (outdatedDocs.length > 0) {
    console.log(`\n${colors.yellow}Outdated Documentation (${outdatedDocs.length} files):${colors.reset}`);
    outdatedDocs.forEach(doc => {
      console.log(`  ${colors.red}${doc.name}${colors.reset}`);
      console.log(`    Reason: ${doc.reason}`);
      if (doc.lastUpdated) {
        console.log(`    Last Update: ${doc.lastUpdated}`);
      }
    });
  } else {
    console.log(`\n${colors.green}All documentation is up-to-date!${colors.reset}`);
  }
  
  if (pendingDocs.length > 0) {
    console.log(`\n${colors.yellow}Pending Documentation Tasks (${pendingDocs.length}):${colors.reset}`);
    pendingDocs.forEach(task => {
      console.log(`  ${colors.blue}${task.topic}${colors.reset}`);
      console.log(`    Description: ${task.description}`);
      console.log(`    Priority: ${task.priority}`);
      console.log(`    Due: ${task.dueDate}`);
    });
  }
  
  console.log(`\n${colors.cyan}==============================================${colors.reset}\n`);
}

// Run the main function
checkDocumentationStatus().catch(error => {
  console.error(`${colors.red}Error checking documentation status:${colors.reset}`, error);
  process.exit(1);
}); 