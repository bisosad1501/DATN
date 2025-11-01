#!/usr/bin/env node

/**
 * Auto-migrate all hardcoded strings to i18n
 * Workflow:
 * 1. Extract all strings → template.json
 * 2. Check missing translations
 * 3. Auto-replace hardcoded strings with t() calls
 * 
 * Usage: node scripts/auto-migrate-all.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const appDir = path.join(__dirname, '..');
const messagesDir = path.join(appDir, 'messages');
const templatePath = path.join(messagesDir, 'template.json');
const reportPath = path.join(appDir, 'i18n-migration-report.json');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

/**
 * Step 1: Extract all strings
 */
function extractStrings() {
  console.log('\n📥 Step 1: Extracting all hardcoded strings...\n');
  try {
    execSync('node scripts/extract-translations-improved.js', {
      stdio: 'inherit',
      cwd: appDir
    });
    console.log('\n✅ Extraction complete!\n');
    return true;
  } catch (error) {
    console.error('❌ Extraction failed:', error.message);
    return false;
  }
}

/**
 * Step 2: Generate migration report
 */
function generateReport() {
  console.log('\n📊 Step 2: Generating migration report...\n');
  try {
    execSync('node scripts/auto-migrate-i18n.js report', {
      stdio: 'pipe',
      cwd: appDir
    });
    console.log('✅ Report generated!\n');
    return true;
  } catch (error) {
    console.error('❌ Report generation failed:', error.message);
    return false;
  }
}

/**
 * Step 3: Auto-replace strings in files
 */
