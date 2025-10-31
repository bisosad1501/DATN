/**
 * Standardized Layout Constants
 * Đảm bảo tất cả các trang có sự đồng bộ về spacing, typography, và container
 */

// Container widths
export const CONTAINER_WIDTHS = {
  sm: "max-w-3xl", // For forms, profile pages
  md: "max-w-4xl", // For content pages, detail pages
  lg: "max-w-6xl", // For list pages, courses
  xl: "max-w-7xl", // For dashboard, wide content
  full: "max-w-full", // For full width pages
} as const

// Standard padding
export const PAGE_PADDING = {
  // Vertical padding (top/bottom)
  vertical: {
    sm: "py-6", // Compact pages
    md: "py-8", // Standard pages (DEFAULT)
    lg: "py-12", // Spacious pages (hero sections)
  },
  // Horizontal padding (left/right)
  horizontal: {
    sm: "px-4", // Standard (DEFAULT)
    md: "px-6", // Comfortable
    lg: "px-8", // Spacious
  },
} as const

// Standard container wrapper
export const PAGE_CONTAINER = {
  // Standard page container (most pages)
  standard: `container mx-auto px-4 py-8`,
  // Compact container
  compact: `container mx-auto px-4 py-6`,
  // Spacious container
  spacious: `container mx-auto px-4 py-12`,
  // Full width container
  full: `container mx-auto px-4`,
} as const

// Typography - Headings
export const TYPOGRAPHY = {
  // Page title (h1)
  pageTitle: "text-3xl font-bold tracking-tight",
  // Page subtitle
  pageSubtitle: "text-base text-muted-foreground",
  // Section title (h2)
  sectionTitle: "text-2xl font-semibold tracking-tight",
  // Card title (h3)
  cardTitle: "text-xl font-semibold",
  // Subsection title (h4)
  subsectionTitle: "text-lg font-medium",
} as const

// Standard page header structure
export const PAGE_HEADER = {
  container: "mb-8",
  title: TYPOGRAPHY.pageTitle,
  subtitle: `${TYPOGRAPHY.pageSubtitle} mt-2`,
} as const

// Spacing between sections
export const SPACING = {
  section: "space-y-6", // Standard spacing between sections
  compact: "space-y-4", // Compact spacing
  spacious: "space-y-8", // Spacious spacing
} as const

