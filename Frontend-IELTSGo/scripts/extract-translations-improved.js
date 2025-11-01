#!/usr/bin/env node

/**
 * Advanced Translation Extractor
 * Extracts translatable strings with proper namespace detection and context
 */

const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..');
const messagesDir = path.join(appDir, 'messages');

const scanDirs = [
  path.join(appDir, 'app'),
  path.join(appDir, 'components'),
];

const ignorePatterns = [
  /node_modules/,
  /\.next/,
  /\.git/,
  /messages/,
  /\.json$/,
  /\.md$/,
  /\.log$/,
  /\.test\./,
  /\.spec\./,
];

/**
 * Detect namespace from file path
 */
function detectNamespace(filePath) {
  const relPath = path.relative(appDir, filePath);
  
  // App routes
  if (relPath.startsWith('app/')) {
    const segments = relPath.split('/');
    if (segments.length > 1) {
      const route = segments[1];
      // Map routes to namespaces
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
  
  // Components
  if (relPath.startsWith('components/')) {
    const segments = relPath.split('/');
    if (segments.length > 1) {
      const componentType = segments[1];
      const namespaceMap = {
        'layout': 'common',
        'auth': 'auth',
        'course': 'courses',
        'exercises': 'exercises',
        'dashboard': 'dashboard',
        'notifications': 'notifications',
      };
      return namespaceMap[componentType] || 'common';
    }
  }
  
  return 'common';
}

/**
 * Create meaningful key from text
 */
function createKey(text, namespace, index) {
  // Remove special chars, keep only alphanumeric and spaces
  let key = text
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .substring(0, 40);
  
  // If key is too short or generic, add index
  if (key.length < 3 || ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(key)) {
    key = `${key}_${index}`;
  }
  
  return key;
}

/**
 * Extract strings with better heuristics
 */
function extractStrings(filePath, content, namespace) {
  const strings = [];
  
  // Remove comments
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  content = content.replace(/\/\/.*/g, '');
  
  // Pattern 1: JSX text nodes - between > and <
  const jsxPattern = />([A-Z][A-Za-z0-9\s.,!?]{2,50})</g;
  let match;
  while ((match = jsxPattern.exec(content)) !== null) {
    const text = match[1].trim();
    if (text && !text.includes('{') && !text.includes('$') && !text.match(/^[0-9]+$/)) {
      strings.push({
        text,
        context: extractContext(content, match.index),
        type: 'jsx',
      });
    }
  }
  
  // Pattern 2: String literals in JSX props
  const propPattern = /(?:title|label|placeholder|description|aria-label|alt)={?["']([A-Z][^"']{3,50})["']/gi;
  while ((match = propPattern.exec(content)) !== null) {
    const text = match[1];
    if (text && !text.includes('${')) {
      strings.push({
        text,
        context: extractContext(content, match.index),
        type: 'prop',
      });
    }
  }
  
  // Pattern 3: Standalone string literals (likely user-facing)
  const stringPattern = /["']([A-Z][A-Za-z\s.,!?]{10,80})["']/g;
  while ((match = stringPattern.exec(content)) !== null) {
    const text = match[1];
    // Exclude URLs, class names, imports
    if (text && 
        !text.startsWith('http') && 
        !text.includes('@') && 
        !text.includes('${') &&
        !text.includes('className') &&
        text.split(' ').length >= 2) {
      strings.push({
        text,
        context: extractContext(content, match.index),
        type: 'string',
      });
    }
  }
  
  return strings;
}

/**
 * Extract context (surrounding code) for better translation
 */
function extractContext(content, index) {
  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + 100);
  return content.substring(start, end).replace(/\s+/g, ' ').trim();
}

/**
 * Scan directory recursively
 */
function scanDirectory(dir, allStrings = {}) {
  if (!fs.existsSync(dir)) return allStrings;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    
    if (shouldIgnore(fullPath)) continue;
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath, allStrings);
    } else if (stat.isFile() && /\.(tsx?|jsx?)$/.test(item)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const namespace = detectNamespace(fullPath);
        const strings = extractStrings(fullPath, content, namespace);
        
        if (strings.length > 0) {
          const relPath = path.relative(appDir, fullPath);
          allStrings[relPath] = {
            namespace,
            strings,
          };
        }
      } catch (err) {
        console.error(`Error reading ${fullPath}:`, err.message);
      }
    }
  }
  
  return allStrings;
}

function shouldIgnore(filePath) {
  return ignorePatterns.some(pattern => pattern.test(filePath));
}

/**
 * Generate organized translation template
 */
function generateTemplate(allStrings) {
  const template = {
    common: {},
    settings: {},
    dashboard: {},
    courses: {},
    exercises: {},
    profile: {},
    leaderboard: {},
    auth: {},
    notifications: {},
  };
  
  const seen = new Map(); // Track duplicate strings
  
  for (const [file, { namespace, strings }] of Object.entries(allStrings)) {
    for (let i = 0; i < strings.length; i++) {
      const { text } = strings[i];
      
      // Skip if already seen
      if (seen.has(text)) {
        continue;
      }
      
      const key = createKey(text, namespace, i);
      const finalKey = ensureUniqueKey(template[namespace], key);
      
      template[namespace][finalKey] = text;
      seen.set(text, finalKey);
    }
  }
  
  // Remove empty namespaces
  Object.keys(template).forEach(key => {
    if (Object.keys(template[key]).length === 0) {
      delete template[key];
    }
  });
  
  return template;
}

function ensureUniqueKey(namespace, key) {
  if (!namespace[key]) return key;
  
  let counter = 1;
  while (namespace[`${key}_${counter}`]) {
    counter++;
  }
  return `${key}_${counter}`;
}

/**
 * Main
 */
function main() {
  console.log('🔍 Scanning for translatable strings...\n');
  
  const allStrings = {};
  for (const dir of scanDirs) {
    if (fs.existsSync(dir)) {
      console.log(`📂 Scanning: ${dir}`);
      scanDirectory(dir, allStrings);
    }
  }
  
  const fileCount = Object.keys(allStrings).length;
  const totalStrings = Object.values(allStrings).reduce((sum, { strings }) => sum + strings.length, 0);
  
  console.log(`\n✅ Found ${fileCount} files with ${totalStrings} translatable strings\n`);
  
  const template = generateTemplate(allStrings);
  
  // Stats
  console.log('📊 Namespace breakdown:');
  Object.entries(template).forEach(([ns, keys]) => {
    console.log(`   ${ns}: ${Object.keys(keys).length} strings`);
  });
  
  const templatePath = path.join(messagesDir, 'template.json');
  if (!fs.existsSync(messagesDir)) {
    fs.mkdirSync(messagesDir, { recursive: true });
  }
  
  fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
  console.log(`\n📝 Template saved to: ${templatePath}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Review template.json`);
  console.log(`   2. Run: pnpm i18n:translate`);
  console.log(`   3. Copy ChatGPT response to messages/vi.json and messages/en.json`);
}

if (require.main === module) {
  main();
}

module.exports = { extractStrings, scanDirectory, detectNamespace };

