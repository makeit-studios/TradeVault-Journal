import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Please provide a valid name, email, and password." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
  }

  const password = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      password,
      tradingAccounts: {
        create: {
          name: "Primary Trading Account",
          broker: "Personal account",
          accountType: "Personal",
          startingBalance: 10000,
          currentBalance: 10000,
          profitTarget: 1000,
          dailyDrawdown: 500,
          maxDrawdown: 1000,
          currency: "USD"
        }
      }
    }
  });

  return NextResponse.json({ id: user.id, email: user.email });
}
