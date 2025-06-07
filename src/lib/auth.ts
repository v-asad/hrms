import { prisma } from "./prisma";
import type {
  User,
  UserRole,
  Role,
  RolePermission,
  Permission,
  UserPermission,
} from "@prisma/client";

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

type UserWithRolesAndPermissions = User & {
  roles?: (UserRole & {
    role: Role & {
      permissions: (RolePermission & {
        permission: Permission;
      })[];
    };
  })[];
  permissions?: (UserPermission & {
    permission: Permission;
  })[];
};

export function getUserPermissions(user: UserWithRolesAndPermissions): string[] {
  const rolePerms =
    user.roles?.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.name)) || [];
  const userPerms = user.permissions?.map((up) => up.permission.name) || [];
  return Array.from(new Set([...rolePerms, ...userPerms]));
}

export function hasPermission(user: UserWithRolesAndPermissions, permission: string): boolean {
  return getUserPermissions(user).includes(permission);
}
