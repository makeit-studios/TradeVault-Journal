import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";
import { appNavigation } from "@/lib/navigation";

export function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border/70 bg-background/70 backdrop-blur-xl lg:flex">
      <div className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">TV</div>
          <div>
            <p className="font-semibold">TradeVault</p>
            <p className="text-xs text-muted-foreground">Journal</p>
          </div>
        </Link>
        <nav className="mt-6 space-y-1">
          {appNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t border-border/70 p-4">
        <SignOutButton />
      </div>
    </aside>
  );
}
