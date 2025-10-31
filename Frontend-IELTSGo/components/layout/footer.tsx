import Link from "next/link"
import { Logo } from "./logo"
import { APP_CONFIG } from "@/lib/constants/config"

const FOOTER_LINKS = {
  product: [
    { title: "Khóa học", href: "/courses" },
    { title: "Luyện tập", href: "/exercises" },
    { title: "Bảng xếp hạng", href: "/leaderboard" },
  ],
  company: [
    { title: "Về chúng tôi", href: "/about" },
    { title: "Liên hệ", href: "/contact" },
    { title: "Blog", href: "/blog" },
  ],
  legal: [
    { title: "Điều khoản", href: "/terms" },
    { title: "Chính sách", href: "/privacy" },
    { title: "Cookies", href: "/cookies" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2 space-y-3">
            <Logo className="mb-3" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {APP_CONFIG.description}. Học IELTS hiệu quả với phương pháp hiện đại và giáo viên chuyên nghiệp.
            </p>
          </div>

          {/* Links sections */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold mb-2">Sản phẩm</h3>
            <ul className="space-y-1.5">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold mb-2">Công ty</h3>
            <ul className="space-y-1.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold mb-2">Pháp lý</h3>
            <ul className="space-y-1.5">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-10 sm:mt-12 pt-6 border-t border-border/40">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
