import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Status } from '../../../../prisma/generated/prisma/client';

// ==============================
// 🧾 CREATE SCHEMA
// ==============================
export const createIngredientSchema = z.object({
    name: z.string().trim().min(1, "Ingredient name is required"),
    category: z.string().trim().min(1, "Category is required"),
    image: z.string().url("Image must be a valid URL").optional(),
    status: z.nativeEnum(Status).optional()
});

export const validateCreateIngredient = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const result = createIngredientSchema.safeParse(req.body);

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
export const updateIngredientSchema = z.object({
    name: z.string().trim().min(1, "Ingredient name is required").optional(),
    category: z.string().trim().min(1, "Category is required").optional(),
    image: z.string().trim().optional().transform((val) => val || undefined),
    status: z.nativeEnum(Status).optional()
}).refine((val) => Object.keys(val).length > 0, {
    message: "At least one field is required",
});

export const validateUpdateIngredient = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const result = updateIngredientSchema.safeParse(req.body);

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