import { TopBar } from "@/components/layout/Topbar"
import Sidebar from "@/components/layout/Sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />
      <div className="flex flex-1 min-h-0 gap-4 p-4">
        <Sidebar />
        <main className="flex-1 min-w-0 min-h-0 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
