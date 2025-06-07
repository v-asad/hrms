import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  // Assign "admin" role to the new user
  const adminRole = await prisma.role.findUnique({ where: { name: "admin" } });
  if (adminRole) {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: adminRole.id,
      },
    });
  }

  return NextResponse.json({ id: user.id, email: user.email });
}
