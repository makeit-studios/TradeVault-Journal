import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const tagSchema = z.object({
  category: z.enum(["SETUP", "EMOTION", "MISTAKE"]),
  label: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#3859F9")
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const tags = await prisma.tag.findMany({
    where: { userId: session.user.id },
    orderBy: [{ category: "asc" }, { label: "asc" }]
  });

  return NextResponse.json(tags);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = tagSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid tag data.", errors: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.tag.findUnique({
    where: { userId_category_label: { userId: session.user.id, category: parsed.data.category, label: parsed.data.label } }
  });

  if (existing) {
    return NextResponse.json({ message: "A tag with this label already exists in this category." }, { status: 409 });
  }

  const tag = await prisma.tag.create({
    data: { userId: session.user.id, ...parsed.data }
  });

  return NextResponse.json(tag, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "Tag ID is required." }, { status: 400 });
  }

  await prisma.tag.deleteMany({ where: { id, userId: session.user.id } });

  return NextResponse.json({ success: true });
}
