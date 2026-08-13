import { prisma, Prisma } from '../../../../lib/prisma';
import stringHelper from '../../../core/helpers/string.helper';

const orderRepo = {
    async findUnique(options: Prisma.OrderFindUniqueArgs) {
        try {
            if (!options.where) throw new Error("Unique filter (where) is required");
            const order = await prisma.order.findUnique(options);
            if (!order) return { status: false, message: "Order not found" };
            return { status: true, data: stringHelper.convertBigInt(order, "number"), message: "Order retrieved successfully" };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve order" };
        }
    },

    async findMany(options: Prisma.OrderFindManyArgs = {}) {
        try {
            const orders = await prisma.order.findMany(options);
            return { status: true, data: stringHelper.convertBigInt(orders, "number"), message: "Order records retrieved successfully" };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to retrieve order records" };
        }
    },

    async count(options: { where?: Prisma.OrderWhereInput } = {}) {
        try {
            const count = await prisma.order.count({ where: options.where });
            return { status: true, data: count, message: "Order count retrieved successfully" };
        } catch (err: any) {
            return { status: false, message: err.message || "Unable to count order records" };
        }
    },
};

export default orderRepo;