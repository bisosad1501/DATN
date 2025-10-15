# 🎨 MÀUSẮC CHÍNH THỨC IELTSGO

> Trích xuất từ logo chính thức `logo/IELTSGo-Logo.png` và `logo/IELTSGo-Logo.svg`

---

## 🔴 Màu Chính - RED (Đỏ)

### Primary Red
```
HEX: #ED372A
RGB: rgb(237, 55, 42)
HSL: hsl(4, 85%, 55%)
```

**Sử dụng cho:**
- Buttons chính (Primary CTA)
- Links và hover states
- Active navigation items
- Brand elements
- Icons chính
- Progress bars hoàn thành

**Variants:**
```css
--primary: #ED372A;           /* Base */
--primary-hover: #d42e22;     /* Hover state */
--primary-light: #fee2e2;     /* Light background */
--primary-dark: #b91c1c;      /* Dark variant */
```

---

## ⚫ Màu Phụ - DARK (Đen/Xám Đậm)

### Secondary Dark
```
HEX: #101615
RGB: rgb(16, 22, 21)
HSL: hsl(165, 16%, 7%)
```

**Sử dụng cho:**
- Text chính (headings, body text)
- Navigation bar
- Footer
- Borders quan trọng
- Icons phụ
- Backgrounds tối

**Variants:**
```css
--secondary: #101615;         /* Base */
--secondary-hover: #1f2937;   /* Hover state */
--secondary-light: #f3f4f6;   /* Light background */
--secondary-muted: #6b7280;   /* Muted text */
```

---

## 🟡 Màu Nhấn - CREAM (Be/Vàng Nhạt)

### Accent Cream/Beige
```
HEX: #FEF7EC
RGB: rgb(254, 247, 236)
HSL: hsl(37, 90%, 96%)
```

**Sử dụng cho:**
- Card backgrounds
- Section backgrounds
- Subtle highlights
- Hover effects (nhẹ nhàng)
- Empty states
- Light borders

**Variants:**
```css
--accent: #FEF7EC;            /* Base */
--accent-hover: #f5e5d3;      /* Hover state */
--accent-light: #fffbf5;      /* Lighter */
--accent-dark: #e8d4ba;       /* Darker */
```

---

## 🔴 Màu Bóng - DARK RED (Đỏ Sẫm)

### Shadow/Depth Red
```
HEX: #B92819
RGB: rgb(185, 40, 25)
HSL: hsl(6, 76%, 41%)
```

**Sử dụng cho:**
- Box shadows
- Depth effects
- Secondary buttons
- Hover states cho red elements
- Borders quan trọng
- Error states

**Variants:**
```css
--dark-red: #B92819;          /* Base */
--dark-red-hover: #a01f12;    /* Hover state */
--dark-red-light: #fca5a5;    /* Light variant */
```

---

## 🎨 Palette Đầy Đủ (TailwindCSS)

### Cấu hình tailwind.config.js

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ED372A',  // Main
          600: '#d42e22',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        secondary: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#101615',  // Main
          600: '#0a0f0e',
          700: '#1f2937',
          800: '#111827',
          900: '#030712',
        },
        accent: {
          50: '#fffbf5',
          100: '#fef7ec',  // Main
          200: '#fef3e2',
          300: '#fdefd8',
          400: '#fce7c4',
          500: '#f5e5d3',
          600: '#e8d4ba',
          700: '#dbc3a1',
          800: '#ceb288',
          900: '#c1a16f',
        },
        darkRed: {
          DEFAULT: '#B92819',
          hover: '#a01f12',
          light: '#fca5a5',
        }
      }
    }
  }
}
```

---

## 💡 Hướng Dẫn Sử Dụng

### 1. Buttons

```tsx
// Primary Button (Đỏ)
<Button className="bg-primary-500 hover:bg-primary-600 text-white">
  Enroll Now
</Button>

// Secondary Button (Đen)
<Button className="bg-secondary-500 hover:bg-secondary-700 text-white">
  Learn More
</Button>

// Outline Button (Viền đỏ)
<Button className="border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white">
  Try Free
</Button>

// Ghost Button
<Button className="text-secondary-500 hover:bg-accent-100">
  Cancel
</Button>
```

### 2. Text & Headings

```tsx
// Heading (Đen đậm)
<h1 className="text-secondary-500 font-bold text-4xl">
  Welcome to IELTSGo
