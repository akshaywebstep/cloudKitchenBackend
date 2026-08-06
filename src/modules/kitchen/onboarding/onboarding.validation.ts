// src/modules/kitchen/onboarding/onboarding.validation.ts

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
export const onboardingSchema = z.object({
    // FSSAI (required)
    fssaiNumber: z
        .string()
        .trim()
        .min(1, "FSSAI number is required")
        .regex(/^[0-9]{14}$/, "FSSAI must be a valid 14-digit number"),

    // GST (optional)
    gstNumber: z
        .string()
        .trim()
        .optional()
        .transform((val) => {
            // convert empty string to undefined
            if (!val || val === "") return undefined;
            return val;
        })
        .refine((val) => {
            if (!val) return true; // ✅ skip validation if not provided

            return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[0-9A-Z]{1}$/.test(val);
        }, {
            message: "Invalid GST number format",
        }),
});

// ==============================
// 🧾 TYPE
// ==============================
export type OnboardingInput = z.infer<typeof onboardingSchema>;

// ==============================
// 🛡️ MIDDLEWARE
// ==============================
export const validateOnboarding = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    debugWarn('[Zod] Validating onboarding body...');

    const result = onboardingSchema.safeParse(req.body);

    if (!result.success) {
        const errors: Record<string, string> = {};

        result.error.issues.forEach((e) => {
            const field = formatZodPath(e.path);
            errors[field] = e.message;
        });

        debugWarn('[Zod] Onboarding validation failed:', errors);

        return res.status(400).json({
            status: false,
            message: 'Validation failed',
            errors,
        });
    }

    // ✅ sanitized data
    req.body = result.data;

    next();
};