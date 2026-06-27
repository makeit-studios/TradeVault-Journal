import { updateProfile } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function SettingsPage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });

  return (
    <>
      <PageHeader title="Settings" description="" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your name appears in the dashboard header and account records.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateProfile} className="grid gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input name="name" defaultValue={user.name ?? ""} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={user.email} disabled />
              </div>
              <Button className="w-fit">Save changes</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>TradeVault is configured for a local SQLite MVP that can later move to Supabase.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>Authentication: NextAuth credentials provider</p>
            <p>Database: Prisma ORM with SQLite</p>
            <p>Charts: Recharts with server-side aggregated data</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

