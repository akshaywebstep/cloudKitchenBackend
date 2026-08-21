// src/modules/admin/auth/auth.validation.ts

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import debugHelper from '../../../core/helpers/debug';

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

// ─── Schemas ────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
    username: z
        .string()
        .trim()
        .min(1, "Username / Email / Phone is required")
        .refine((value) => {
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            const isPhone = /^\+?[0-9]{7,15}$/.test(value);
            const isUsername = /^[a-zA-Z0-9_]{3,32}$/.test(value);

            return isEmail || isPhone || isUsername;
        }, "Enter a valid username, email, or phone number"),

    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(64, 'Password is too long'),
});

export const registerSchema = z.object({
    // ===============================================
    // KITCHEN
    // ===============================================
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

    // ===============================================
    // CONTACT PERSON
    // ===============================================
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

export const forgotPasswordSchema = z.object({
    username: z
        .string()
        .min(1, "Username is required")
});

export const resetPasswordSchema = z.object({
    token: z
        .string()
        .min(1, "Token is required"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password is too long"),

    confirmPassword: z
        .string()
        .min(8, "Confirm password is required")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ─── Middleware Factories ────────────────────────────────────────────────────

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
    debugHelper.debugWarn('[Zod] Validating login body...');

    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((e) => {
            const field = formatZodPath(e.path);
            errors[field] = e.message;
        });

        debugHelper.debugWarn('[Zod] Login validation failed:', errors);
        return res.status(400).json({
            status: false,
            message: 'Validation failed',
            errors,
        });
    }

    // Attach parsed + stripped data back to body
    req.body = result.data;
    next();
};

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
    debugHelper.debugWarn('[Zod] Validating register body...');

    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((e) => {
            const field = formatZodPath(e.path);
            errors[field] = e.message;
        });

        debugHelper.debugWarn('[Zod] Register validation failed:', errors);
        return res.status(400).json({
            status: false,
            message: 'Validation failed',
            errors,
        });
    }

    req.body = result.data;
    next();
};

export const validateForgotPassword = (req: Request, res: Response, next: NextFunction) => {
    debugHelper.debugWarn('[Zod] Validating forgot password body...');

    const result = forgotPasswordSchema.safeParse(req.body);

    if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((e) => {
            const field = formatZodPath(e.path);
            errors[field] = e.message;
        });

        return res.status(400).json({
            status: false,
            message: 'Validation failed',
            errors,
        });
    }

    req.body = result.data;
    next();
};

export const validateResetPassword = (req: Request, res: Response, next: NextFunction) => {
    debugHelper.debugWarn('[Zod] Validating reset password body...');

    const result = resetPasswordSchema.safeParse(req.body);

    if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((e) => {
            const field = formatZodPath(e.path);
            errors[field] = e.message;
        });

        return res.status(400).json({
            status: false,
            message: 'Validation failed',
            errors,
        });
    }

    req.body = result.data;
    next();
};