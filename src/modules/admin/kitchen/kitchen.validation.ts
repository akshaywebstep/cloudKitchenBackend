// src/modules/admin/kitchen/kitchen.validation.ts

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import debugHelper from '../../../core/helpers/debug';

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
    });

    return result;
};

// ─── Schema ─────────────────────────────────────────────────────────────────
// Same shape as kitchen self-register, since Admin creates a Kitchen the same way

export const createKitchenSchema = z.object({
    kitchenName: z
        .string()
        .min(1, "Kitchen name cannot be empty"),

    phone: z
        .string()
        .min(7, 'Phone number is too short')
        .max(15, 'Phone number is too long')
        .regex(/^\+?[0-9]+$/, 'Phone must be a valid number'),

    email: z
        .string()
        .email("Invalid email format"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password is too long"),

    contactTitle: z.enum(['MR', 'MRS', 'MS', 'DR'], {
        message: "Contact title must be MR, MRS, MS or DR"
    }),

    contactFirstName: z
        .string()
        .min(1, "Contact first name cannot be empty"),

    contactLastName: z
        .string()
        .optional(),

    contactEmail: z
        .string()
        .email("Invalid contact email format"),

    contactPhone: z
        .string()
        .min(7, "Contact phone is too short")
        .max(15, "Contact phone is too long")
        .regex(/^\+?[0-9]+$/, "Contact phone must be a valid number"),
});

export type CreateKitchenInput = z.infer<typeof createKitchenSchema>;

// ─── Middleware ─────────────────────────────────────────────────────────────

export const validateCreateKitchen = (req: Request, res: Response, next: NextFunction) => {
    debugHelper.debugWarn('[Zod] Validating admin create-kitchen body...');

    const result = createKitchenSchema.safeParse(req.body);

    if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((e) => {
            const field = formatZodPath(e.path);
            errors[field] = e.message;
        });

        debugHelper.debugWarn('[Zod] Admin create-kitchen validation failed:', errors);
        return res.status(400).json({
            status: false,
            message: 'Validation failed',
            errors,
        });
    }

    req.body = result.data;
    next();
};