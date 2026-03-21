import { auth } from "@/lib/auth"
import { UserMenu } from "./UserMenu"
import StockSearchBar from "../stock/StockSearchBar"

export async function TopBar() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-4 md:px-6">
      <span className="hidden md:block text-xl font-bold tracking-tight text-brand-500 select-none shrink-0">BullStack</span>
      <div className="flex-1 md:flex md:justify-center">
        <StockSearchBar />
      </div>
      {session && <UserMenu session={session} />}
    </header>
  )
}