</h1>

// Body Text (Xám)
<p className="text-secondary-400 text-base">
  Learn IELTS effectively with our platform
</p>

// Link (Đỏ)
<a href="#" className="text-primary-500 hover:text-primary-600 underline">
  Learn more
</a>
```

### 3. Cards & Backgrounds

```tsx
// Card với nền Cream
<Card className="bg-accent-100 border border-accent-200">
  <CardContent>...</CardContent>
</Card>

// Card với shadow đỏ
<Card className="shadow-lg shadow-darkRed/10">
  <CardContent>...</CardContent>
</Card>

// Section Background
<section className="bg-accent-50 py-16">
  ...
</section>
```

### 4. Navigation

```tsx
// Active nav item (Đỏ)
<NavItem className="text-primary-500 border-b-2 border-primary-500">
  Dashboard
</NavItem>

// Inactive nav item (Xám)
<NavItem className="text-secondary-400 hover:text-secondary-500">
  Courses
</NavItem>
```

### 5. Badges & Status

```tsx
// Success (Đỏ nhạt)
<Badge className="bg-primary-100 text-primary-700">
  New
</Badge>

// Premium (Đỏ sẫm)
<Badge className="bg-darkRed text-white">
  Premium
</Badge>

// Info (Cream)
<Badge className="bg-accent-200 text-secondary-700">
  Featured
</Badge>
```

### 6. Forms

```tsx
// Input Focus (Đỏ)
<Input className="border-gray-300 focus:border-primary-500 focus:ring-primary-500" />

// Checkbox Active (Đỏ)
<Checkbox className="text-primary-500 focus:ring-primary-500" />

// Error State
<Input className="border-red-500 focus:border-red-600" />
<p className="text-red-500 text-sm">Email is required</p>
```

---

## ⚠️ Các Màu KHÔNG Dùng

**Đây là các màu sai trước đây (đã sửa):**

```
❌ #2563EB (Blue - không phải màu IELTSGo)
❌ #10B981 (Green - không phải màu IELTSGo)  
❌ #F59E0B (Orange - không phải màu IELTSGo)
```

**Chỉ dùng màu từ logo chính thức:**
- ✅ Red #ED372A
- ✅ Dark #101615
- ✅ Cream #FEF7EC
- ✅ Dark Red #B92819

---

## 🎯 Tỷ Lệ Sử Dụng Đề Xuất

```
Primary Red (#ED372A):     25-30%  (CTAs, branding, important actions)
Secondary Dark (#101615):  40-45%  (Text, navigation, footer)
Accent Cream (#FEF7EC):    20-25%  (Backgrounds, cards, sections)
Dark Red (#B92819):        5-10%   (Shadows, depth, accents)
Neutrals (Gray):           Còn lại (Borders, muted text, etc.)
```

---

## 📱 Accessibility (WCAG AAA)

### Contrast Ratios

**Text on Light Background:**
- ✅ Dark (#101615) on White: 18.2:1 (Excellent)
- ✅ Dark (#101615) on Cream (#FEF7EC): 17.1:1 (Excellent)

**Text on Dark Background:**
- ✅ White on Red (#ED372A): 4.8:1 (Good for large text)
- ✅ White on Dark (#101615): 18.2:1 (Excellent)

**Buttons:**
- ✅ White text on Red button: 4.8:1 (Meets AA for large text)
- ⚠️ Use white text on red buttons (don't use dark text)

---

## 🖼️ Preview Combinations

### ✅ Good Combinations

```
White background + Red button + Dark text
Cream background + Red accents + Dark text
Dark header + White text + Red logo
Red button + White text
Dark text + Cream background
```

### ❌ Avoid

```
Red text on Dark background (poor contrast)
Cream text on White background (too similar)
Red background with Dark Red text (poor contrast)
```

---

## 📦 Export cho Design Tools

### Figma Variables
```
Red/Primary: #ED372A
Dark/Secondary: #101615
Cream/Accent: #FEF7EC
DarkRed/Shadow: #B92819
```

### Adobe XD
```
Primary Color: ED372A
Secondary Color: 101615
Accent Color: FEF7EC
Shadow Color: B92819
```

---

**File này là nguồn chính thức cho màu sắc IELTSGo.**  
Tất cả components phải tuân thủ palette này.

Cập nhật: 14/10/2025