function autoReplace() {
  if (!fs.existsSync(reportPath)) {
    console.error('❌ Migration report not found. Run extract first.');
    return false;
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  const files = report.files || [];
  
  console.log(`\n🔄 Step 3: Auto-replacing strings in ${files.length} files...\n`);
  console.log('⚠️  Chú ý: Script sẽ replace các strings đơn giản.');
  console.log('💡 Các strings phức tạp cần review manual sau.\n');
  
  let totalReplacements = 0;
  const replacements = [];
  const skipped = [];
  
  files.forEach(file => {
      const filePath = path.join(appDir, file.path);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${filePath}`);
        return;
      }
      
      // Skip certain files
      if (file.path.includes('node_modules') || 
          file.path.includes('.next') ||
          file.path.includes('scripts/') ||
          file.path.includes('.test.') ||
          file.path.includes('.spec.') ||
          file.path.includes('messages/')) {
        return;
      }
      
      let content = fs.readFileSync(filePath, 'utf-8');
      let fileReplacements = 0;
      
      // Detect namespace from file path (same logic as auto-migrate-i18n.js)
      function detectNamespace(filePath) {
        const relPath = filePath.replace(appDir + '/', '');
        if (relPath.startsWith('app/dashboard/')) return 'dashboard';
        if (relPath.startsWith('app/profile/')) return 'profile';
        if (relPath.startsWith('app/courses/')) return 'courses';
        if (relPath.startsWith('app/exercises/')) return 'exercises';
        if (relPath.startsWith('app/leaderboard/')) return 'leaderboard';
        if (relPath.startsWith('app/login/') || relPath.startsWith('app/register/')) return 'auth';
        if (relPath.startsWith('app/settings/')) return 'settings';
        if (relPath.startsWith('components/')) return 'common';
        return 'common';
      }
      
      const namespace = detectNamespace(filePath);
      
      // Detect if file is client component
    const isClient = content.includes('"use client"');
    
    // Add import if needed (only for React files)
    if (!content.includes("from '@/lib/i18n'") && 
        !content.includes('useTranslations') &&
        (content.includes('export default') || content.includes('export function'))) {
      // Find last import statement
      const importLines = content.match(/^import\s+.*$/gm);
      if (importLines && importLines.length > 0) {
        const lastImportLine = importLines[importLines.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImportLine);
        const insertIndex = lastImportIndex + lastImportLine.length;
        content = content.slice(0, insertIndex) + 
                 "\nimport { useTranslations } from '@/lib/i18n'" + 
                 content.slice(insertIndex);
      }
    }
    
    // Add hook call in component (simple detection)
    let hasHook = content.includes('useTranslations(');
    if (!hasHook && file.strings.length > 0 && 
        (content.includes('export default function') || content.includes('export function'))) {
      // Find first function in file
      const funcMatch = content.match(/(export\s+(default\s+)?function\s+\w+\s*\([^)]*\)\s*\{)/);
      if (funcMatch && isClient) {
        const matchIndex = funcMatch.index + funcMatch[0].length;
        // Find first non-empty line after function declaration
        const afterFunc = content.slice(matchIndex);
        const firstLineMatch = afterFunc.match(/^(\s*)(\S+)/m);
        if (firstLineMatch) {
          const indent = firstLineMatch[1];
          const insertIndex = matchIndex + firstLineMatch.index;
          content = content.slice(0, insertIndex) + 
                   `\n${indent}const t = useTranslations('${namespace}')\n` + 
                   content.slice(insertIndex);
          hasHook = true;
        }
      }
    }
    
    // Replace strings (only simple cases)
    const processedKeys = new Set();
    
    file.strings.forEach(str => {
      const text = str.text.trim();
      if (!text || text.length < 3 || text.length > 100) return;
      
      // Skip if contains variables or complex expressions
      if (text.includes('{') || text.includes('${') || text.includes('`')) return;
      
      // Build key
      const key = str.suggestedKey || `${namespace}.${text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 40)}`;
      
      if (processedKeys.has(key)) return;
      processedKeys.add(key);
      
      // Escape regex special chars
      const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Pattern 1: JSX text nodes >Text<
      const jsxPattern = new RegExp(`(>)\\s*${escapedText}\\s*(<)`, 'g');
      if (jsxPattern.test(content)) {
        content = content.replace(jsxPattern, `$1{t('${key}')}$2`);
        fileReplacements++;
        totalReplacements++;
      }
      
      // Pattern 2: String literals in quotes (title="Text", label="Text")
      const quotedPattern = new RegExp(`(title|label|placeholder|description|aria-label)\\s*=\\s*["']${escapedText}["']`, 'gi');
      if (quotedPattern.test(content)) {
        content = content.replace(quotedPattern, `$1={t('${key}')}`);
        fileReplacements++;
        totalReplacements++;
      }
    });
    
    if (fileReplacements > 0) {
      replacements.push({ file: file.path, count: fileReplacements });
      
      if (!dryRun) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ ${file.path}: ${fileReplacements} replacements`);
      } else {
        console.log(`[DRY RUN] ${file.path}: ${fileReplacements} replacements`);
      }
    } else if (file.strings.length > 0) {
      skipped.push(file.path);
    }
  });
  
  console.log(`\n✅ Total: ${totalReplacements} replacements in ${replacements.length} files`);
  if (skipped.length > 0) {
    console.log(`⚠️  Skipped ${skipped.length} files (no simple replacements found)`);
  }
  console.log();
  
  if (dryRun) {
    console.log('💡 This was a dry run. Remove --dry-run to apply changes.\n');
  } else {
    console.log('💡 Next: Review changes, fix any issues, then run: pnpm i18n:check\n');
  }
  
  return true;
}

/**
 * Main workflow
 */
async function main() {
  console.log('🚀 Auto-migrate toàn bộ ứng dụng sang i18n\n');
  console.log('Workflow:');
  console.log('  1. Extract strings → template.json');
  console.log('  2. Generate migration report');
  console.log('  3. Auto-replace hardcoded strings\n');
  
  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\n');
  }
  
  // Step 1: Extract
  if (!extractStrings()) {
    console.error('❌ Failed at extraction step');
    process.exit(1);
  }
  
  // Step 2: Generate report
  if (!generateReport()) {
    console.error('❌ Failed at report generation step');
    process.exit(1);
  }
  
  // Step 3: Auto-replace
  if (!autoReplace()) {
    console.error('❌ Failed at auto-replace step');
    process.exit(1);
  }
  
  console.log('\n✅ Workflow complete!');
  console.log('\n📝 Next steps:');
  console.log('  1. Review replaced files (git diff)');
  console.log('  2. Check missing translations: pnpm i18n:check');
  console.log('  3. Generate ChatGPT prompt: pnpm i18n:translate');
  console.log('  4. Translate missing keys → Save vào missing-vi.json');
  console.log('  5. Merge translations: pnpm i18n:merge');
  console.log('  6. Validate: pnpm i18n:validate');
  console.log('  7. Fix any manual issues (strings phức tạp)\n');
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

