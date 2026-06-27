import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="container flex min-h-screen items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to open your TradeVault workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="login" />
          <p className="mt-4 text-center text-sm text-soft-gray">
            New here?{" "}
            <Link href="/register" className="text-brand-gold font-medium hover:opacity-80">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
