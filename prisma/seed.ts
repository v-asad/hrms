import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Define permissions
  const permissions = [
    "read_dashboard",
    "manage_users",
    "assign_roles",
    "view_reports",
    "edit_profile",
  ];

  // Upsert permissions
  const permissionRecords = await Promise.all(
    permissions.map((name) =>
      prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  // Define roles and their permissions
  const roles = [
    {
      name: "admin",
      permissions: [
        "read_dashboard",
        "manage_users",
        "assign_roles",
        "view_reports",
        "edit_profile",
      ],
    },
    {
      name: "manager",
      permissions: ["read_dashboard", "view_reports", "edit_profile"],
    },
    {
      name: "user",
      permissions: ["read_dashboard", "edit_profile"],
    },
  ];

  // Upsert roles and connect permissions
  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: { name: role.name },
    });

    // Connect permissions to role
    for (const permName of role.permissions) {
      const perm = permissionRecords.find((p) => p.name === permName);
      if (perm) {
        // Only create if not exists
        const existing = await prisma.rolePermission.findFirst({
          where: {
            roleId: createdRole.id,
            permissionId: perm.id,
          },
        });
        if (!existing) {
          await prisma.rolePermission.create({
            data: {
              roleId: createdRole.id,
              permissionId: perm.id,
            },
          });
        }
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
