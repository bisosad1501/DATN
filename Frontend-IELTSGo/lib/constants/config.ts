export const APP_CONFIG = {
  name: "IELTSGo",
  description: "Nền tảng học IELTS trực tuyến",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
} as const

export const THEME_CONFIG = {
  colors: {
    primary: "#ED372A",
    dark: "#101615",
    cream: "#FEF7EC",
  },
  fonts: {
    heading: "Poppins",
    body: "Inter",
  },
} as const

export const LAYOUT_CONFIG = {
  sidebar: {
    width: 280,
    collapsedWidth: 80,
  },
  navbar: {
    height: 64,
  },
  footer: {
    height: 80,
  },
} as const
