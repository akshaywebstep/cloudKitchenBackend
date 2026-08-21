import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { FeatureType } from '../../../../prisma/generated/prisma/client';

// ==============================
// 🔹 FEATURE SCHEMA
// ==============================
const featureSchema = z.object({
    type: z.nativeEnum(FeatureType, { message: "type must be INCLUDE or EXCLUDE" }),
    feature: z.string().min(1, "feature text is required"),
});

// ==============================
// 🧾 CREATE SUBSCRIPTION SCHEMA
// ==============================
export const createSubscriptionSchema = z.object({
    name: z.string().min(1, "name is required"),
    title: z.string().optional(),
    price: z.coerce.number().positive("price must be positive"),
    annualPrice: z.coerce.number().positive().optional(),
    discountPct: z.coerce.number().min(0).max(100).optional(),
    freeTrialDays: z.coerce.number().int().min(0).optional(),
    maxBranches: z.coerce.number().int().positive("maxBranches is required"),
    maxUsers: z.coerce.number().int().positive("maxUsers is required"),
    features: z.array(featureSchema).optional(),
});

export const validateCreateSubscription = (req: Request, res: Response, next: NextFunction) => {
    const result = createSubscriptionSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation failed',
            errors: result.error.flatten().fieldErrors,
        });
    }
    req.body = result.data;
    next();
};

// ==============================
// ✏️ UPDATE SUBSCRIPTION SCHEMA
// ==============================
export const updateSubscriptionSchema = createSubscriptionSchema.partial();

export const validateUpdateSubscription = (req: Request, res: Response, next: NextFunction) => {
    const result = updateSubscriptionSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation failed',
            errors: result.error.flatten().fieldErrors,
        });
    }
    req.body = result.data;
    next();
};

// ==============================
// 🆔 PARAM SCHEMA
// ==============================
export const subscriptionIdSchema = z.object({
    id: z.coerce.number().positive(),
});

export const validateSubscriptionId = (req: Request, res: Response, next: NextFunction) => {
    const result = subscriptionIdSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({ status: false, message: 'Invalid subscription id' });
    }
    next();
};