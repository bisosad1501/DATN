#!/usr/bin/env node

/**
 * Clean unused i18n keys
 * Removes translation keys that are not used in code
 */

const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..');
const messagesDir = path.join(appDir, 'messages');
const viPath = path.join(messagesDir, 'vi.json');
const enPath = path.join(messagesDir, 'en.json');

/**
 * Get all keys from object
 */
function getAllKeys(obj, prefix = '') {
  const keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

/**
 * Find translation calls in code
 */
function findTranslationCalls(dir) {
  const usedKeys = new Set();
  
  function scanDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        if (!item.startsWith('.') && item !== 'node_modules' && item !== '.next') {
          scanDir(fullPath);
        }
      } else if (/\.(tsx?|jsx?)$/.test(item)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        // Match t('key'), t("key"), t('namespace.key')
        const pattern = /t\(['"]([^'"]+)['"]\)/g;
        let match;
        while ((match = pattern.exec(content)) !== null) {
          usedKeys.add(match[1]);
        }
      }
    }
  }
  
  scanDir(dir);
  return usedKeys;
}

/**
 * Remove key from object
 */
function removeKey(obj, keyPath) {
  const parts = keyPath.split('.');
  const lastKey = parts.pop();
  let current = obj;
  
  for (const part of parts) {
    if (!(part in current) || typeof current[part] !== 'object') {
      return false; // Path doesn't exist
    }
    current = current[part];
  }
  
  if (lastKey && lastKey in current) {
    delete current[part];
    return true;
  }
  return false;
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  if (!fs.existsSync(viPath) || !fs.existsSync(enPath)) {
    console.error('❌ Translation files not found');
    process.exit(1);
  }
  
  const vi = JSON.parse(fs.readFileSync(viPath, 'utf-8'));
  const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  
  // Find used keys
  const usedKeys = findTranslationCalls(path.join(appDir, 'app'));
  const usedKeysComponents = findTranslationCalls(path.join(appDir, 'components'));
  usedKeys.forEach(k => usedKeysComponents.add(k));
  
  // Get all keys from translations
  const viKeys = getAllKeys(vi);
  const enKeys = getAllKeys(en);
  
  // Find unused keys (keys that exist but not used)
  const unusedKeys = viKeys.filter(k => !usedKeysComponents.has(k));
  
  console.log('\n📊 Clean Unused I18n Keys\n');
  console.log(`Total keys: ${viKeys.length}`);
  console.log(`Used keys: ${usedKeysComponents.size}`);
  console.log(`Unused keys: ${unusedKeys.length}\n`);
  
  if (unusedKeys.length === 0) {
    console.log('✅ No unused keys found!\n');
    return;
  }
  
  console.log('🗑️  Unused keys:');
  unusedKeys.slice(0, 20).forEach(k => console.log(`   ${k}`));
  if (unusedKeys.length > 20) {
    console.log(`   ... and ${unusedKeys.length - 20} more\n`);
  }
  
  if (dryRun) {
    console.log('\n💡 This is a dry run. Use without --dry-run to remove keys.\n');
    return;
  }
  
  // Remove unused keys
  let removed = 0;
  for (const key of unusedKeys) {
    if (removeKey(vi, key)) removed++;
    if (removeKey(en, key)) {} // Count once
  }
  
  // Save
  fs.writeFileSync(viPath, JSON.stringify(vi, null, 2));
  fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
  
  console.log(`\n✅ Removed ${removed} unused keys\n`);
}

if (require.main === module) {
  main();
}

