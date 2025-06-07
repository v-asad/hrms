import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { refreshToken } = await req.json();
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 400 });
  }
  let payload: any;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }
  const dbToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!dbToken || dbToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Refresh token expired" }, { status: 401 });
  }
  const newAccessToken = signAccessToken({ sub: payload.sub });
  const newRefreshToken = signRefreshToken({ sub: payload.sub });
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: payload.sub,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.refreshToken.delete({ where: { token: refreshToken } });
  return NextResponse.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
}
