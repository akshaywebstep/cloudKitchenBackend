import { prisma, Prisma } from '../../../../lib/prisma';
import stringHelper from '../../../core/helpers/string.helper';

const ingredientRepo = {
    async findUnique(options: Prisma.IngredientFindUniqueArgs) {
        try {
            if (!options.where) throw new Error("Unique filter (where) is required");

            const ingredient = await prisma.ingredient.findUnique(options);

            if (!ingredient) {
                return { status: false, message: "Ingredient not found" };
            }

            return {
                status: true,
                data: stringHelper.convertBigInt(ingredient, "number"),
                message: "Ingredient retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve ingredient" };
        }
    },

    async findFirst(options: Prisma.IngredientFindFirstArgs) {
        try {
            if (!options.where) throw new Error("Filter (where) is required");

            const ingredient = await prisma.ingredient.findFirst(options);

            if (!ingredient) {
                return { status: false, message: "Ingredient not found" };
            }

            return {
                status: true,
                data: stringHelper.convertBigInt(ingredient, "number"),
                message: "Ingredient retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve ingredient" };
        }
    },

    async findMany(options: Prisma.IngredientFindManyArgs = {}) {
        try {
            const ingredients = await prisma.ingredient.findMany(options);

            return {
                status: true,
                data: stringHelper.convertBigInt(ingredients, "number"),
                message: "Ingredient records retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve ingredient records" };
        }
    },

    async count(options: { where?: Prisma.IngredientWhereInput } = {}) {
        try {
            const count = await prisma.ingredient.count({ where: options.where });

            return { status: true, data: count, message: "Ingredient count retrieved successfully" };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to count ingredient records" };
        }
    },

    async create(
        data: Prisma.IngredientCreateInput,
        options: Partial<Prisma.IngredientCreateArgs> = {}
    ) {
        try {
            const ingredient = await prisma.ingredient.create({ data, ...options });

            return {
                status: true,
                data: stringHelper.convertBigInt(ingredient, "number"),
                message: "Ingredient created successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to create ingredient" };
        }
    },

    async update(
        id: number,
        data: Prisma.IngredientUpdateInput,
        options: Partial<Prisma.IngredientUpdateArgs> = {}
    ) {
        try {
            const ingredient = await prisma.ingredient.update({
                where: { id },
                data,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(ingredient, "number"),
                message: "Ingredient updated successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to update ingredient" };
        }
    },

    async delete(
        where: Prisma.IngredientWhereUniqueInput,
        options: Partial<Prisma.IngredientDeleteArgs> = {}
    ) {
        try {
            const ingredient = await prisma.ingredient.delete({ where, ...options });

            return {
                status: true,
                data: stringHelper.convertBigInt(ingredient, "number"),
                message: "Ingredient deleted successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to delete ingredient" };
        }
    },
};

export default ingredientRepo;