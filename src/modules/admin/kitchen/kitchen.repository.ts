import { prisma, Prisma } from '../../../../lib/prisma';
import stringHelper from '../../../core/helpers/string.helper';

const kitchenRepo = {
    async findUnique(options: Prisma.UserFindUniqueArgs) {
        try {
            if (!options.where) throw new Error("Unique filter (where) is required");
            const user = await prisma.user.findUnique(options);
            if (!user) return { status: false, message: "Kitchen not found" };
            return {
                status: true,
                data: stringHelper.convertBigInt(user, "number"),
                message: "Kitchen retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve kitchen" };
        }
    },

    async findFirst(options: Prisma.UserFindFirstArgs) {
        try {
            if (!options.where) throw new Error("Filter (where) is required");
            const user = await prisma.user.findFirst(options);
            if (!user) return { status: false, message: "Kitchen not found" };
            return {
                status: true,
                data: stringHelper.convertBigInt(user, "number"),
                message: "Kitchen retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve kitchen" };
        }
    },

    async findMany(options: Prisma.UserFindManyArgs = {}) {
        try {
            const users = await prisma.user.findMany(options);
            return {
                status: true,
                data: stringHelper.convertBigInt(users, "number"),
                message: "Kitchen records retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve kitchen records" };
        }
    },

    async count(options: { where?: Prisma.UserWhereInput } = {}) {
        try {
            const count = await prisma.user.count({ where: options.where });
            return { status: true, data: count, message: "Kitchen count retrieved successfully" };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to count kitchen records" };
        }
    },

    async create(
        data: Prisma.UserCreateInput,
        options: Partial<Prisma.UserCreateArgs> = {}
    ) {
        try {
            const user = await prisma.user.create({ data, ...options });
            return {
                status: true,
                data: stringHelper.convertBigInt(user, "number"),
                message: "Kitchen created successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to create kitchen" };
        }
    },

    async update(
        id: number,
        data: Prisma.UserUpdateInput,
        options: Partial<Prisma.UserUpdateArgs> = {}
    ) {
        try {
            const user = await prisma.user.update({ where: { id }, data, ...options });
            return {
                status: true,
                data: stringHelper.convertBigInt(user, "number"),
                message: "Kitchen updated successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to update kitchen" };
        }
    },

    async delete(
        where: Prisma.UserWhereUniqueInput,
        options: Partial<Prisma.UserDeleteArgs> = {}
    ) {
        try {
            const user = await prisma.user.delete({ where, ...options });
            return {
                status: true,
                data: stringHelper.convertBigInt(user, "number"),
                message: "Kitchen deleted successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to delete kitchen" };
        }
    },
};

export default kitchenRepo;