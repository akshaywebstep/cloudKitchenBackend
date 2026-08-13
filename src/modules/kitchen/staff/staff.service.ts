import bcrypt from 'bcryptjs';
import debugHelper from "../../../core/helpers/debug";
import { Status, UserType } from "../../../../prisma/generated/prisma/client";
import staffRepo from "./staff.repository";
import { prisma } from "../../../../lib/prisma";
import stringHelper from "../../../core/helpers/string.helper";

// =====================================================
// ✅ CREATE STAFF (Kitchen Staff, with profile picture & branch access)
// =====================================================
export const createStaff = async (data: {
    kitchenId: number;
    profilePicture?: string; 
    title?: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
    password: string;
    roleId: number;
    branchIds?: number[];
}) => {
    const { 
        kitchenId, 
        profilePicture, 
        title, 
        firstName, 
        lastName, 
        email, 
        phone, 
        password, 
        roleId, 
        branchIds = [] 
    } = data;

    debugHelper.debug("[Staff Service] createStaff called with:", JSON.stringify(data));

    try {
        // ✅ 1. Validate Required Profile Picture (Agar profile compulsory rakhni hai)
        if (!profilePicture) {
            return { status: false, message: "Profile picture is required" };
        }

        // ✅ 2. Uniqueness check (email/phone)
        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { phone }] },
            select: { email: true, phone: true },
        });

        if (existing) {
            const field = existing.email === email ? "Email" : "Phone";
            return { status: false, message: `${field} already exists` };
        }

        // ✅ 3. Role validation — must belong to this kitchen
        const role = await prisma.role.findFirst({
            where: { id: BigInt(roleId), userId: BigInt(kitchenId), status: Status.ACTIVE },
        });

        if (!role) {
            return { status: false, message: "Invalid role for this kitchen" };
        }

        // ✅ 4. BranchIds validation — must belong to this kitchen
        if (branchIds && branchIds.length > 0) {
            const validBranches = await prisma.branch.findMany({
                where: { 
                    id: { in: branchIds.map((id) => BigInt(id)) }, 
                    userId: BigInt(kitchenId) 
                },
                select: { id: true },
            });

            if (validBranches.length !== new Set(branchIds).size) {
                return { status: false, message: "Some branch IDs are invalid or do not belong to this kitchen" };
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 🧠 Transaction for User Creation & Access Mapping
        const result = await prisma.$transaction(async (tx) => {
            // 1️⃣ Create staff user
            const staff = await tx.user.create({
                data: {
                    parentId: BigInt(kitchenId),
                    rootId: BigInt(kitchenId),
                    profilePicture: profilePicture || "", 
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
            if (branchIds && branchIds.length > 0) {
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
                    branchAccess: { 
                        include: { 
                            branch: { select: { id: true, name: true } } 
                        } 
                    },
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
// 📋 GET STAFF FORM OPTIONS (Roles with User, Branches & Assigned Access)
// =====================================================
export const getStaffFormOptions = async (kitchenId: number, staffUserId?: number) => {
    try {
        // 1️⃣ Kitchen ke Active Roles + User Info
        const roles = await prisma.role.findMany({
            where: {
                userId: BigInt(kitchenId),
                status: Status.ACTIVE
            },
            select: {
                id: true,
                name: true,
                status: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        // 2️⃣ Kitchen ke Branches
        const branches = await prisma.branch.findMany({
            where: {
                userId: BigInt(kitchenId)
            },
            select: {
                id: true,
                name: true,
                city: { select: { id: true, name: true } }
            }
        });

        // 3️⃣ Existing Access (if Editing Staff)
        let assignedBranchIds: number[] = [];
        let assignedRoleId: number | null = null;

        if (staffUserId) {
            // Assigned Branches
            const existingAccess = await prisma.userBranchAccess.findMany({
                where: { userId: BigInt(staffUserId) },
                select: { branchId: true }
            });
            assignedBranchIds = existingAccess.map((item) => Number(item.branchId));

            // Assigned Role
            const staffUser = await prisma.user.findUnique({
                where: { id: BigInt(staffUserId) },
                select: { roleId: true }
            });
            assignedRoleId = staffUser?.roleId ? Number(staffUser.roleId) : null;
        }

        return {
            status: true,
            data: {
                roles: stringHelper.convertBigInt(roles, "number"),
                branches: stringHelper.convertBigInt(branches, "number"),
                assignedRoleId,
                assignedBranchIds
            },
            message: "Staff form options retrieved successfully"
        };
    } catch (error: any) {
        debugHelper.debugError("[Staff Service] getStaffFormOptions failed:", error);
        return { status: false, message: error.message || "Failed to retrieve form options" };
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
// ✏️ UPDATE STAFF (with profile picture & branch access resync)
// =====================================================
export const updateStaff = async (
    id: number,
    kitchenId: number,
    data: {
        profilePicture?: string; // 👈 Profile picture path parameter
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

        // 1️⃣ Verify Staff Existence for this Kitchen
        const existing = await prisma.user.findFirst({
            where: { 
                id: BigInt(id), 
                parentId: BigInt(kitchenId), 
                userType: UserType.KITCHEN_STAFF 
            },
        });

        if (!existing) {
            return { status: false, message: "Staff not found for this kitchen" };
        }

        const { branchIds, ...staffFields } = data;

        // 2️⃣ Uniqueness Check for Email/Phone (agar edit time par update kiye ho)
        if (staffFields.email || staffFields.phone) {
            const conflict = await prisma.user.findFirst({
                where: {
                    id: { not: BigInt(id) }, // Dusre users me search karega
                    OR: [
                        ...(staffFields.email ? [{ email: staffFields.email }] : []),
                        ...(staffFields.phone ? [{ phone: staffFields.phone }] : [])
                    ]
                },
                select: { email: true, phone: true }
            });

            if (conflict) {
                const field = conflict.email === staffFields.email ? "Email" : "Phone";
                return { status: false, message: `${field} is already in use by another account` };
            }
        }

        // 3️⃣ Role validation (if roleId provided)
        if (staffFields.roleId) {
            const role = await prisma.role.findFirst({
                where: { 
                    id: BigInt(staffFields.roleId), 
                    userId: BigInt(kitchenId), 
                    status: Status.ACTIVE 
                },
            });
            if (!role) {
                return { status: false, message: "Invalid role for this kitchen" };
            }
        }

        // 4️⃣ BranchIds validation (if branchIds provided)
        if (branchIds !== undefined && branchIds.length > 0) {
            const validBranches = await prisma.branch.findMany({
                where: { 
                    id: { in: branchIds.map((bid) => BigInt(bid)) }, 
                    userId: BigInt(kitchenId) 
                },
                select: { id: true },
            });
            if (validBranches.length !== new Set(branchIds).size) {
                return { status: false, message: "Some branch IDs are invalid or do not belong to this kitchen" };
            }
        }

        // 5️⃣ Prisma Transaction
        const result = await prisma.$transaction(async (tx) => {
            // Step A: Update Staff User Fields
            if (Object.keys(staffFields).length > 0) {
                await tx.user.update({
                    where: { id: BigInt(id) },
                    data: {
                        ...(staffFields.profilePicture ? { profilePicture: staffFields.profilePicture } : {}), // 👈 Update DP Path
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

            // Step B: Resync Branch Access Mapping (Delete Old & Insert New)
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

            // Step C: Fetch updated object with relations
            return tx.user.findUnique({
                where: { id: BigInt(id) },
                include: {
                    role: true,
                    branchAccess: { 
                        include: { 
                            branch: { select: { id: true, name: true } } 
                        } 
                    },
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

