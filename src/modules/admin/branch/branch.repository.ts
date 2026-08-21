import { prisma, Prisma } from '../../../../lib/prisma';
import stringHelper from '../../../core/helpers/string.helper';

const branchRepo = {
    async findUnique(options: Prisma.BranchFindUniqueArgs) {
        try {
            if (!options.where) throw new Error("Unique filter (where) is required");
            const branch = await prisma.branch.findUnique(options);
            if (!branch) return { status: false, message: "Branch not found" };
            return {
                status: true,
                data: stringHelper.convertBigInt(branch, "number"),
                message: "Branch retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve branch" };
        }
    },

    async findFirst(options: Prisma.BranchFindFirstArgs) {
        try {
            if (!options.where) throw new Error("Filter (where) is required");
            const branch = await prisma.branch.findFirst(options);
            if (!branch) return { status: false, message: "Branch not found" };
            return {
                status: true,
                data: stringHelper.convertBigInt(branch, "number"),
                message: "Branch retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve branch" };
        }
    },

    async findMany(options: Prisma.BranchFindManyArgs = {}) {
        try {
            const branches = await prisma.branch.findMany(options);
            return {
                status: true,
                data: stringHelper.convertBigInt(branches, "number"),
                message: "Branch records retrieved successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve branch records" };
        }
    },

    async count(options: { where?: Prisma.BranchWhereInput } = {}) {
        try {
            const count = await prisma.branch.count({ where: options.where });
            return { status: true, data: count, message: "Branch count retrieved successfully" };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to count branch records" };
        }
    },

    async create(
        data: Prisma.BranchCreateInput,
        options: Partial<Prisma.BranchCreateArgs> = {}
    ) {
        try {
            const branch = await prisma.branch.create({ data, ...options });
            return {
                status: true,
                data: stringHelper.convertBigInt(branch, "number"),
                message: "Branch created successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to create branch" };
        }
    },

    async update(
        id: number,
        data: Prisma.BranchUpdateInput,
        options: Partial<Prisma.BranchUpdateArgs> = {}
    ) {
        try {
            const branch = await prisma.branch.update({ where: { id }, data, ...options });
            return {
                status: true,
                data: stringHelper.convertBigInt(branch, "number"),
                message: "Branch updated successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to update branch" };
        }
    },

    async delete(
        where: Prisma.BranchWhereUniqueInput,
        options: Partial<Prisma.BranchDeleteArgs> = {}
    ) {
        try {
            const branch = await prisma.branch.delete({ where, ...options });
            return {
                status: true,
                data: stringHelper.convertBigInt(branch, "number"),
                message: "Branch deleted successfully",
            };
        } catch (err: any) {
            return { status: false, message: err.message || "Failed to delete branch" };
        }
    },
};

export default branchRepo;