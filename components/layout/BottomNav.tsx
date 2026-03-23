"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Star, ChartNoAxesCombined, Newspaper } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/watchlist", label: "Watchlist",  icon: Star },
  { href: "/portfolio", label: "Portfolio", icon: ChartNoAxesCombined },
  { href: "/news",      label: "News",      icon: Newspaper },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex md:hidden backdrop-blur-xl" style={{ background: 'rgba(0,0,0,0.30)', borderTop: '1px solid rgba(255,255,255,0.10)' }}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/")

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors
              ${active ? "text-[#22d3ee]" : "text-white/40 hover:text-white/70"}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
