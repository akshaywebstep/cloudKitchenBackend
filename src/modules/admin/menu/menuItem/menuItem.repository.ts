// src/modules/admin/admin/admin.repository.ts

import { prisma, Prisma } from "../../../../../lib/prisma";
import stringHelper from "../../../../core/helpers/string.helper";

const menuItemRepo = {
    // ---------- Find Admin(Unique) ----------
    async findUnique(options: Prisma.MenuItemFindUniqueArgs): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            if (!options.where) {
                throw new Error("Unique filter (where) is required");
            }

            const menuItem = await prisma.menuItem.findUnique(options);

            if (!menuItem) {
                return {
                    status: false,
                    message: "MenuItem not found",
                };
            }

            return {
                status: true,
                data: stringHelper.convertBigInt(menuItem, "number"),
                message: menuItem ? "Admin record retrieved successfully" : "Admin not found",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Unable to retrieve menuItem record",
            };
        }
    },

    // ---------- Find Admin(First Match) ----------
    async findFirst(options: Prisma.MenuItemFindFirstArgs): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            if (!options.where) {
                throw new Error("Filter (where) is required");
            }

            const menuItem = await prisma.menuItem.findFirst(options);

            if (!menuItem) {
                return {
                    status: false,
                    message: "MenuItem not found",
                };
            }

            return {
                status: true,
                data: stringHelper.convertBigInt(menuItem, "number"),
                message: menuItem ? "Admin record retrieved successfully" : "Admin not found",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Unable to retrieve menuItem record",
            };
        }
    },

    // ---------- Find Multiple Admins ----------
    async findMany(options: Prisma.MenuItemFindManyArgs = {}): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const menuItems = await prisma.menuItem.findMany(options);

            return {
                status: true,
                data: stringHelper.convertBigInt(menuItems, "number"),
                message: "Admin records retrieved successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Unable to retrieve menuItem records",
            };
        }
    },

    // ---------- Count Admins ----------
    async count(options: { where?: Prisma.MenuItemWhereInput } = {}): Promise<{ status: boolean; data?: number; message: string }> {
        try {
            const count = await prisma.menuItem.count({
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
                message: err.message || "Unable to count menuItem records",
            };
        }
    },

    // ---------- Create Admin ----------
    async create(
        data: Prisma.MenuItemCreateInput,
        options: Partial<Prisma.MenuItemCreateArgs> = {}
    ): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const menuItem = await prisma.menuItem.create({
                data,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(menuItem, "number"),
                message: "Admin created successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to create menuItem",
            };
        }
    },

    // ---------- Create Many MenuItems ----------
    async createMany(
        options: Prisma.MenuItemCreateManyArgs
    ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
        try {
            if (!options.data || (Array.isArray(options.data) && (options.data as any[]).length === 0)) {
                return {
                    status: false,
                    message: "No data provided for createMany",
                };
            }

            const result = await prisma.menuItem.createMany({
                ...options,
                skipDuplicates: options.skipDuplicates ?? true, // safe default — skips already-assigned permissions
            });

            return {
                status: true,
                data: { count: result.count },
                message: `${result.count} MenuItem record(s) created successfully`,
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to create menuItem records",
            };
        }
    },

    // ---------- Delete Many MenuItems ----------
    async deleteMany(
        options: { where: Prisma.MenuItemWhereInput }
    ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
        try {
            if (!options.where) {
                throw new Error("Filter (where) is required for deleteMany");
            }

            const result = await prisma.menuItem.deleteMany({
                where: options.where,
            });

            return {
                status: true,
                data: { count: result.count },
                message: `${result.count} MenuItem record(s) deleted successfully`,
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to delete menuItem records",
            };
        }
    },

    // ---------- Update Admin ----------
    async update(
        id: number,
        data: Prisma.MenuItemUpdateInput,
        options: Partial<Prisma.MenuItemUpdateArgs> = {}
    ): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const menuItem = await prisma.menuItem.update({
                where: { id },
                data,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(menuItem, "number"),
                message: "Admin updated successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to update menuItem",
            };
        }
    },

    // ---------- Delete Admin ----------
    async delete(
        where: Prisma.MenuItemWhereUniqueInput,
        options: Partial<Prisma.MenuItemDeleteArgs> = {}
    ): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const menuItem = await prisma.menuItem.delete({
                where,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(menuItem, "number"),
                message: "Admin deleted successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to delete menuItem",
            };
        }
    },
};

export default menuItemRepo;
