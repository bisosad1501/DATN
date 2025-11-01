"use client"

import Link from "next/link"
import { Logo } from "./logo"
import { APP_CONFIG } from "@/lib/constants/config"
import { useTranslations } from "@/lib/i18n"

export function Footer() {
  const t = useTranslations('common')
  const tFooter = useTranslations('footer')
  
  const FOOTER_LINKS = {
    product: [
      { title: t('courses'), href: "/courses" },
      { title: t('exercises'), href: "/exercises" },
      { title: t('leaderboard'), href: "/leaderboard" },
    ],
    company: [
      { title: tFooter('aboutUs'), href: "/about" },
      { title: tFooter('contact'), href: "/contact" },
      { title: tFooter('blog'), href: "/blog" },
    ],
    legal: [
      { title: tFooter('terms'), href: "/terms" },
      { title: tFooter('privacy'), href: "/privacy" },
      { title: tFooter('cookies'), href: "/cookies" },
    ],
  }
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2 space-y-3">
            <Logo className="mb-3" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {tFooter('description')}
            </p>
          </div>

          {/* Links sections */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold mb-2">{tFooter('product')}</h3>
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
            <h3 className="text-sm font-semibold mb-2">{tFooter('company')}</h3>
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
            <h3 className="text-sm font-semibold mb-2">{tFooter('legal')}</h3>
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
