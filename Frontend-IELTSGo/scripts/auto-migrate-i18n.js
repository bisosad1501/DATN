#!/usr/bin/env node

/**
 * Auto-migrate hardcoded strings to i18n
 * Scans files and suggests/replaces hardcoded strings with t() calls
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const appDir = path.join(__dirname, '..');
const messagesDir = path.join(appDir, 'messages');
const viPath = path.join(messagesDir, 'vi.json');

/**
 * Get existing translations
 */
function getExistingTranslations() {
  if (!fs.existsSync(viPath)) return {};
  return JSON.parse(fs.readFileSync(viPath, 'utf-8'));
}

/**
 * Create translation key from text
 */
function createKey(text, namespace = 'common') {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .substring(0, 40);
}

/**
 * Find hardcoded strings in file
 */
function findHardcodedStrings(filePath, content) {
  const strings = [];
  const namespace = detectNamespace(filePath);
  
  // Pattern 1: JSX text nodes
  const jsxPattern = />([A-Z][A-Za-z0-9\s.,!?]{3,50})</g;
  let match;
  while ((match = jsxPattern.exec(content)) !== null) {
    const text = match[1].trim();
    if (text && !text.includes('{') && !text.includes('$') && !text.match(/^[0-9]+$/)) {
      // Check if already translated
      if (!content.includes(`t('`) || !content.includes(`t("`)) {
        strings.push({
          text,
          line: content.substring(0, match.index).split('\n').length,
          type: 'jsx',
          namespace,
        });
      }
    }
  }
  
  // Pattern 2: String literals in props
  const propPattern = /(?:title|label|placeholder|description|aria-label)={?["']([A-Z][^"']{3,50})["']/gi;
  while ((match = propPattern.exec(content)) !== null) {
    const text = match[1];
    if (text && !text.includes('${') && !content.includes(`t('`) && !content.includes(`t("`)) {
      strings.push({
        text,
        line: content.substring(0, match.index).split('\n').length,
        type: 'prop',
        namespace,
      });
    }
  }
  
  return strings;
}

function detectNamespace(filePath) {
  const relPath = path.relative(appDir, filePath);
  if (relPath.startsWith('app/')) {
    const segments = relPath.split('/');
    if (segments.length > 1) {
      const route = segments[1];
      const namespaceMap = {
        'settings': 'settings',
        'dashboard': 'dashboard',
        'courses': 'courses',
        'exercises': 'exercises',
        'profile': 'profile',
        'leaderboard': 'leaderboard',
        'login': 'auth',
        'register': 'auth',
      };
      return namespaceMap[route] || 'common';
    }
  }
  return 'common';
}

/**
 * Generate migration report
 */
function generateMigrationReport() {
  const files = [];
  
  function scanDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        if (!item.startsWith('.') && item !== 'node_modules' && item !== '.next') {
          scanDir(fullPath);
        }
      } else if (/\.(tsx?|jsx?)$/.test(item)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const strings = findHardcodedStrings(fullPath, content);
        if (strings.length > 0) {
          files.push({
            path: fullPath,
            strings,
          });
        }
      }
    }
  }
  
  scanDir(path.join(appDir, 'app'));
  scanDir(path.join(appDir, 'components'));
  
  // Generate report
  const report = {
    totalFiles: files.length,
    totalStrings: files.reduce((sum, f) => sum + f.strings.length, 0),
    files: files.map(f => ({
      path: path.relative(appDir, f.path),
      strings: f.strings.map(s => ({
        text: s.text,
        line: s.line,
        suggestedKey: `${s.namespace}.${createKey(s.text)}`,
      })),
    })),
  };
  
  return report;
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'report';
  
  if (mode === 'report') {
    console.log('🔍 Scanning for hardcoded strings...\n');
    const report = generateMigrationReport();
    
    console.log(`📊 Found ${report.totalStrings} hardcoded strings in ${report.totalFiles} files\n`);
    
    // Group by namespace
    const byNamespace = {};
    report.files.forEach(file => {
      file.strings.forEach(str => {
        const ns = str.suggestedKey.split('.')[0];
        if (!byNamespace[ns]) byNamespace[ns] = [];
        byNamespace[ns].push({
          file: file.path,
          ...str,
        });
      });
    });
    
    console.log('📝 Suggested translations:\n');
    Object.entries(byNamespace).forEach(([ns, items]) => {
      console.log(`\n${ns}:`);
      items.slice(0, 10).forEach(item => {
        console.log(`  ${item.suggestedKey}: "${item.text}"`);
      });
      if (items.length > 10) {
        console.log(`  ... and ${items.length - 10} more`);
      }
    });
    
    const reportPath = path.join(appDir, 'i18n-migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Full report saved to: ${reportPath}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Review i18n-migration-report.json');
    console.log('   2. Run: pnpm i18n:extract');
    console.log('   3. Add missing translations');
    console.log('   4. Manually replace hardcoded strings with t() calls');
    
  } else if (mode === 'suggest') {
    // Suggest translations for missing strings
    const report = generateMigrationReport();
    const existing = getExistingTranslations();
    
    const missing = {};
    report.files.forEach(file => {
      file.strings.forEach(str => {
        const key = str.suggestedKey;
        const [ns, k] = key.split('.');
        if (!existing[ns] || !existing[ns][k]) {
          if (!missing[ns]) missing[ns] = {};
          missing[ns][k] = str.text;
        }
      });
    });
    
    const missingPath = path.join(messagesDir, 'suggested-translations.json');
    fs.writeFileSync(missingPath, JSON.stringify(missing, null, 2));
    console.log(`✅ Suggested translations saved to: ${missingPath}`);
    console.log('💡 Add these to vi.json and en.json');
  }
}

if (require.main === module) {
  main();
}

// Export for use in other scripts
module.exports = { findHardcodedStrings, generateMigrationReport };

