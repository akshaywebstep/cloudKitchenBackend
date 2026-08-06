// src/modules/admin/auth/auth.validation.ts

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

// ─── Schemas ────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
    username: z
        .string()
        .trim()
        .min(1, "Email / Phone is required")
        .refine((value) => {
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            const isPhone = /^\+?[0-9]{7,15}$/.test(value);

            return isEmail || isPhone;
        }, "Enter a valid email or phone number"),

    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(64, 'Password is too long'),
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
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ─── Middleware Factories ────────────────────────────────────────────────────

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
    debugHelper.debugWarn('[Zod] Validating admin login body...');

    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((e) => {
            const field = formatZodPath(e.path);
            errors[field] = e.message;
        });

        debugHelper.debugWarn('[Zod] Admin login validation failed:', errors);
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
    debugHelper.debugWarn('[Zod] Validating admin forgot password body...');

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
    debugHelper.debugWarn('[Zod] Validating admin reset password body...');

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