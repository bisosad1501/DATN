# Layout Components

## PageContainer

`PageContainer` là component trung tâm để quản lý spacing cho tất cả các trang trong ứng dụng.

### Tại sao sử dụng PageContainer?

- ✅ **Centralized Management**: Chỉ cần sửa 1 file để thay đổi spacing cho toàn bộ ứng dụng
- ✅ **Consistent**: Đảm bảo spacing đồng bộ giữa các trang
- ✅ **Maintainable**: Dễ dàng mở rộng và thay đổi sau này
- ✅ **Type-safe**: Hỗ trợ TypeScript với props được định nghĩa rõ ràng

### Cách sử dụng

#### Basic Usage
```tsx
import { PageContainer } from "@/components/layout/page-container"

export default function MyPage() {
  return (
    <AppLayout>
      <PageContainer>
        <h1>My Page Title</h1>
        <p>Page content here</p>
      </PageContainer>
    </AppLayout>
  )
}
```

#### Với maxWidth
```tsx
<PageContainer maxWidth="4xl">
  {/* Content cho trang có độ rộng giới hạn */}
</PageContainer>
```

#### Với variant
```tsx
<PageContainer variant="narrow">  {/* max-width: 4xl */}
  {/* Content */}
</PageContainer>

<PageContainer variant="wide">  {/* max-width: 7xl */}
  {/* Content */}
</PageContainer>
```

#### Custom className
```tsx
<PageContainer className="custom-spacing">
  {/* Content */}
</PageContainer>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Nội dung của trang |
| `className` | `string` | - | Custom CSS classes |
| `maxWidth` | `"sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "4xl" \| "6xl" \| "7xl" \| "full"` | - | Giới hạn độ rộng container |
| `variant` | `"default" \| "narrow" \| "wide"` | `"default"` | Preset variants cho maxWidth |

### Spacing Standards

Hiện tại spacing được định nghĩa:
- **Horizontal padding**: `px-4 sm:px-6 lg:px-8`
- **Vertical padding**: `py-8 sm:py-12 lg:py-16`

### Thay đổi Spacing Global

Để thay đổi spacing cho toàn bộ ứng dụng, chỉ cần sửa file:
```
components/layout/page-container.tsx
```

Thay đổi các class trong `className` của `PageContainer` component.

### Migration Guide

Để migrate trang cũ sang `PageContainer`:

**Trước:**
```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
  {/* Content */}
</div>
```

**Sau:**
```tsx
import { PageContainer } from "@/components/layout/page-container"

<PageContainer>
  {/* Content */}
</PageContainer>
```

**Với maxWidth:**
```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-4xl">
  {/* Content */}
</div>
```

→ 

```tsx
<PageContainer maxWidth="4xl">
  {/* Content */}
</PageContainer>
```

