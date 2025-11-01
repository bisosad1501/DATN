# 🚀 Quick Migration - Migrate toàn bộ sang i18n

## ⚡ Cách nhanh nhất (1 command)

```bash
pnpm i18n
# → Chọn 7 (Auto-migrate toàn bộ)
# → Chọn "yes" để dry-run trước (xem preview)
# → Xem kết quả
# → Chạy lại, chọn "no" để apply thật
```

## 📋 Workflow tự động

Script sẽ tự động:

1. ✅ **Extract** tất cả hardcoded strings → `template.json`
2. ✅ **Generate** migration report → `i18n-migration-report.json`
3. ✅ **Auto-replace** hardcoded strings với `t()` calls
4. ✅ **Add imports** `useTranslations` tự động
5. ✅ **Add hook calls** `const t = useTranslations('namespace')` tự động

## 📝 Sau khi auto-migrate

```bash
# 1. Review thay đổi
git diff

# 2. Check missing translations
pnpm i18n:check

# 3. Generate ChatGPT prompt
pnpm i18n:translate

# 4. Copy prompt → ChatGPT → Save vào missing-vi.json

# 5. Merge translations
pnpm i18n:merge

# 6. Validate
pnpm i18n:validate

# 7. Fix manual (nếu có strings phức tạp chưa được replace)
```

## ⚠️ Lưu ý

- **Dry-run trước** để xem preview (an toàn)
- Script chỉ replace **strings đơn giản** (text nodes, props)
- **Review** các thay đổi sau khi auto-migrate
- **Fix manual** những chỗ phức tạp (dynamic strings, template literals)

## 🎯 Tự động hóa ~70-80% công việc!

Phần còn lại cần review và fix manual cho các strings phức tạp.

