import { verifyAccessToken } from "@/lib/jwt";
import { getUserWithRolesAndPermissions, getUserPermissions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let payload: any;
  try {
    payload = verifyAccessToken(auth.slice(7));
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const user = await getUserWithRolesAndPermissions(payload.sub);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: user.id,
    email: user.email,
    roles: user.roles.map((ur: any) => ur.role.name),
    permissions: getUserPermissions(user),
  });
}
