import { prisma } from "../../../../lib/prisma";
import debugHelper from "../../../core/helpers/debug";
import { Prisma } from "../../../../prisma/generated/prisma/client";

// =====================================================
// ✅ CREATE
// =====================================================
const create = async (data: Prisma.SubscriptionCreateInput) => {
    try {
        const result = await prisma.subscription.create({ data });
        return { status: true, data: result };
    } catch (error: any) {
        debugHelper.debugError("[Subscription Repository] create failed:", error);
        return { status: false, message: error.message || "Failed to create subscription", data: null };
    }
};

// =====================================================
// ✏️ UPDATE
// =====================================================
const update = async (id: number | bigint, data: Prisma.SubscriptionUpdateInput) => {
    try {
        const result = await prisma.subscription.update({
            where: { id: BigInt(id) },
            data,
        });
        return { status: true, data: result };
    } catch (error: any) {
        debugHelper.debugError("[Subscription Repository] update failed:", error);
        return { status: false, message: error.message || "Failed to update subscription", data: null };
    }
};

// =====================================================
// 🔍 FIND UNIQUE (by id, with features)
// =====================================================
const findUnique = async (id: number | bigint, include?: Prisma.SubscriptionInclude) => {
    try {
        const result = await prisma.subscription.findUnique({
            where: { id: BigInt(id) },
            include: include ?? { features: true },
        });

        if (!result) {
            return { status: false, message: "Subscription not found", data: null };
        }

        return { status: true, data: result };
    } catch (error: any) {
        debugHelper.debugError("[Subscription Repository] findUnique failed:", error);
        return { status: false, message: error.message || "Failed to fetch subscription", data: null };
    }
};

// =====================================================
// 📄 FIND MANY (list, paginated)
// =====================================================
const findMany = async (params: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.SubscriptionOrderByWithRelationInput;
    include?: Prisma.SubscriptionInclude;
}) => {
    try {
        const result = await prisma.subscription.findMany({
            skip: params.skip,
            take: params.take,
            orderBy: params.orderBy ?? { createdAt: "desc" },
            include: params.include ?? { features: true },
        });
        return { status: true, data: result };
    } catch (error: any) {
        debugHelper.debugError("[Subscription Repository] findMany failed:", error);
        return { status: false, message: error.message || "Failed to fetch subscriptions", data: [] };
    }
};

// =====================================================
// 🔢 COUNT
// =====================================================
const count = async (where?: Prisma.SubscriptionWhereInput) => {
    try {
        const result = await prisma.subscription.count({ where });
        return { status: true, data: result };
    } catch (error: any) {
        debugHelper.debugError("[Subscription Repository] count failed:", error);
        return { status: false, message: error.message || "Failed to count subscriptions", data: 0 };
    }
};

// =====================================================
// 🗑️ DELETE (agar future mein chahiye ho)
// =====================================================
const remove = async (id: number | bigint) => {
    try {
        const result = await prisma.subscription.delete({ where: { id: BigInt(id) } });
        return { status: true, data: result };
    } catch (error: any) {
        debugHelper.debugError("[Subscription Repository] remove failed:", error);
        return { status: false, message: error.message || "Failed to delete subscription", data: null };
    }
};

// =====================================================
// 🔗 SUBSCRIPTION FEATURE — createMany / deleteMany (features ke liye)
// =====================================================
const createFeatures = async (data: Prisma.SubscriptionFeatureCreateManyInput[]) => {
    try {
        const result = await prisma.subscriptionFeature.createMany({ data });
        return { status: true, data: result };
    } catch (error: any) {
        debugHelper.debugError("[Subscription Repository] createFeatures failed:", error);
        return { status: false, message: error.message || "Failed to create features", data: null };
    }
};

const deleteFeaturesBySubscriptionId = async (subscriptionId: number | bigint) => {
    try {
        const result = await prisma.subscriptionFeature.deleteMany({
            where: { subscriptionId: BigInt(subscriptionId) },
        });
        return { status: true, data: result };
    } catch (error: any) {
        debugHelper.debugError("[Subscription Repository] deleteFeaturesBySubscriptionId failed:", error);
        return { status: false, message: error.message || "Failed to delete features", data: null };
    }
};

export default {
    create,
    update,
    findUnique,
    findMany,
    count,
    remove,
    createFeatures,
    deleteFeaturesBySubscriptionId,
};