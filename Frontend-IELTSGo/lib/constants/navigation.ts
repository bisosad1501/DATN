export const MAIN_NAV_ITEMS = [
  {
    title: "Trang chủ",
    href: "/",
    icon: "Home",
  },
  {
    title: "Khóa học",
    href: "/courses",
    icon: "BookOpen",
  },
  {
    title: "Luyện tập",
    href: "/exercises",
    icon: "PenTool",
  },
  {
    title: "Bảng xếp hạng",
    href: "/leaderboard",
    icon: "Trophy",
  },
] as const

export const USER_NAV_ITEMS = [
  {
    title: "Hồ sơ",
    href: "/profile",
    icon: "User",
  },
  {
    title: "Cài đặt",
    href: "/settings",
    icon: "Settings",
  },
] as const

export const SIDEBAR_NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "Khóa học của tôi",
    href: "/my-courses",
    icon: "BookOpen",
  },
  {
    title: "Bài tập đã làm",
    href: "/my-exercises",
    icon: "CheckSquare",
  },
  {
    title: "Bảng xếp hạng",
    href: "/leaderboard",
    icon: "Trophy",
  },
  {
    title: "Thông báo",
    href: "/notifications",
    icon: "Bell",
  },
] as const

export const INSTRUCTOR_NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/instructor",
    icon: "LayoutDashboard",
  },
  {
    title: "Khóa học",
    href: "/instructor/courses",
    icon: "BookOpen",
  },
  {
    title: "Bài tập",
    href: "/instructor/exercises",
    icon: "PenTool",
  },
  {
    title: "Học viên",
    href: "/instructor/students",
    icon: "Users",
  },
  {
    title: "Tin nhắn",
    href: "/instructor/messages",
    icon: "MessageSquare",
  },
] as const

export const ADMIN_NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: "LayoutDashboard",
    children: [],
  },
  {
    title: "Quản lý người dùng",
    href: "/admin/users",
    icon: "Users",
    children: [],
  },
  {
    title: "Quản lý nội dung",
    href: "/admin/content",
    icon: "FileText",
    children: [],
  },
  {
    title: "Phân tích",
    href: "/admin/analytics",
    icon: "BarChart",
    children: [],
  },
  {
    title: "Thông báo",
    href: "/admin/notifications",
    icon: "Bell",
    children: [],
  },
  {
    title: "Cài đặt hệ thống",
    href: "/admin/settings",
    icon: "Settings",
    children: [],
  },
] as const
