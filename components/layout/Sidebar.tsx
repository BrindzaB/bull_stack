"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Star } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/watchlist", label: "Watchlist",  icon: Star },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    // sticky: stays visible while content scrolls
    // top-[4.5rem] = topbar h-14 (3.5rem) + gap p-4 (1rem)
    // h-[calc(100vh-5.5rem)] = viewport - topbar - top gap - bottom gap
    <aside
      className="w-56 shrink-0 self-start sticky top-[4.5rem] h-[calc(100vh-5.5rem)]
                 rounded-2xl bg-white shadow-card flex flex-col overflow-hidden"
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
                  ? "bg-indigo-500/10 text-indigo-700"
                  : "text-surface-600 hover:bg-surface-50 hover:text-surface-900"
                }`}
            >
              <Icon
                size={18}
                className={active ? "text-indigo-500" : "text-surface-400"}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-surface-100">
        <p className="text-xs text-surface-400">⌘K to search</p>
      </div>
    </aside>
  )
}
