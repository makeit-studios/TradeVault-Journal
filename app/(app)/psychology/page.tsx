import type { InputHTMLAttributes } from "react";
import { format } from "date-fns";
import { createPsychologyEntry } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function PsychologyPage() {
  const user = await requireUser();
  const [accounts, entries] = await Promise.all([
    prisma.tradingAccount.findMany({ where: { userId: user.id } }),
    prisma.psychologyEntry.findMany({ where: { userId: user.id }, include: { account: true }, orderBy: { date: "desc" } })
  ]);

  return (
    <>
      <PageHeader title="Psychology" description="" />
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader><CardTitle>New entry</CardTitle></CardHeader>
          <CardContent>
            <form action={createPsychologyEntry} className="grid gap-4">
              <div className="space-y-2">
                <Label>Account</Label>
                <select name="accountId" className="h-14 w-full rounded-xl border-0 border-b border-medium-gray bg-transparent px-0 pb-1.5 pt-5 text-sm text-white focus-visible:outline-none focus-visible:border-brand-gold">
                  <option value="" className="text-soft-gray">General day</option>
                  {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                </select>
              </div>
              <Field name="date" label="Date" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
              <Field name="emotionsBefore" label="Emotions before trade" placeholder="Calm, anxious, focused..." />
              <Field name="emotionsAfter" label="Emotions after trade" placeholder="Neutral, frustrated, proud..." />
              <Field name="confidenceRating" label="Confidence rating" type="number" min="1" max="10" defaultValue="7" />
              <div className="space-y-2"><Label>Mistakes made</Label><Textarea name="mistakesMade" /></div>
              <div className="space-y-2"><Label>Daily reflection</Label><Textarea name="dailyReflection" required /></div>
              <Button>Save reflection</Button>
            </form>
          </CardContent>
        </Card>
        <div className="grid gap-4">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{format(entry.date, "MMMM d, yyyy")}</p>
                    <p className="text-sm text-soft-gray">{entry.account?.name ?? "General day"}</p>
                  </div>
                  <Badge variant={entry.confidenceRating >= 8 ? "positive" : entry.confidenceRating >= 5 ? "warning" : "negative"}>Confidence {entry.confidenceRating}/10</Badge>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Note label="Before" value={entry.emotionsBefore} />
                  <Note label="After" value={entry.emotionsAfter} />
                </div>
                {entry.mistakesMade ? <Note label="Mistakes" value={entry.mistakesMade} className="mt-3" /> : null}
                <Note label="Reflection" value={entry.dailyReflection} className="mt-3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

const Field = ({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) => {
  return <div className="space-y-2"><Label>{label}</Label><Input required {...props} /></div>;
};

const Note = ({ label, value, className }: { label: string; value: string; className?: string }) => {
  return <div className={className}><p className="text-xs uppercase text-soft-gray">{label}</p><p className="mt-1 text-sm leading-6 text-white">{value}</p></div>;
};

