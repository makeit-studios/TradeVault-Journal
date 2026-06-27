"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { appNavigation } from "@/lib/navigation";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open pages"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col lg:hidden">
          <button
            type="button"
            aria-label="Close pages"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-full w-80 max-w-[86vw] flex-col border-r border-dark-surface bg-background p-4 shadow-l2">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brand-gold text-black font-bold">TV</div>
                <div>
                  <p className="font-semibold text-white">TradeVault</p>
                  <p className="text-xs text-soft-gray">Journal</p>
                </div>
              </Link>
              <Button type="button" variant="ghost" size="icon" aria-label="Close pages" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="mt-6 flex-1 space-y-1">
              {appNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-sm px-3 py-3 text-sm font-sans transition",
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
            <div className="border-t border-dark-surface pt-4">
              <SignOutButton />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
