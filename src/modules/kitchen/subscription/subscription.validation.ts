import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { debugWarn } from '../../../core/helpers/debug';

// ==============================
// 📦 HELPERS
// ==============================
const formatZodPath = (path: PropertyKey[]) => {
    let result = "";

    path.forEach((p, i) => {
        if (typeof p === "number") {
            result += `[${p}]`;
        } else if (typeof p === "string") {
            if (i === 0) {
                result += p;
            } else {
                result += `.${p}`;
            }
        }
        // ⚠️ ignore symbol (very rare in Zod)
    });

    return result;
};

// ==============================
// 🧾 SCHEMA
// ==============================
export const selectPlanSchema = z.object({
    subscriptionId: z
        .number()
        .int()
        .positive("Subscription ID must be greater than 0"),

    billingCycle: z.enum(['MONTHLY', 'YEARLY'], {
        message: "Billing cycle must be MONTHLY or YEARLY"
    }),

    duration: z
        .number()
        .int()
        .positive("Duration must be greater than 0")
});

// ==============================
// 🧾 TYPE
// ==============================
export type SelectPlanInput = z.infer<typeof selectPlanSchema>;

// ==============================
// 🛡️ MIDDLEWARE
// ==============================
export const validateSelectPlan = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    debugWarn('[Zod] Validating select plan body...');

    // ⚠️ Important: body values often come as string (Postman)
    const parsedBody = {
        ...req.body,
        subscriptionId: Number(req.body.subscriptionId),
        duration: Number(req.body.duration)
    };

    const result = selectPlanSchema.safeParse(parsedBody);

    if (!result.success) {
        const errors: Record<string, string> = {};

        result.error.issues.forEach((e) => {
            const field = formatZodPath(e.path);
            errors[field] = e.message;
        });

        debugWarn('[Zod] Select plan validation failed:', errors);

        return res.status(400).json({
            status: false,
            message: 'Validation failed',
            errors
        });
    }

    // ✅ sanitized body
    req.body = result.data;

    next();
};