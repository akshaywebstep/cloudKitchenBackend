import { prisma, Prisma } from '../../../../../lib/prisma';
import stringHelper from '../../../../core/helpers/string.helper';

const branchIngredientInventoryRepo = {
    async findUnique(options: Prisma.BranchIngredientInventoryFindUniqueArgs) {
        try {
            if (!options.where) throw new Error("Unique filter (where) is required");

            const item = await prisma.branchIngredientInventory.findUnique(options);

            if (!item) {
                return { status: false, message: "Inventory item not found" };
            }

            return {
                status: true,
                data: stringHelper.convertBigInt(item, "number"),
                message: "Inventory item retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve inventory item" };
        }
    },

    async findFirst(options: Prisma.BranchIngredientInventoryFindFirstArgs) {
        try {
            if (!options.where) throw new Error("Filter (where) is required");

            const item = await prisma.branchIngredientInventory.findFirst(options);

            if (!item) {
                return { status: false, message: "Inventory item not found" };
            }

            return {
                status: true,
                data: stringHelper.convertBigInt(item, "number"),
                message: "Inventory item retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve inventory item" };
        }
    },

    async findMany(options: Prisma.BranchIngredientInventoryFindManyArgs = {}) {
        try {
            const items = await prisma.branchIngredientInventory.findMany(options);

            return {
                status: true,
                data: stringHelper.convertBigInt(items, "number"),
                message: "Inventory items retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve inventory items" };
        }
    },

    async count(options: { where?: Prisma.BranchIngredientInventoryWhereInput } = {}) {
        try {
            const count = await prisma.branchIngredientInventory.count({ where: options.where });
            return { status: true, data: count, message: "Inventory count retrieved successfully" };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to count inventory items" };
        }
    },

    async create(
        data: Prisma.BranchIngredientInventoryCreateInput,
        options: Partial<Prisma.BranchIngredientInventoryCreateArgs> = {}
    ) {
        try {
            const item = await prisma.branchIngredientInventory.create({ data, ...options });

            return {
                status: true,
                data: stringHelper.convertBigInt(item, "number"),
                message: "Inventory item created successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to create inventory item" };
        }
    },

    async update(
        id: bigint,
        data: Prisma.BranchIngredientInventoryUpdateInput,
        options: Partial<Prisma.BranchIngredientInventoryUpdateArgs> = {}
    ) {
        try {
            const item = await prisma.branchIngredientInventory.update({
                where: { id },
                data,
                ...options,
            });

            return {
                status: true,
                data: stringHelper.convertBigInt(item, "number"),
                message: "Inventory item updated successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to update inventory item" };
        }
    },

    async delete(
        where: Prisma.BranchIngredientInventoryWhereUniqueInput,
        options: Partial<Prisma.BranchIngredientInventoryDeleteArgs> = {}
    ) {
        try {
            const item = await prisma.branchIngredientInventory.delete({ where, ...options });

            return {
                status: true,
                data: stringHelper.convertBigInt(item, "number"),
                message: "Inventory item deleted successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to delete inventory item" };
        }
    },
};

export default branchIngredientInventoryRepo;