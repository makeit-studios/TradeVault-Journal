import Link from "next/link";
import { Search } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { SignOutButton } from "@/components/sign-out-button";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/lib/utils";

export function TopNav({ user }: { user: { name?: string | null; email?: string | null } }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/75 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">TV</div>
        </Link>
        <MobileNav />
        <div className="relative hidden max-w-md flex-1 md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search symbols, strategies, accounts..." />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{user.name ?? "Trader"}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary text-sm font-semibold">
            {getInitials(user.name)}
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
