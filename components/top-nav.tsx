import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { getInitials } from "@/lib/utils";

export function TopNav({ user }: { user: { name?: string | null } }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/75 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">TV</div>
        </Link>
        <MobileNav />
        <div className="ml-auto flex items-center gap-3">
          <p className="hidden text-sm font-medium sm:block">{user.name ?? "Trader"}</p>
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary text-sm font-semibold">
            {getInitials(user.name)}
          </div>
        </div>
      </div>
    </header>
  );
}
