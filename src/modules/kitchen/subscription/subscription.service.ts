// src/modules/kitchen/subscription/subscription.service.ts

import { BillingCycle } from '../../../../prisma/generated/prisma/client';
import subscriptionRepo from '../../shared/subscription/subscription.repository';
import kitchenSubscriptionRepo from '../../shared/subscription/kitchenSubscription.repository';
import { debug, debugError } from '../../../core/helpers/debug';

interface SelectPlanData {
    kitchenId: number;
    subscriptionId: number;
    billingCycle: BillingCycle;
    duration: number;
}

export const selectPlanService = async (data: SelectPlanData) => {
    try {
        const { kitchenId, subscriptionId, billingCycle, duration } = data;

        debug(`[Subscription Service] Selecting plan for kitchenId: ${kitchenId}`);

        // =========================
        // FETCH PLAN
        // =========================
        const planRes = await subscriptionRepo.findUnique({
            where: { id: subscriptionId }
        });

        if (!planRes.status || !planRes.data) {
            return {
                status: false,
                message: 'Subscription plan not found'
            };
        }

        const plan = planRes.data;

        // =========================
        // CHECK ACTIVE SUB
        // =========================
        const existing = await kitchenSubscriptionRepo.findFirst({
            where: {
                kitchenId,
                status: 'ACTIVE'
            }
        });

        if (existing?.data) {
            return {
                status: false,
                message: 'Active subscription already exists'
            };
        }

        const now = new Date();

        // =========================
        // TRIAL
        // =========================
        let trialStartDate: Date | null = null;
        let trialEndDate: Date | null = null;

        if (plan.freeTrialDays) {
            trialStartDate = now;
            trialEndDate = new Date(now);
            trialEndDate.setDate(trialEndDate.getDate() + plan.freeTrialDays);
        }

        // =========================
        // PLAN DATES
        // =========================
        const planStartDate = trialEndDate || now;
        const planEndDate = new Date(planStartDate);

        if (billingCycle === 'MONTHLY') {
            planEndDate.setMonth(planEndDate.getMonth() + duration);
        } else {
            planEndDate.setFullYear(planEndDate.getFullYear() + duration);
        }

        // =========================
        // PRICE
        // =========================
        const pricePaid =
            billingCycle === 'MONTHLY'
                ? plan.price * duration
                : (plan.annualPrice || plan.price * 12) * duration;

        // =========================
        // CREATE SUB
        // =========================
        const createRes = await kitchenSubscriptionRepo.create({
            kitchen: {
                connect: { id: kitchenId }
            },
            subscription: {
                connect: { id: subscriptionId }
            },

            trialStartDate,
            trialEndDate,
            trialDays: plan.freeTrialDays,

            planStartDate,
            planEndDate,

            billingCycle,
            duration,

            pricePaid,
            originalPrice: pricePaid,
            discountPct: plan.discountPct,

            maxUsers: plan.maxUsers,
            maxBranches: plan.maxBranches,

            status: 'ACTIVE'
        });

        if (!createRes.status) {
            return {
                status: false,
                message: createRes.message || 'Failed to create subscription'
            };
        }

        debug('[Subscription Service] Plan selected successfully');

        return {
            status: true,
            message: 'Subscription activated successfully',
            data: createRes.data
        };

    } catch (error: any) {
        debugError(`[Subscription Service] Error: ${error.message}`);

        return {
            status: false,
            message: 'Something went wrong while selecting plan'
        };
    }
};

export const listPlansService = async () => {
    try {
        const response = await subscriptionRepo.findMany({
            orderBy: {
                price: 'asc'
            },
            include: {
                features: true
            }
        });

        if (!response.status) {
            return {
                status: false,
                message: response.message || 'Failed to fetch subscription plans',
                data: []
            };
        }

        return {
            status: true,
            message: 'Subscription plans fetched successfully',
            data: response.data || []
        };
    } catch (error: any) {
        debugError(`[Subscription Service] Plan list error: ${error.message}`);

        return {
            status: false,
            message: 'Something went wrong while fetching plans',
            data: []
        };
    }
};
