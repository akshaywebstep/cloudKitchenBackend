import { prisma, Prisma } from '../../../../lib/prisma';
import stringHelper from '../../../core/helpers/string.helper';

const menuCategoryRepo = {
    async findUnique(options: Prisma.MenuCategoryFindUniqueArgs) {
        try {
            if (!options.where) throw new Error("Unique filter (where) is required");
            const category = await prisma.menuCategory.findUnique(options);
            if (!category) return { status: false, message: "Menu category not found" };
            return {
                status: true,
                data: stringHelper.convertBigInt(category, "number"),
                message: "Menu category retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve menu category" };
        }
    },

    async findFirst(options: Prisma.MenuCategoryFindFirstArgs) {
        try {
            if (!options.where) throw new Error("Filter (where) is required");
            const category = await prisma.menuCategory.findFirst(options);
            if (!category) return { status: false, message: "Menu category not found" };
            return {
                status: true,
                data: stringHelper.convertBigInt(category, "number"),
                message: "Menu category retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve menu category" };
        }
    },

    async findMany(options: Prisma.MenuCategoryFindManyArgs = {}) {
        try {
            const categories = await prisma.menuCategory.findMany(options);
            return {
                status: true,
                data: stringHelper.convertBigInt(categories, "number"),
                message: "Menu category records retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve menu category records" };
        }
    },

    async count(options: { where?: Prisma.MenuCategoryWhereInput } = {}) {
        try {
            const count = await prisma.menuCategory.count({ where: options.where });
            return { status: true, data: count, message: "Menu category count retrieved successfully" };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to count menu category records" };
        }
    },

    async create(
        data: Prisma.MenuCategoryCreateInput,
        options: Partial<Prisma.MenuCategoryCreateArgs> = {}
    ) {
        try {
            const category = await prisma.menuCategory.create({ data, ...options });
            return {
                status: true,
                data: stringHelper.convertBigInt(category, "number"),
                message: "Menu category created successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to create menu category" };
        }
    },

    async update(
        id: number,
        data: Prisma.MenuCategoryUpdateInput,
        options: Partial<Prisma.MenuCategoryUpdateArgs> = {}
    ) {
        try {
            const category = await prisma.menuCategory.update({ where: { id }, data, ...options });
            return {
                status: true,
                data: stringHelper.convertBigInt(category, "number"),
                message: "Menu category updated successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to update menu category" };
        }
    },

    async delete(
        where: Prisma.MenuCategoryWhereUniqueInput,
        options: Partial<Prisma.MenuCategoryDeleteArgs> = {}
    ) {
        try {
            const category = await prisma.menuCategory.delete({ where, ...options });
            return {
                status: true,
                data: stringHelper.convertBigInt(category, "number"),
                message: "Menu category deleted successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to delete menu category" };
        }
    },
};

export default menuCategoryRepo;