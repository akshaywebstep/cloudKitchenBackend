import debugHelper from "../../../core/helpers/debug";
import stringHelper from "../../../core/helpers/string.helper";
import subscriptionRepo from "./subscription.repository";
import { FeatureType } from "../../../../prisma/generated/prisma/client";

// =====================================================
// ✅ CREATE SUBSCRIPTION (with features)
// =====================================================
export const createSubscription = async (data: {
    name: string;
    title?: string;
    price: number;
    annualPrice?: number;
    discountPct?: number;
    freeTrialDays?: number;
    maxBranches: number;
    maxUsers: number;
    features?: { type: FeatureType; feature: string }[];
}) => {
    try {
        debugHelper.debug("[Subscription Service] createSubscription called with:", JSON.stringify(data));

        const { features, ...planData } = data;

        // 1️⃣ Create the subscription plan
        const createResult = await subscriptionRepo.create(planData);

        if (!createResult.status || !createResult.data) {
            return { status: false, message: createResult.message || "Failed to create subscription plan" };
        }

        const subscriptionId = createResult.data.id;

        // 2️⃣ Create features (if any)
        if (features && features.length > 0) {
            const featuresResult = await subscriptionRepo.createFeatures(
                features.map((f) => ({
                    subscriptionId,
                    type: f.type,
                    feature: f.feature,
                }))
            );

            if (!featuresResult.status) {
                debugHelper.debugError("[Subscription Service] Feature creation failed:", featuresResult.message);
                // Plan already created — feature failure is non-fatal, but log clearly
            }
        }

        // 3️⃣ Fetch final result with features
        const finalResult = await subscriptionRepo.findUnique(subscriptionId);

        if (!finalResult.status || !finalResult.data) {
            return { status: false, message: "Subscription created but failed to fetch final result" };
        }

        return {
            status: true,
            data: stringHelper.convertBigInt(finalResult.data, "number"),
            message: "Subscription plan created successfully",
        };
    } catch (error: any) {
        debugHelper.debugError("[Subscription Service] createSubscription failed:", error);
        return { status: false, message: error.message || "Failed to create subscription plan" };
    }
};

// =====================================================
// ✏️ UPDATE SUBSCRIPTION (with features — replace strategy)
// =====================================================
export const updateSubscription = async (
    id: number,
    data: {
        name?: string;
        title?: string;
        price?: number;
        annualPrice?: number;
        discountPct?: number;
        freeTrialDays?: number;
        maxBranches?: number;
        maxUsers?: number;
        features?: { type: FeatureType; feature: string }[];
    }
) => {
    try {
        debugHelper.debug(`[Subscription Service] updateSubscription called for id ${id}:`, JSON.stringify(data));

        // 1️⃣ Check existence
        const existing = await subscriptionRepo.findUnique(id);
        if (!existing.status || !existing.data) {
            return { status: false, message: "Subscription plan not found" };
        }

        const { features, ...planData } = data;

        // 2️⃣ Update plan fields (if any provided)
        if (Object.keys(planData).length > 0) {
            const updateResult = await subscriptionRepo.update(id, planData);
            if (!updateResult.status) {
                return { status: false, message: updateResult.message || "Failed to update subscription plan" };
            }
        }

        // 3️⃣ Replace features entirely if a new list is provided
        if (features !== undefined) {
            const deleteResult = await subscriptionRepo.deleteFeaturesBySubscriptionId(id);
            if (!deleteResult.status) {
                debugHelper.debugError("[Subscription Service] Feature deletion failed:", deleteResult.message);
            }

            if (features.length > 0) {
                const createFeaturesResult = await subscriptionRepo.createFeatures(
                    features.map((f) => ({
                        subscriptionId: BigInt(id),
                        type: f.type,
                        feature: f.feature,
                    }))
                );

                if (!createFeaturesResult.status) {
                    debugHelper.debugError("[Subscription Service] Feature creation failed:", createFeaturesResult.message);
                }
            }
        }

        // 4️⃣ Fetch final result with features
        const finalResult = await subscriptionRepo.findUnique(id);

        if (!finalResult.status || !finalResult.data) {
            return { status: false, message: "Subscription updated but failed to fetch final result" };
        }

        return {
            status: true,
            data: stringHelper.convertBigInt(finalResult.data, "number"),
            message: "Subscription plan updated successfully",
        };
    } catch (error: any) {
        debugHelper.debugError("[Subscription Service] updateSubscription failed:", error);
        return { status: false, message: error.message || "Failed to update subscription plan" };
    }
};

// =====================================================
// 📄 LIST SUBSCRIPTIONS
// =====================================================
export const getSubscriptions = async (params: { page: number; limit: number }) => {
    try {
        const { page, limit } = params;
        const skip = (page - 1) * limit;

        const [dataRes, totalRes] = await Promise.all([
            subscriptionRepo.findMany({ skip, take: limit }),
            subscriptionRepo.count(),
        ]);

        const data = dataRes.data || [];
        const total = totalRes.data || 0;
        const totalPages = Math.ceil(total / limit);

        return {
            status: true,
            data: stringHelper.convertBigInt(data, "number"),
            meta: {
                page,
                limit,
                total,
                count: data.length,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error: any) {
        debugHelper.debugError("[Subscription Service] getSubscriptions failed:", error);
        return { status: false, message: error.message || "Failed to fetch subscription plans", data: [], meta: null };
    }
};

// =====================================================
// 🔍 GET SINGLE SUBSCRIPTION (preview)
// =====================================================
export const getSubscriptionById = async (id: number) => {
    try {
        const result = await subscriptionRepo.findUnique(id);

        if (!result.status || !result.data) {
            return { status: false, message: "Subscription plan not found" };
        }

        return {
            status: true,
            data: stringHelper.convertBigInt(result.data, "number"),
            message: "Subscription plan fetched successfully",
        };
    } catch (error: any) {
        debugHelper.debugError("[Subscription Service] getSubscriptionById failed:", error);
        return { status: false, message: error.message || "Failed to fetch subscription plan" };
    }
};