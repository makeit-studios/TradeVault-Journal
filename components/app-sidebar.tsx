"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";
import { appNavigation } from "@/lib/navigation";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-dark-surface bg-background lg:flex">
      <div className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brand-gold text-black font-bold">TV</div>
          <div>
            <p className="font-semibold text-white">TradeVault</p>
            <p className="text-xs text-soft-gray">Journal</p>
          </div>
        </Link>
        <nav className="mt-6 space-y-1">
          {appNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-sans transition",
                  isActive
                    ? "bg-brand-gold/10 text-brand-gold font-medium"
                    : "text-soft-gray hover:text-brand-gold hover:bg-brand-gold/5"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto border-t border-dark-surface p-4">
        <SignOutButton />
      </div>
    </aside>
  );
}
