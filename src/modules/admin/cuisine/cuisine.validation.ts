import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Status } from '../../../../prisma/generated/prisma/client';

// ==============================
// 🧾 CREATE SCHEMA
// ==============================
export const createCuisineSchema = z.object({
    name: z.string().trim().min(1, "Cuisine name is required"),
    image: z.string().url("Image must be a valid URL").optional(),
    status: z.nativeEnum(Status).optional()
});

export const validateCreateCuisine = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const result = createCuisineSchema.safeParse(req.body);

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
export const updateCuisineSchema = z.object({
    name: z.string().trim().min(1, "Cuisine name is required").optional(),
    image: z.string().trim().optional().transform((val) => val || undefined),
    status: z.nativeEnum(Status).optional()
}).refine((val) => Object.keys(val).length > 0, {
    message: "At least one field is required",
});

export const validateUpdateCuisine = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const result = updateCuisineSchema.safeParse(req.body);

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