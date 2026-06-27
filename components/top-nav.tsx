import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { SearchBar } from "@/components/search-bar";
import { getInitials } from "@/lib/utils";

export function TopNav({ user }: { user: { name?: string | null } }) {
  return (
    <header className="sticky top-0 z-20 border-b border-dark-surface bg-background/75 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brand-gold text-black font-bold">TV</div>
        </Link>
        <MobileNav />
        <SearchBar />
        <div className="ml-auto flex items-center gap-3">
          <p className="hidden text-sm font-medium text-soft-gray sm:block">{user.name ?? "Trader"}</p>
          <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-dark-surface bg-dark-charcoal text-sm font-semibold text-white">
            {getInitials(user.name)}
          </div>
        </div>
      </div>
    </header>
  );
}
