// src/modules/admin/admin/admin.repository.ts

import { prisma, Prisma } from "../../../../lib/prisma";
import stringHelper from "../../../core/helpers/string.helper";

const menuCategoryRepo = {
    // ---------- Find Admin(Unique) ----------
    async findUnique(options: Prisma.MenuCategoryFindUniqueArgs): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            if (!options.where) {
                throw new Error("Unique filter (where) is required");
            }

            const menuCategory = await prisma.menuCategory.findUnique(options);

            if (!menuCategory) {
                return {
                    status: false,
                    message: "MenuCategory not found",
                };
            }

            return {
                status: true,
                data: stringHelper.convertBigInt(menuCategory, "number"),
                message: menuCategory ? "Admin record retrieved successfully" : "Admin not found",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Unable to retrieve menuCategory record",
            };
        }
    },

    // ---------- Find Admin(First Match) ----------
    async findFirst(options: Prisma.MenuCategoryFindFirstArgs): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            if (!options.where) {
                throw new Error("Filter (where) is required");
            }

            const menuCategory = await prisma.menuCategory.findFirst(options);

            if (!menuCategory) {
                return {
                    status: false,
                    message: "MenuCategory not found",
                };
            }

            return {
                status: true,
                data: stringHelper.convertBigInt(menuCategory, "number"),
                message: menuCategory ? "Admin record retrieved successfully" : "Admin not found",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Unable to retrieve menuCategory record",
            };
        }
    },

    // ---------- Find Multiple Admins ----------
    async findMany(options: Prisma.MenuCategoryFindManyArgs = {}): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const menuCategorys = await prisma.menuCategory.findMany(options);

            return {
                status: true,
                data: stringHelper.convertBigInt(menuCategorys, "number"),
                message: "Admin records retrieved successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Unable to retrieve menuCategory records",
            };
        }
    },

    // ---------- Count Admins ----------
    async count(options: { where?: Prisma.MenuCategoryWhereInput } = {}): Promise<{ status: boolean; data?: number; message: string }> {
        try {
            const count = await prisma.menuCategory.count({
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
                message: err.message || "Unable to count menuCategory records",
            };
        }
    },

    // ---------- Create Admin ----------
    async create(
        data: Prisma.MenuCategoryCreateInput,
        options: Partial<Prisma.MenuCategoryCreateArgs> = {}
    ): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const menuCategory = await prisma.menuCategory.create({
                data,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(menuCategory, "number"),
                message: "Admin created successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to create menuCategory",
            };
        }
    },

    // ---------- Create Many MenuCategorys ----------
    async createMany(
        options: Prisma.MenuCategoryCreateManyArgs
    ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
        try {
            if (!options.data || (Array.isArray(options.data) && (options.data as any[]).length === 0)) {
                return {
                    status: false,
                    message: "No data provided for createMany",
                };
            }

            const result = await prisma.menuCategory.createMany({
                ...options,
                skipDuplicates: options.skipDuplicates ?? true, // safe default — skips already-assigned permissions
            });

            return {
                status: true,
                data: { count: result.count },
                message: `${result.count} MenuCategory record(s) created successfully`,
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to create menuCategory records",
            };
        }
    },

    // ---------- Delete Many MenuCategorys ----------
    async deleteMany(
        options: { where: Prisma.MenuCategoryWhereInput }
    ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
        try {
            if (!options.where) {
                throw new Error("Filter (where) is required for deleteMany");
            }

            const result = await prisma.menuCategory.deleteMany({
                where: options.where,
            });

            return {
                status: true,
                data: { count: result.count },
                message: `${result.count} MenuCategory record(s) deleted successfully`,
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to delete menuCategory records",
            };
        }
    },

    // ---------- Update Admin ----------
    async update(
        id: number,
        data: Prisma.MenuCategoryUpdateInput,
        options: Partial<Prisma.MenuCategoryUpdateArgs> = {}
    ): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const menuCategory = await prisma.menuCategory.update({
                where: { id },
                data,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(menuCategory, "number"),
                message: "Admin updated successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to update menuCategory",
            };
        }
    },

    // ---------- Delete Admin ----------
    async delete(
        where: Prisma.MenuCategoryWhereUniqueInput,
        options: Partial<Prisma.MenuCategoryDeleteArgs> = {}
    ): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const menuCategory = await prisma.menuCategory.delete({
                where,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(menuCategory, "number"),
                message: "Admin deleted successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to delete menuCategory",
            };
        }
    },
};

export default menuCategoryRepo;
