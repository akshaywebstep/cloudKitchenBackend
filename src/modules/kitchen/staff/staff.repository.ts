import { prisma, Prisma } from '../../../../lib/prisma';
import stringHelper from '../../../core/helpers/string.helper';

const staffRepo = {
    async findUnique(options: Prisma.UserFindUniqueArgs) {
        try {
            if (!options.where) throw new Error("Unique filter (where) is required");
            const staff = await prisma.user.findUnique(options);
            if (!staff) return { status: false, message: "Staff not found" };
            return { status: true, data: stringHelper.convertBigInt(staff, "number"), message: "Staff retrieved successfully" };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve staff" };
        }
    },

    async findFirst(options: Prisma.UserFindFirstArgs) {
        try {
            if (!options.where) throw new Error("Filter (where) is required");
            const staff = await prisma.user.findFirst(options);
            if (!staff) return { status: false, message: "Staff not found" };
            return { status: true, data: stringHelper.convertBigInt(staff, "number"), message: "Staff retrieved successfully" };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve staff" };
        }
    },

    async findMany(options: Prisma.UserFindManyArgs = {}) {
        try {
            const staff = await prisma.user.findMany(options);
            return { status: true, data: stringHelper.convertBigInt(staff, "number"), message: "Staff records retrieved successfully" };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve staff records" };
        }
    },

    async count(options: { where?: Prisma.UserWhereInput } = {}) {
        try {
            const count = await prisma.user.count({ where: options.where });
            return { status: true, data: count, message: "Staff count retrieved successfully" };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to count staff records" };
        }
    },

    async update(
        id: number,
        data: Prisma.UserUpdateInput,
        options: Partial<Prisma.UserUpdateArgs> = {}
    ) {
        try {
            const staff = await prisma.user.update({ where: { id }, data, ...options });
            return { status: true, data: stringHelper.convertBigInt(staff, "number"), message: "Staff updated successfully" };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to update staff" };
        }
    },
};

export default staffRepo;