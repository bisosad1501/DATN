#!/usr/bin/env node

/**
 * 🌍 I18n Manager - All-in-one script
 * Quản lý tất cả i18n operations trong 1 script duy nhất
 * 
 * Usage: node scripts/i18n.js [command]
 *    hoặc: node scripts/i18n.js (interactive menu)
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const appDir = path.join(__dirname, '..');
const messagesDir = path.join(appDir, 'messages');
const viPath = path.join(messagesDir, 'vi.json');
const enPath = path.join(messagesDir, 'en.json');
const templatePath = path.join(messagesDir, 'template.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Import functions from modules
const { generateMigrationReport } = require('./auto-migrate-i18n');
const { deepMerge, findMissingKeys } = require('./merge-translations-module');

/**
 * Check missing translations (using merge-translations-module)
 */
function checkMissingTranslations() {
  if (!fs.existsSync(templatePath)) {
    console.log('⚠️  Chưa có template.json. Chạy "Extract strings" trước!\n');
    return;
  }
  
  const template = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
  const existing = {
    vi: fs.existsSync(viPath) ? JSON.parse(fs.readFileSync(viPath, 'utf-8')) : {},
    en: fs.existsSync(enPath) ? JSON.parse(fs.readFileSync(enPath, 'utf-8')) : {},
  };
  
  const missing = {
    vi: findMissingKeys(existing.vi, template),
    en: findMissingKeys(existing.en, template),
  };
  
  const viMissingCount = Object.values(missing.vi).reduce((sum, ns) => {
    return sum + (typeof ns === 'object' ? Object.keys(ns).length : 1);
  }, 0);
  const enMissingCount = Object.values(missing.en).reduce((sum, ns) => {
    return sum + (typeof ns === 'object' ? Object.keys(ns).length : 1);
  }, 0);
  
  console.log(`\n📊 Translation Status:\n`);
  console.log(`   Vietnamese: ${viMissingCount} missing keys`);
  console.log(`   English: ${enMissingCount} missing keys\n`);
  
  if (viMissingCount === 0 && enMissingCount === 0) {
    console.log('✅ All translations are up to date!\n');
    return;
  }
  
  // Save missing keys
  const missingViPath = path.join(messagesDir, 'missing-vi.json');
  const missingEnPath = path.join(messagesDir, 'missing-en.json');
  
  if (viMissingCount > 0) {
    fs.writeFileSync(missingViPath, JSON.stringify(missing.vi, null, 2));
    console.log(`📝 Missing Vietnamese keys saved to: ${missingViPath}`);
  }
  
  if (enMissingCount > 0) {
    fs.writeFileSync(missingEnPath, JSON.stringify(missing.en, null, 2));
    console.log(`📝 Missing English keys saved to: ${missingEnPath}`);
  }
  
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Translate missing keys`);
  console.log(`   2. Save translated keys back to missing-*.json`);
  console.log(`   3. Run: pnpm i18n merge\n`);
}

/**
 * Merge missing translations
 */
function mergeMissingTranslations() {
  const missingViPath = path.join(messagesDir, 'missing-vi.json');
  const missingEnPath = path.join(messagesDir, 'missing-en.json');
  
  if (!fs.existsSync(missingViPath) && !fs.existsSync(missingEnPath)) {
    console.log('❌ No missing-*.json files found. Run "Check missing" first.\n');
    return;
  }
  
  const existing = {
    vi: fs.existsSync(viPath) ? JSON.parse(fs.readFileSync(viPath, 'utf-8')) : {},
    en: fs.existsSync(enPath) ? JSON.parse(fs.readFileSync(enPath, 'utf-8')) : {},
  };
  
  if (fs.existsSync(missingViPath)) {
    const missing = JSON.parse(fs.readFileSync(missingViPath, 'utf-8'));
    existing.vi = deepMerge(existing.vi, missing);
    fs.writeFileSync(viPath, JSON.stringify(existing.vi, null, 2));
    console.log('✅ Merged missing-vi.json into vi.json');
    fs.unlinkSync(missingViPath);
  }
  
  if (fs.existsSync(missingEnPath)) {
    const missing = JSON.parse(fs.readFileSync(missingEnPath, 'utf-8'));
    existing.en = deepMerge(existing.en, missing);
    fs.writeFileSync(enPath, JSON.stringify(existing.en, null, 2));
    console.log('✅ Merged missing-en.json into en.json');
    fs.unlinkSync(missingEnPath);
  }
  
  console.log('\n✅ Merge hoàn tất!\n');
}

/**
 * MENU - Hiển thị menu chính
 */
async function showMenu() {
  console.log('\n🌍 I18n Manager - Quản lý đa ngôn ngữ\n');
  console.log('Chọn hành động:');
  console.log('  1. 📥 Extract strings từ code');
  console.log('  2. 🔍 Check missing translations');
  console.log('  3. 🔄 Merge translations');
  console.log('  4. ✅ Validate translations');
  console.log('  5. 📊 Migration report (hardcoded strings)');
  console.log('  6. 🚀 Auto-migrate toàn bộ');
  console.log('  7. 🧹 Clean unused keys');
  console.log('  8. 📖 Hiển thị hướng dẫn');
  console.log('  0. ❌ Thoát\n');
  
  const choice = await question('👉 Chọn số (0-8): ');
  return choice.trim();
}

/**
 * 1. Extract strings từ code
 */
async function extract() {
  console.log('\n📥 Đang extract strings từ code...\n');
  try {
    execSync('node scripts/extract-translations-improved.js', { 
      stdio: 'inherit',
      cwd: appDir 
    });
    console.log('\n✅ Extract hoàn tất! Xem: messages/template.json\n');
  } catch (error) {
    console.error('❌ Lỗi khi extract:', error.message);
  }
}

/**
 * 2. Check missing translations
 */
async function checkMissing() {
  console.log('\n🔍 Đang kiểm tra missing translations...\n');
  checkMissingTranslations();
}

/**
 * 3. Merge translations
 */
async function merge() {
  console.log('\n🔄 Đang merge translations...\n');
  mergeMissingTranslations();
}

/**
 * 4. Validate translations
 */
async function validate() {
  console.log('\n✅ Đang validate translations...\n');
  try {
    execSync('node scripts/validate-i18n.js', { 
      stdio: 'inherit',
      cwd: appDir 
    });
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

/**
 * 5. Migration report
 */
async function migrationReport() {
  console.log('\n📊 Đang tạo migration report...\n');
  try {
    generateMigrationReport();
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

/**
 * 6. Auto-migrate all
 */
async function autoMigrateAll() {
  console.log('\n🚀 Đang auto-migrate toàn bộ ứng dụng...\n');
  try {
    const dryRun = await question('Chạy dry-run trước? (yes/no, mặc định: yes): ');
    const isDryRun = dryRun.trim().toLowerCase() !== 'no';
    
    execSync(`node scripts/auto-migrate-all.js ${isDryRun ? '--dry-run' : ''}`, { 
      stdio: 'inherit',
      cwd: appDir 
    });
    
    if (isDryRun) {
      console.log('\n💡 Đã xem preview. Chạy lại và chọn "no" để apply thay đổi.\n');
    } else {
      console.log('\n✅ Auto-migrate hoàn tất!\n');
    }
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

/**
 * 7. Clean unused keys
 */
async function cleanUnused() {
  console.log('\n🧹 Đang kiểm tra unused keys...\n');
  const confirm = await question('⚠️  Chắc chắn muốn xóa unused keys? (yes/no): ');
  if (confirm.toLowerCase() !== 'yes') {
    console.log('❌ Đã hủy.\n');
    return;
  }
  
  try {
    execSync('node scripts/clean-unused-i18n.js', { 
      stdio: 'inherit',
      cwd: appDir 
    });
    console.log('\n✅ Clean hoàn tất!\n');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

/**
 * 8. Hướng dẫn
 */
function showGuide() {
  console.log(`
📖 HƯỚNG DẪN SỬ DỤNG I18N MANAGER

🎯 Workflow cơ bản:
   1. Extract strings → Check missing
   2. Dịch missing keys → Merge → Validate

📝 Chi tiết từng bước:

1️⃣  Extract strings
   → Quét toàn bộ code, tìm hardcoded strings
   → Tạo messages/template.json

2️⃣  Check missing
   → So sánh template với vi.json, en.json
   → Tạo messages/missing-*.json

3️⃣  Merge translations
   → Merge missing-*.json vào vi.json, en.json

4️⃣  Validate
   → Check synchronization
   → Report unused keys, missing keys

5️⃣  Migration report
   → Xem hardcoded strings cần migrate

6️⃣  Auto-migrate
   → Tự động migrate hardcoded strings sang t() calls

7️⃣  Clean unused
   → Xóa translation keys không dùng

💡 Tips:
   - Chạy validate trước khi commit
   - Extract thường xuyên sau mỗi feature
   - Dùng migration report để migrate dần

`);
}

/**
 * MAIN - Entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Direct command mode
  if (command) {
    const commands = {
      'extract': extract,
      'check': checkMissing,
      'merge': merge,
      'validate': validate,
      'migrate': migrationReport,
      'auto-migrate': autoMigrateAll,
      'clean': cleanUnused,
      'help': showGuide,
    };
    
    if (commands[command]) {
      await commands[command]();
      rl.close();
      return;
    } else {
      console.log('❌ Command không hợp lệ. Dùng: extract, check, merge, validate, migrate, auto-migrate, clean, help\n');
      rl.close();
      return;
    }
  }
  
  // Interactive menu mode
  let running = true;
  while (running) {
    const choice = await showMenu();
    
    switch (choice) {
      case '1':
        await extract();
        break;
      case '2':
        await checkMissing();
        break;
      case '3':
        await merge();
        break;
      case '4':
        await validate();
        break;
      case '5':
        await migrationReport();
        break;
      case '6':
        await autoMigrateAll();
        break;
      case '7':
        await cleanUnused();
        break;
      case '8':
        showGuide();
        break;
      case '0':
        console.log('\n👋 Tạm biệt!\n');
        running = false;
        break;
      default:
        console.log('❌ Lựa chọn không hợp lệ. Vui lòng chọn 0-8.\n');
    }
    
    if (running) {
      await question('\n⏎ Nhấn Enter để tiếp tục...');
    }
  }
  
  rl.close();
}

// Run
main().catch(error => {
  console.error('❌ Lỗi:', error);
  process.exit(1);
});
