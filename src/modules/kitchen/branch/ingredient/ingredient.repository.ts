// src/modules/admin/admin/admin.repository.ts

import { prisma, Prisma } from "../../../../../lib/prisma";
import stringHelper from "../../../../core/helpers/string.helper";

const branchIngredientInventoryRepo = {
    // ---------- Find Admin(Unique) ----------
    async findUnique(options: Prisma.BranchIngredientInventoryFindUniqueArgs): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            if (!options.where) {
                throw new Error("Unique filter (where) is required");
            }

            const branchIngredientInventory = await prisma.branchIngredientInventory.findUnique(options);

            if (!branchIngredientInventory) {
                return {
                    status: false,
                    message: "BranchIngredientInventory not found",
                };
            }

            return {
                status: true,
                data: stringHelper.convertBigInt(branchIngredientInventory, "number"),
                message: branchIngredientInventory ? "Admin record retrieved successfully" : "Admin not found",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Unable to retrieve branchIngredientInventory record",
            };
        }
    },

    // ---------- Find Admin(First Match) ----------
    async findFirst(options: Prisma.BranchIngredientInventoryFindFirstArgs): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            if (!options.where) {
                throw new Error("Filter (where) is required");
            }

            const branchIngredientInventory = await prisma.branchIngredientInventory.findFirst(options);

            if (!branchIngredientInventory) {
                return {
                    status: false,
                    message: "BranchIngredientInventory not found",
                };
            }

            return {
                status: true,
                data: stringHelper.convertBigInt(branchIngredientInventory, "number"),
                message: branchIngredientInventory ? "Admin record retrieved successfully" : "Admin not found",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Unable to retrieve branchIngredientInventory record",
            };
        }
    },

    // ---------- Find Multiple Admins ----------
    async findMany(options: Prisma.BranchIngredientInventoryFindManyArgs = {}): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const branchIngredientInventorys = await prisma.branchIngredientInventory.findMany(options);

            return {
                status: true,
                data: stringHelper.convertBigInt(branchIngredientInventorys, "number"),
                message: "Admin records retrieved successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Unable to retrieve branchIngredientInventory records",
            };
        }
    },

    // ---------- Count Admins ----------
    async count(options: { where?: Prisma.BranchIngredientInventoryWhereInput } = {}): Promise<{ status: boolean; data?: number; message: string }> {
        try {
            const count = await prisma.branchIngredientInventory.count({
                where: options.where,
            });

            return {
                status: true,
                data: count,
                message: "Admin count retrieved successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Unable to count branchIngredientInventory records",
            };
        }
    },

    // ---------- Create Admin ----------
    async create(
        data: Prisma.BranchIngredientInventoryCreateInput,
        options: Partial<Prisma.BranchIngredientInventoryCreateArgs> = {}
    ): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const branchIngredientInventory = await prisma.branchIngredientInventory.create({
                data,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(branchIngredientInventory, "number"),
                message: "Admin created successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to create branchIngredientInventory",
            };
        }
    },

    // ---------- Create Many BranchIngredientInventorys ----------
    async createMany(
        options: Prisma.BranchIngredientInventoryCreateManyArgs
    ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
        try {
            if (!options.data || (Array.isArray(options.data) && (options.data as any[]).length === 0)) {
                return {
                    status: false,
                    message: "No data provided for createMany",
                };
            }

            const result = await prisma.branchIngredientInventory.createMany({
                ...options,
                skipDuplicates: options.skipDuplicates ?? true, // safe default — skips already-assigned permissions
            });

            return {
                status: true,
                data: { count: result.count },
                message: `${result.count} BranchIngredientInventory record(s) created successfully`,
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to create branchIngredientInventory records",
            };
        }
    },

    // ---------- Delete Many BranchIngredientInventorys ----------
    async deleteMany(
        options: { where: Prisma.BranchIngredientInventoryWhereInput }
    ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
        try {
            if (!options.where) {
                throw new Error("Filter (where) is required for deleteMany");
            }

            const result = await prisma.branchIngredientInventory.deleteMany({
                where: options.where,
            });

            return {
                status: true,
                data: { count: result.count },
                message: `${result.count} BranchIngredientInventory record(s) deleted successfully`,
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to delete branchIngredientInventory records",
            };
        }
    },

    // ---------- Update Admin ----------
    async update(
        id: number,
        data: Prisma.BranchIngredientInventoryUpdateInput,
        options: Partial<Prisma.BranchIngredientInventoryUpdateArgs> = {}
    ): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const branchIngredientInventory = await prisma.branchIngredientInventory.update({
                where: { id },
                data,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(branchIngredientInventory, "number"),
                message: "Admin updated successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to update branchIngredientInventory",
            };
        }
    },

    // ---------- Delete Admin ----------
    async delete(
        where: Prisma.BranchIngredientInventoryWhereUniqueInput,
        options: Partial<Prisma.BranchIngredientInventoryDeleteArgs> = {}
    ): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const branchIngredientInventory = await prisma.branchIngredientInventory.delete({
                where,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(branchIngredientInventory, "number"),
                message: "Admin deleted successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to delete branchIngredientInventory",
            };
        }
    },
};

export default branchIngredientInventoryRepo;
