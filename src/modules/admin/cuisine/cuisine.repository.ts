import { prisma, Prisma } from '../../../../lib/prisma';
import stringHelper from '../../../core/helpers/string.helper';

const cuisineRepo = {
    async findUnique(options: Prisma.CuisineFindUniqueArgs) {
        try {
            if (!options.where) throw new Error("Unique filter (where) is required");

            const cuisine = await prisma.cuisine.findUnique(options);

            if (!cuisine) {
                return { status: false, message: "Cuisine not found" };
            }

            return {
                status: true,
                data: stringHelper.convertBigInt(cuisine, "number"),
                message: "Cuisine retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve cuisine" };
        }
    },

    async findFirst(options: Prisma.CuisineFindFirstArgs) {
        try {
            if (!options.where) throw new Error("Filter (where) is required");

            const cuisine = await prisma.cuisine.findFirst(options);

            if (!cuisine) {
                return { status: false, message: "Cuisine not found" };
            }

            return {
                status: true,
                data: stringHelper.convertBigInt(cuisine, "number"),
                message: "Cuisine retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve cuisine" };
        }
    },

    async findMany(options: Prisma.CuisineFindManyArgs = {}) {
        try {
            const cuisines = await prisma.cuisine.findMany(options);

            return {
                status: true,
                data: stringHelper.convertBigInt(cuisines, "number"),
                message: "Cuisine records retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve cuisine records" };
        }
    },

    async count(options: { where?: Prisma.CuisineWhereInput } = {}) {
        try {
            const count = await prisma.cuisine.count({ where: options.where });

            return { status: true, data: count, message: "Cuisine count retrieved successfully" };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to count cuisine records" };
        }
    },

    async create(
        data: Prisma.CuisineCreateInput,
        options: Partial<Prisma.CuisineCreateArgs> = {}
    ) {
        try {
            const cuisine = await prisma.cuisine.create({ data, ...options });

            return {
                status: true,
                data: stringHelper.convertBigInt(cuisine, "number"),
                message: "Cuisine created successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to create cuisine" };
        }
    },

    async update(
        id: number,
        data: Prisma.CuisineUpdateInput,
        options: Partial<Prisma.CuisineUpdateArgs> = {}
    ) {
        try {
            const cuisine = await prisma.cuisine.update({
                where: { id },
                data,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(cuisine, "number"),
                message: "Cuisine updated successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to update cuisine" };
        }
    },

    async delete(
        where: Prisma.CuisineWhereUniqueInput,
        options: Partial<Prisma.CuisineDeleteArgs> = {}
    ) {
        try {
            const cuisine = await prisma.cuisine.delete({ where, ...options });

            return {
                status: true,
                data: stringHelper.convertBigInt(cuisine, "number"),
                message: "Cuisine deleted successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to delete cuisine" };
        }
    },
};

export default cuisineRepo;