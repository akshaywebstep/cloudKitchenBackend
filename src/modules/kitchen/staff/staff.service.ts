import bcrypt from 'bcryptjs';
import debugHelper from "../../../core/helpers/debug";
import { Status, UserType } from "../../../../prisma/generated/prisma/client";
import staffRepo from "./staff.repository";
import { prisma } from "../../../../lib/prisma";
import stringHelper from "../../../core/helpers/string.helper";

// =====================================================
// ✅ CREATE STAFF (Kitchen Staff, with branch access)
// =====================================================
export const createStaff = async (data: {
    kitchenId: number;
    title?: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
    password: string;
    roleId: number;
    branchIds: number[];
}) => {
    const { kitchenId, title, firstName, lastName, email, phone, password, roleId, branchIds } = data;

    debugHelper.debug("[Staff Service] createStaff called with:", JSON.stringify(data));

    try {
        // ✅ Uniqueness check (email/phone)
        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { phone }] },
            select: { email: true, phone: true },
        });

        if (existing) {
            const field = existing.email === email ? "Email" : "Phone";
            return { status: false, message: `${field} already exists` };
        }

        // ✅ Role validation — must belong to this kitchen
        const role = await prisma.role.findFirst({
            where: { id: roleId, userId: BigInt(kitchenId), status: Status.ACTIVE },
        });

        if (!role) {
            return { status: false, message: "Invalid role for this kitchen" };
        }

        // ✅ BranchIds validation — must belong to this kitchen
        if (branchIds.length > 0) {
            const validBranches = await prisma.branch.findMany({
                where: { id: { in: branchIds.map((id) => BigInt(id)) }, userId: BigInt(kitchenId) },
                select: { id: true },
            });

            if (validBranches.length !== new Set(branchIds).size) {
                return { status: false, message: "Some branch IDs are invalid or do not belong to this kitchen" };
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await prisma.$transaction(async (tx) => {
            // 1️⃣ Create staff user
            const staff = await tx.user.create({
                data: {
                    parentId: BigInt(kitchenId),
                    rootId: BigInt(kitchenId),
                    profilePicture: "",
                    title,
                    firstName,
                    lastName,
                    email,
                    phone,
                    password: hashedPassword,
                    userType: UserType.KITCHEN_STAFF,
                    status: Status.ACTIVE,
                    roleId: BigInt(roleId),
                },
            });

            // 2️⃣ Save branch access (if any)
            if (branchIds.length > 0) {
                await tx.userBranchAccess.createMany({
                    data: [...new Set(branchIds)].map((branchId) => ({
                        userId: staff.id,
                        branchId: BigInt(branchId),
                    })),
                    skipDuplicates: true,
                });
            }

            return tx.user.findUnique({
                where: { id: staff.id },
                include: {
                    role: true,
                    branchAccess: { include: { branch: { select: { id: true, name: true } } } },
                },
            });
        });

        const { password: _pw, ...staffWithoutPassword } = result as any;

        return {
            status: true,
            data: stringHelper.convertBigInt(staffWithoutPassword, "number"),
            message: "Staff created successfully",
        };
    } catch (error: any) {
        debugHelper.debugError("[Staff Service] createStaff failed:", error);
        return { status: false, message: error.message || "Failed to create staff" };
    }
};

// =====================================================
// 📄 GET ALL STAFF (for a kitchen)
// =====================================================
export const getStaff = async (params: {
    page: number;
    limit: number;
    filters: { kitchenId: number; status?: Status };
}) => {
    try {
        const { page, limit, filters } = params;
        const skip = (page - 1) * limit;

        const where: any = {
            parentId: BigInt(filters.kitchenId),
            userType: UserType.KITCHEN_STAFF,
        };

        if (filters.status) where.status = filters.status;

        const [dataRes, filteredCountRes, totalCountRes] = await Promise.all([
            staffRepo.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true, title: true, firstName: true, lastName: true,
                    email: true, phone: true, status: true, createdAt: true,
                    role: { select: { id: true, name: true } },
                    branchAccess: { include: { branch: { select: { id: true, name: true } } } },
                },
            }),
            staffRepo.count({ where }),
            staffRepo.count({ where: { parentId: BigInt(filters.kitchenId), userType: UserType.KITCHEN_STAFF } }),
        ]);

        const data = dataRes.data || [];
        const filtered = filteredCountRes.data || 0;
        const total = totalCountRes.data || 0;
        const totalPages = Math.ceil(filtered / limit);

        return {
            status: true,
            data,
            meta: {
                page, limit, total, filtered, count: data.length, totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error: any) {
        debugHelper.debugError(`[Staff Service] getStaff failed: ${error.message}`);
        return { status: false, message: "Failed to fetch staff", data: [], meta: null };
    }
};

