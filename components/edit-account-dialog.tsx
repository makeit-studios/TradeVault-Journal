"use client";

import { useState } from "react";
import { updateAccount } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Account {
  id: string;
  name: string;
  broker: string;
  accountType: string;
  startingBalance: number;
  currentBalance: number;
  profitTarget: number;
  dailyDrawdown: number;
  maxDrawdown: number;
  minTradingDays: number;
  status: string;
  currency: string;
}

export function EditAccountDialog({ account }: { account: Account }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-dark-surface bg-dark-charcoal p-6 shadow-l2">
            <h3 className="mb-4 text-lg font-semibold text-white">Edit {account.name}</h3>
            <form action={updateAccount} className="grid gap-4">
              <input type="hidden" name="id" value={account.id} />
              <Field name="name" label="Account name" defaultValue={account.name} />
              <Field name="broker" label="Broker / prop firm" defaultValue={account.broker} />
              <Field name="accountType" label="Account type" defaultValue={account.accountType} />
              <div className="grid grid-cols-2 gap-3">
                <Field name="startingBalance" label="Starting balance" type="number" defaultValue={account.startingBalance} />
                <Field name="currentBalance" label="Current balance" type="number" defaultValue={account.currentBalance} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field name="profitTarget" label="Profit target" type="number" defaultValue={account.profitTarget} />
                <Field name="dailyDrawdown" label="Daily DD" type="number" defaultValue={account.dailyDrawdown} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field name="maxDrawdown" label="Max DD" type="number" defaultValue={account.maxDrawdown} />
                <Field name="minTradingDays" label="Min days" type="number" defaultValue={account.minTradingDays} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select name="status" defaultValue={account.status} className="h-14 w-full rounded-lg border border-dark-surface bg-dark-charcoal px-3 text-sm text-white">
                    <option>ACTIVE</option>
                    <option>PAUSED</option>
                    <option>PASSED</option>
                    <option>FUNDED</option>
                    <option>BREACHED</option>
                  </select>
                </div>
                <Field name="currency" label="Currency" defaultValue={account.currency} />
              </div>
              <div className="flex gap-3">
                <Button type="submit" onClick={() => setOpen(false)}>Save</Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input required {...props} />
    </div>
  );
}
