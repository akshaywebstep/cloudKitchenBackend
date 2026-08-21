// src/modules/admin/admin/admin.repository.ts

import { prisma, Prisma } from "../../../../lib/prisma";
import stringHelper from "../../../core/helpers/string.helper";

const ingredientRepo = {
    // ---------- Find Admin(Unique) ----------
    async findUnique(options: Prisma.IngredientFindUniqueArgs): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            if (!options.where) {
                throw new Error("Unique filter (where) is required");
            }

            const ingredient = await prisma.ingredient.findUnique(options);

            if (!ingredient) {
                return {
                    status: false,
                    message: "Ingredient not found",
                };
            }

            return {
                status: true,
                data: stringHelper.convertBigInt(ingredient, "number"),
                message: ingredient ? "Admin record retrieved successfully" : "Admin not found",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Unable to retrieve ingredient record",
            };
        }
    },

    // ---------- Find Admin(First Match) ----------
    async findFirst(options: Prisma.IngredientFindFirstArgs): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            if (!options.where) {
                throw new Error("Filter (where) is required");
            }

            const ingredient = await prisma.ingredient.findFirst(options);

            if (!ingredient) {
                return {
                    status: false,
                    message: "Ingredient not found",
                };
            }

            return {
                status: true,
                data: stringHelper.convertBigInt(ingredient, "number"),
                message: ingredient ? "Admin record retrieved successfully" : "Admin not found",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Unable to retrieve ingredient record",
            };
        }
    },

    // ---------- Find Multiple Admins ----------
    async findMany(options: Prisma.IngredientFindManyArgs = {}): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const ngredients = await prisma.ingredient.findMany(options);

            return {
                status: true,
                data: stringHelper.convertBigInt(ngredients, "number"),
                message: "Admin records retrieved successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Unable to retrieve ingredient records",
            };
        }
    },

    // ---------- Count Admins ----------
    async count(options: { where?: Prisma.IngredientWhereInput } = {}): Promise<{ status: boolean; data?: number; message: string }> {
        try {
            const count = await prisma.ingredient.count({
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
                message: err.message || "Unable to count ingredient records",
            };
        }
    },

    // ---------- Create Admin ----------
    async create(
        data: Prisma.IngredientCreateInput,
        options: Partial<Prisma.IngredientCreateArgs> = {}
    ): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const ingredient = await prisma.ingredient.create({
                data,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(ingredient, "number"),
                message: "Admin created successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to create ingredient",
            };
        }
    },

    // ---------- Create Many Ingredients ----------
    async createMany(
        options: Prisma.IngredientCreateManyArgs
    ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
        try {
            if (!options.data || (Array.isArray(options.data) && (options.data as any[]).length === 0)) {
                return {
                    status: false,
                    message: "No data provided for createMany",
                };
            }

            const result = await prisma.ingredient.createMany({
                ...options,
                skipDuplicates: options.skipDuplicates ?? true, // safe default — skips already-assigned permissions
            });

            return {
                status: true,
                data: { count: result.count },
                message: `${result.count} Ingredient record(s) created successfully`,
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to create ingredient records",
            };
        }
    },

    // ---------- Delete Many Ingredients ----------
    async deleteMany(
        options: { where: Prisma.IngredientWhereInput }
    ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
        try {
            if (!options.where) {
                throw new Error("Filter (where) is required for deleteMany");
            }

            const result = await prisma.ingredient.deleteMany({
                where: options.where,
            });

            return {
                status: true,
                data: { count: result.count },
                message: `${result.count} Ingredient record(s) deleted successfully`,
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to delete ingredient records",
            };
        }
    },

    // ---------- Update Admin ----------
    async update(
        id: number,
        data: Prisma.IngredientUpdateInput,
        options: Partial<Prisma.IngredientUpdateArgs> = {}
    ): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const ingredient = await prisma.ingredient.update({
                where: { id },
                data,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(ingredient, "number"),
                message: "Admin updated successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to update ingredient",
            };
        }
    },

    // ---------- Delete Admin ----------
    async delete(
        where: Prisma.IngredientWhereUniqueInput,
        options: Partial<Prisma.IngredientDeleteArgs> = {}
    ): Promise<{ status: boolean; data?: any; message: string }> {
        try {
            const ingredient = await prisma.ingredient.delete({
                where,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(ingredient, "number"),
                message: "Admin deleted successfully",
            };
        } catch (err: any) {
            return {
                status: false,
                message: err.message || "Failed to delete ingredient",
            };
        }
    },
};

export default ingredientRepo;
