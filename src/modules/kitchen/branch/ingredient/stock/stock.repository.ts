// src/modules/admin/admin/admin.repository.ts

import { prisma, Prisma } from "../../../../../../lib/prisma";
import stringHelper from "../../../../../core/helpers/string.helper";

const inventoryStockRepo = {
    // ---------- Find Admin(Unique) ----------
    async findUnique(options: Prisma.InventoryStockFindUniqueArgs): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            if (!options.where) {
                throw new Error("Unique filter (where) is required");
            }

            const inventoryStock = await prisma.inventoryStock.findUnique(options);

            if (!inventoryStock) {
                return {
                    status: false,
                    message: "InventoryStock not found",
                };
            }

            return {
                status: true,
                data: stringHelper.convertBigInt(inventoryStock, "number"),
                message: inventoryStock ? "Admin record retrieved successfully" : "Admin not found",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Unable to retrieve inventoryStock record",
            };
        }
    },

    // ---------- Find Admin(First Match) ----------
    async findFirst(options: Prisma.InventoryStockFindFirstArgs): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            if (!options.where) {
                throw new Error("Filter (where) is required");
            }

            const inventoryStock = await prisma.inventoryStock.findFirst(options);

            if (!inventoryStock) {
                return {
                    status: false,
                    message: "InventoryStock not found",
                };
            }

            return {
                status: true,
                data: stringHelper.convertBigInt(inventoryStock, "number"),
                message: inventoryStock ? "Admin record retrieved successfully" : "Admin not found",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Unable to retrieve inventoryStock record",
            };
        }
    },

    // ---------- Find Multiple Admins ----------
    async findMany(options: Prisma.InventoryStockFindManyArgs = {}): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const inventoryStocks = await prisma.inventoryStock.findMany(options);

            return {
                status: true,
                data: stringHelper.convertBigInt(inventoryStocks, "number"),
                message: "Admin records retrieved successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Unable to retrieve inventoryStock records",
            };
        }
    },

    // ---------- Count Admins ----------
    async count(options: { where?: Prisma.InventoryStockWhereInput } = {}): Promise<{ status: boolean; data?: number; message: string }> {
        try {
            const count = await prisma.inventoryStock.count({
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
                message: err.message || "Unable to count inventoryStock records",
            };
        }
    },

    // ---------- Create Admin ----------
    async create(
        data: Prisma.InventoryStockCreateInput,
        options: Partial<Prisma.InventoryStockCreateArgs> = {}
    ): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const inventoryStock = await prisma.inventoryStock.create({
                data,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(inventoryStock, "number"),
                message: "Admin created successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to create inventoryStock",
            };
        }
    },

    // ---------- Create Many InventoryStocks ----------
    async createMany(
        options: Prisma.InventoryStockCreateManyArgs
    ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
        try {
            if (!options.data || (Array.isArray(options.data) && (options.data as any[]).length === 0)) {
                return {
                    status: false,
                    message: "No data provided for createMany",
                };
            }

            const result = await prisma.inventoryStock.createMany({
                ...options,
                skipDuplicates: options.skipDuplicates ?? true, // safe default — skips already-assigned permissions
            });

            return {
                status: true,
                data: { count: result.count },
                message: `${result.count} InventoryStock record(s) created successfully`,
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to create inventoryStock records",
            };
        }
    },

    // ---------- Delete Many InventoryStocks ----------
    async deleteMany(
        options: { where: Prisma.InventoryStockWhereInput }
    ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
        try {
            if (!options.where) {
                throw new Error("Filter (where) is required for deleteMany");
            }

            const result = await prisma.inventoryStock.deleteMany({
                where: options.where,
            });

            return {
                status: true,
                data: { count: result.count },
                message: `${result.count} InventoryStock record(s) deleted successfully`,
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to delete inventoryStock records",
            };
        }
    },

    // ---------- Update Admin ----------
    async update(
        id: number,
        data: Prisma.InventoryStockUpdateInput,
        options: Partial<Prisma.InventoryStockUpdateArgs> = {}
    ): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const inventoryStock = await prisma.inventoryStock.update({
                where: { id },
                data,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(inventoryStock, "number"),
                message: "Admin updated successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to update inventoryStock",
            };
        }
    },

    // ---------- Delete Admin ----------
    async delete(
        where: Prisma.InventoryStockWhereUniqueInput,
        options: Partial<Prisma.InventoryStockDeleteArgs> = {}
    ): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const inventoryStock = await prisma.inventoryStock.delete({
                where,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(inventoryStock, "number"),
                message: "Admin deleted successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to delete inventoryStock",
            };
        }
    },
};

export default inventoryStockRepo;
