import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";
import type { JwtPayload } from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const { refreshToken } = await req.json();
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 400 });
  }
  let payload: string | JwtPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }
  // payload is either string or JwtPayload, but we expect an object with sub
  const userId = typeof payload === "object" && payload.sub ? payload.sub : null;
  if (!userId) {
    return NextResponse.json({ error: "Invalid refresh token payload" }, { status: 401 });
  }
  const dbToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!dbToken || dbToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Refresh token expired" }, { status: 401 });
  }
  const newAccessToken = signAccessToken({ sub: userId });
  const newRefreshToken = signRefreshToken({ sub: userId });
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: userId as string,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.refreshToken.delete({ where: { token: refreshToken } });
  return NextResponse.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
}
