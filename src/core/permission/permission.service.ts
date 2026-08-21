import { prisma } from "../../../lib/prisma";
import debugHelper from "../helpers/debug";
import { Panel, Action, UserType, Status } from "../../../prisma/generated/prisma/client";

export const checkUserPermission = async (
  userId: number | bigint,
  options: { panel: Panel; module: string; action: Action }
) => {
  const { panel, module, action } = options;

  try {
    // 1️⃣ USER EXIST CHECK
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: { id: true, userType: true, roleId: true, status: true },
    });

    if (!user) {
      return { status: false, message: "User not found" };
    }

    if (user.status !== Status.ACTIVE) {
      return { status: false, message: "User is not active" };
    }

    // 2️⃣ OWNER (ADMIN / KITCHEN) → SKIP CHECK, full access
    if (user.userType === UserType.ADMIN || user.userType === UserType.KITCHEN) {
      return { status: true, message: "Owner access granted" };
    }

    // 3️⃣ STAFF (ADMIN_STAFF / KITCHEN_STAFF) → ROLE REQUIRED
    if (!user.roleId) {
      return { status: false, message: "No role assigned to this user" };
    }

    // 4️⃣ FIND MATCHING PERMISSION (panel + module + action)
    const permission = await prisma.permission.findFirst({
      where: { panel, module, action, status: Status.ACTIVE },
      select: { id: true },
    });

    if (!permission) {
      return { status: false, message: "Permission not defined for this action" };
    }

    // 5️⃣ CHECK ROLE HAS THIS PERMISSION (role bhi ACTIVE ho)
    const roleHasPermission = await prisma.roleHasPermission.findFirst({
      where: {
        roleId: user.roleId,
        permissionId: permission.id,
        role: { status: Status.ACTIVE },
      },
    });

    if (!roleHasPermission) {
      return { status: false, message: "You do not have permission to perform this action" };
    }

    return { status: true, message: "Permission granted" };
  } catch (error: any) {
    debugHelper.debugError("[Permission Service] checkUserPermission failed:", error);
    return { status: false, message: error.message || "Permission check failed" };
  }
};