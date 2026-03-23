import { auth } from "@/lib/auth"
import { UserMenu } from "./UserMenu"
import StockSearchBar from "../stock/StockSearchBar"
import Image from "next/image"

export async function TopBar() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-40 h-14 flex items-center gap-3 px-4 md:px-6 backdrop-blur-xl" style={{ background: 'rgba(0, 0, 0, 0.3)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <Image src="/logo.png" alt="BullStack" width={90} height={24} className="hidden md:block shrink-0 object-contain" style={{ maxHeight: '40px', width: 'auto' }} priority />
      <div className="flex-1 md:flex md:justify-center">
        <StockSearchBar />
      </div>
      {session && <UserMenu session={session} />}
    </header>
  )
}