// =====================================================
// 🔍 GET SINGLE STAFF
// =====================================================
export const getStaffById = async (id: number) => {
    try {
        const result = await staffRepo.findUnique({
            where: { id },
            select: {
                id: true, title: true, firstName: true, lastName: true,
                email: true, phone: true, status: true, parentId: true, createdAt: true,
                role: { select: { id: true, name: true } },
                branchAccess: { include: { branch: { select: { id: true, name: true } } } },
            },
        });

        if (!result.status) return { status: false, message: result.message };

        return { status: true, data: result.data, message: "Staff fetched successfully" };
    } catch (error: any) {
        return { status: false, message: error.message || "Failed to fetch staff" };
    }
};

// =====================================================
// ✏️ UPDATE STAFF (with branch access resync)
// =====================================================
export const updateStaff = async (
    id: number,
    kitchenId: number,
    data: {
        title?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        roleId?: number;
        status?: Status;
        branchIds?: number[];
    }
) => {
    try {
        debugHelper.debug(`[Staff Service] updateStaff called for id ${id}:`, JSON.stringify(data));

        const existing = await prisma.user.findFirst({
            where: { id: BigInt(id), parentId: BigInt(kitchenId), userType: UserType.KITCHEN_STAFF },
        });

        if (!existing) {
            return { status: false, message: "Staff not found for this kitchen" };
        }

        const { branchIds, ...staffFields } = data;

        // ✅ Role validation (if provided)
        if (staffFields.roleId) {
            const role = await prisma.role.findFirst({
                where: { id: staffFields.roleId, userId: BigInt(kitchenId), status: Status.ACTIVE },
            });
            if (!role) {
                return { status: false, message: "Invalid role for this kitchen" };
            }
        }

        // ✅ BranchIds validation (if provided)
        if (branchIds !== undefined && branchIds.length > 0) {
            const validBranches = await prisma.branch.findMany({
                where: { id: { in: branchIds.map((bid) => BigInt(bid)) }, userId: BigInt(kitchenId) },
                select: { id: true },
            });
            if (validBranches.length !== new Set(branchIds).size) {
                return { status: false, message: "Some branch IDs are invalid or do not belong to this kitchen" };
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1️⃣ Update staff fields (if any)
            if (Object.keys(staffFields).length > 0) {
                await tx.user.update({
                    where: { id: BigInt(id) },
                    data: {
                        ...(staffFields.title !== undefined ? { title: staffFields.title } : {}),
                        ...(staffFields.firstName ? { firstName: staffFields.firstName } : {}),
                        ...(staffFields.lastName !== undefined ? { lastName: staffFields.lastName } : {}),
                        ...(staffFields.email ? { email: staffFields.email } : {}),
                        ...(staffFields.phone ? { phone: staffFields.phone } : {}),
                        ...(staffFields.roleId ? { roleId: BigInt(staffFields.roleId) } : {}),
                        ...(staffFields.status ? { status: staffFields.status } : {}),
                    },
                });
            }

            // 2️⃣ Replace branch access (only if branchIds explicitly provided)
            if (branchIds !== undefined) {
                await tx.userBranchAccess.deleteMany({ where: { userId: BigInt(id) } });

                if (branchIds.length > 0) {
                    await tx.userBranchAccess.createMany({
                        data: [...new Set(branchIds)].map((branchId) => ({
                            userId: BigInt(id),
                            branchId: BigInt(branchId),
                        })),
                        skipDuplicates: true,
                    });
                }
            }

            return tx.user.findUnique({
                where: { id: BigInt(id) },
                include: {
                    role: true,
                    branchAccess: { include: { branch: { select: { id: true, name: true } } } },
                },
            });
        });

        const { password: _pw, ...staffWithoutPassword } = result as any;

        return {
            status: true,
            data: stringHelper.convertBigInt(staffWithoutPassword, "number"),
            message: "Staff updated successfully",
        };
    } catch (error: any) {
        debugHelper.debugError("[Staff Service] updateStaff failed:", error);
        return { status: false, message: error.message || "Failed to update staff" };
    }
};

// =====================================================
// 🗑️ DELETE STAFF (soft delete)
// =====================================================
export const deleteStaff = async (id: number, kitchenId: number) => {
    try {
        const existing = await prisma.user.findFirst({
            where: { id: BigInt(id), parentId: BigInt(kitchenId), userType: UserType.KITCHEN_STAFF },
        });

        if (!existing) {
            return { status: false, message: "Staff not found for this kitchen" };
        }

        const result = await staffRepo.update(id, { status: Status.INACTIVE });

        if (!result.status) return { status: false, message: result.message };

        return { status: true, message: "Staff deleted successfully" };
    } catch (error: any) {
        return { status: false, message: error.message || "Failed to delete staff" };
    }
};