import { prisma } from "./prisma";

export async function getUserWithRolesAndPermissions(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
            },
          },
        },
      },
      permissions: { include: { permission: true } },
    },
  });
}

export function getUserPermissions(user: any): string[] {
  const rolePerms =
    user.roles
      ?.flatMap((ur: any) =>
        ur.role.permissions.map((rp: any) => rp.permission.name)
      ) || [];
  const userPerms =
    user.permissions?.map((up: any) => up.permission.name) || [];
  return Array.from(new Set([...rolePerms, ...userPerms]));
}

export function hasPermission(user: any, permission: string): boolean {
  return getUserPermissions(user).includes(permission);
}
