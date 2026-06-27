"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm text-soft-gray transition hover:text-brand-gold hover:bg-brand-gold/5"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}
