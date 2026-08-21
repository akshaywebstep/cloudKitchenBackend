import { prisma } from '../../../../lib/prisma';
import { UserType, Panel } from '../../../../prisma/generated/prisma/client';
import debugHelper from '../../../core/helpers/debug';

// 📌 1. Kitchen Owner ke sabhi KITCHEN_STAFF members fetch karna
export const findKitchenStaffMembers = async (kitchenOwnerId: bigint) => {
    debugHelper.debug('🔍 [REPO] Fetching staff for kitchenOwnerId:', kitchenOwnerId.toString());

    return await prisma.user.findMany({
        where: {
            userType: UserType.KITCHEN_STAFF,
            OR: [
                { parentId: kitchenOwnerId },
                { rootId: kitchenOwnerId }
            ]
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            userType: true,
            roleId: true,
            parentId: true,
            rootId: true,
            parent: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    kitchenName: true,
                    email: true,
                    phone: true
                }
            },
            role: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
};

// 📌 2. Role ki Assigned vs Unassigned Permissions Overview
export const getRolePermissionsOverview = async (roleId: bigint) => {
    debugHelper.debug('🔍 [REPO] Fetching permission overview for roleId:', roleId.toString());

    const allKitchenPermissions = await prisma.permission.findMany({
        where: {
            panel: Panel.KITCHEN,
            status: 'ACTIVE'
        }
    });

    const rolePermissions = await prisma.roleHasPermission.findMany({
        where: { roleId },
        select: { permissionId: true }
    });

    const assignedSet = new Set(rolePermissions.map((rp) => rp.permissionId.toString()));

    const assignedPermissions: any[] = [];
    const unassignedPermissions: any[] = [];

    allKitchenPermissions.forEach((perm) => {
        if (assignedSet.has(perm.id.toString())) {
            assignedPermissions.push(perm);
        } else {
            unassignedPermissions.push(perm);
        }
    });

    return {
        roleId,
        totalPermissionsCount: allKitchenPermissions.length,
        assignedCount: assignedPermissions.length,
        unassignedCount: unassignedPermissions.length,
        assignedPermissions,
        unassignedPermissions
    };
};

// 📌 3. Role ki Permissions Sync / Update karna
export const updateRolePermissions = async (roleId: bigint, permissionIds: bigint[]) => {
    debugHelper.debug('🔍 [REPO] Updating permissions for roleId:', roleId.toString());

    return await prisma.$transaction(async (tx) => {
        // 1. Existing permissions remove karein
        await tx.roleHasPermission.deleteMany({
            where: { roleId }
        });

        // 2. New permissions insert karein
        if (permissionIds.length > 0) {
            const dataToInsert = permissionIds.map((permissionId) => ({
                roleId,
                permissionId
            }));

            await tx.roleHasPermission.createMany({
                data: dataToInsert
            });
        }

        return await tx.role.findUnique({
            where: { id: roleId },
            include: {
                rolePermissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });
    });
};

// 📌 4. Naya Role create karna (kitchen-specific)
export const createRole = async (userId: bigint, name: string) => {
    debugHelper.debug('🔍 [REPO] Creating new role:', { userId: userId.toString(), name });

    return await prisma.role.create({
        data: {
            userId,
            name,
            status: 'ACTIVE'
        }
    });
};

// Same kitchen ke andar duplicate name check karne ke liye
export const findRoleByName = async (userId: bigint, name: string) => {
    return await prisma.role.findFirst({
        where: { userId, name }
    });
};