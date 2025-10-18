# 🎨 Brand Text Component - IELTSGo

## Màu sắc chính thức từ Logo

Text "IELTSGo" phải được hiển thị với màu sắc chính xác:
- **IELTS**: Màu đen `#101615` (Dark)
- **Go**: Màu đỏ `#ED372A` (Primary Red)

## Component `<BrandText />`

Component đã được tạo tại: `components/ui/brand-text.tsx`

### Usage

```tsx
import { BrandText } from "@/components/ui/brand-text"

// Basic usage
<BrandText />

// With custom size
<BrandText size="lg" />
<BrandText size="xl" />

// White variant (for dark backgrounds)
<BrandText variant="white" />

// Custom className
<BrandText className="text-4xl" />
```

### Props

- `variant`: `"default" | "white"` - Màu sắc phù hợp với background
- `size`: `"sm" | "md" | "lg" | "xl"` - Kích thước predefined
- `className`: string - Custom Tailwind classes

## Các component đã được cập nhật

✅ **Logo Component** (`components/layout/logo.tsx`)
- Sử dụng BrandText để hiển thị text
- Support variant cho dark/light backgrounds

✅ **Admin Sidebar** (`components/admin/admin-sidebar.tsx`)
- Logo với BrandText trong collapsed mode
- Text "IELTS" đen, "Go" đỏ

✅ **Home Page** (`app/page.tsx`)
- Hero section với BrandText

✅ **Login Page** (`app/login/page.tsx`)
- Header với BrandText

✅ **Register Page** (`app/register/page.tsx`)
- Header với BrandText

## Quy tắc sử dụng

### ✅ DO

```tsx
// Sử dụng component BrandText
<h1>Welcome to <BrandText /></h1>

// Hoặc Logo component
<Logo />
```

### ❌ DON'T

```tsx
// KHÔNG viết text trực tiếp
<h1>Welcome to IELTSGo</h1>

// KHÔNG dùng màu sai
<span className="text-red-500">IELTSGo</span>
```

## Styling Guidelines

1. **Text luôn là "IELTS" + "Go"** (không phải "IELTSGo")
2. **IELTS**: Luôn màu đen `#101615`
3. **Go**: Luôn màu đỏ `#ED372A`
4. **Font**: Sử dụng `font-heading` (Poppins) cho brand text
5. **White variant**: Chỉ dùng khi background tối

## Examples trong hệ thống

### Admin Panel
```tsx
<div className="bg-[#FEF7EC]">
  <BrandText size="lg" /> {/* Variant mặc định */}
</div>
```

### Dark Header
```tsx
<div className="bg-[#101615]">
  <BrandText variant="white" /> {/* White text cho background tối */}
</div>
```

### Hero Section
```tsx
<h1 className="text-5xl">
  Chinh phục IELTS cùng <BrandText className="text-5xl" />
</h1>
```

## Maintenance

Khi cần thay đổi màu sắc brand:
1. Cập nhật `THEME_CONFIG` trong `lib/constants/config.ts`
2. Cập nhật component `BrandText`
3. Không cần update từng page riêng lẻ

## Related Files

- `components/ui/brand-text.tsx` - Brand text component
- `components/layout/logo.tsx` - Logo with brand text
- `lib/constants/config.ts` - Theme colors
- `IELTSGO_COLORS.md` - Full color documentation
