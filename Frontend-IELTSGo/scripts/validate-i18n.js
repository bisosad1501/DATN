#!/usr/bin/env node

/**
 * Validate i18n usage
 * Checks for missing translations, unused keys, etc.
 */

const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..');
const messagesDir = path.join(appDir, 'messages');

/**
 * Get all translation keys
 */
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

/**
 * Find t() calls in code
 */
function findTranslationCalls(content) {
  const calls = [];
  // Match t('key') or t("key") or t('namespace.key')
  const pattern = /t\(['"]([^'"]+)['"]\)/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    calls.push(match[1]);
  }
  return calls;
}

/**
 * Main
 */
function main() {
  const viPath = path.join(messagesDir, 'vi.json');
  const enPath = path.join(messagesDir, 'en.json');
  
  if (!fs.existsSync(viPath) || !fs.existsSync(enPath)) {
    console.error('❌ Translation files not found');
    process.exit(1);
  }
  
  const vi = JSON.parse(fs.readFileSync(viPath, 'utf-8'));
  const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  
  const viKeys = getAllKeys(vi);
  const enKeys = getAllKeys(en);
  
  // Check for missing keys
  const missingInEn = viKeys.filter(k => !enKeys.includes(k));
  const missingInVi = enKeys.filter(k => !viKeys.includes(k));
  
  // Find used keys
  const usedKeys = new Set();
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
        const calls = findTranslationCalls(content);
        calls.forEach(key => usedKeys.add(key));
      }
    }
  }
  
  scanDir(path.join(appDir, 'app'));
  scanDir(path.join(appDir, 'components'));
  
  // Find unused keys
  const unusedKeys = viKeys.filter(k => !usedKeys.has(k));
  
  // Report
  console.log('\n📊 I18n Validation Report\n');
  console.log(`Total keys (vi): ${viKeys.length}`);
  console.log(`Total keys (en): ${enKeys.length}`);
  console.log(`Used keys: ${usedKeys.size}\n`);
  
  if (missingInEn.length > 0) {
    console.log(`⚠️  Missing in en.json (${missingInEn.length}):`);
    missingInEn.slice(0, 10).forEach(k => console.log(`   ${k}`));
    if (missingInEn.length > 10) console.log(`   ... and ${missingInEn.length - 10} more\n`);
  }
  
  if (missingInVi.length > 0) {
    console.log(`⚠️  Missing in vi.json (${missingInVi.length}):`);
    missingInVi.slice(0, 10).forEach(k => console.log(`   ${k}`));
    if (missingInVi.length > 10) console.log(`   ... and ${missingInVi.length - 10} more\n`);
  }
  
  if (unusedKeys.length > 0) {
    console.log(`💡 Unused keys (${unusedKeys.length}, consider removing):`);
    unusedKeys.slice(0, 20).forEach(k => console.log(`   ${k}`));
    if (unusedKeys.length > 20) console.log(`   ... and ${unusedKeys.length - 20} more\n`);
  }
  
  if (missingInEn.length === 0 && missingInVi.length === 0) {
    console.log('✅ All translations are synchronized!\n');
  }
}

if (require.main === module) {
  main();
}

