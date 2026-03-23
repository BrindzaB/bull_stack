"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Star, ChartNoAxesCombined, Newspaper} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/watchlist", label: "Watchlist",  icon: Star },
  { href: "/portfolio", label: "Portfolio", icon: ChartNoAxesCombined},
  { href: "/news", label: "News", icon: Newspaper}
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:flex w-56 shrink-0 h-full rounded-2xl flex-col overflow-hidden backdrop-blur-xl menu"
      
    >
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${active
                  ? "bg-[rgba(34,211,238,0.12)] text-[#22d3ee]"
                  : "text-white hover:bg-white/[0.06] hover:text-white/90"
                }`}
            >
              <Icon
                size={18}
                className={active ? "text-[#22d3ee]" : "text-white"}
              />
              {label}
            </Link>
          )
        })}
      </nav>

    </aside>
  )
}
