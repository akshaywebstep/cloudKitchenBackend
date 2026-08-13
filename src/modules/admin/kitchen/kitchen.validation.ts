import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Status } from '../../../../prisma/generated/prisma/client';

// ==============================
// 🧾 CREATE SCHEMA
// ==============================
export const createKitchenSchema = z.object({
    kitchenName: z.string().trim().min(1, "Kitchen name is required"),
    phone: z.string().trim().min(10, "Valid phone number is required"),
    email: z.string().trim().email("Valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    contactTitle: z.string().trim().optional(),
    contactFirstName: z.string().trim().optional(),
    contactLastName: z.string().trim().optional(),
    contactEmail: z.string().trim().email("Valid contact email is required").optional(),
    contactPhone: z.string().trim().optional(),
});

export const validateCreateKitchen = (req: Request, res: Response, next: NextFunction) => {
    const result = createKitchenSchema.safeParse(req.body);

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
// ✏️ UPDATE SCHEMA
// ==============================
export const updateKitchenSchema = z.object({
    kitchenName: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(10).optional(),
    email: z.string().trim().email().optional(),
    password: z.string().min(6).optional(),
    contactTitle: z.string().trim().optional(),
    contactFirstName: z.string().trim().optional(),
    contactLastName: z.string().trim().optional(),
    contactEmail: z.string().trim().email().optional(),
    contactPhone: z.string().trim().optional(),
    status: z.nativeEnum(Status).optional()
}).refine((val) => Object.keys(val).length > 0, {
    message: "At least one field is required",
});

export const validateUpdateKitchen = (req: Request, res: Response, next: NextFunction) => {
    const result = updateKitchenSchema.safeParse(req.body);

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