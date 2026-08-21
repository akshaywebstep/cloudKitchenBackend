import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Status } from '../../../../prisma/generated/prisma/client';

// ==============================
// 🧾 CREATE SCHEMA
// ==============================
export const createMenuCategorySchema = z.object({
    name: z.string().trim().min(1, "Category name is required"),
    image: z.string().url("Image must be a valid URL").optional(),
    parentId: z.coerce.number().positive().optional(),
    status: z.nativeEnum(Status).optional()
});

export const validateCreateMenuCategory = (req: Request, res: Response, next: NextFunction) => {
    const result = createMenuCategorySchema.safeParse(req.body);

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
export const updateMenuCategorySchema = z.object({
    name: z.string().trim().min(1).optional(),
    image: z.string().trim().optional().transform((val) => val || undefined),
    parentId: z.coerce.number().positive().nullable().optional(),
    status: z.nativeEnum(Status).optional()
}).refine((val) => Object.keys(val).length > 0, {
    message: "At least one field is required",
});

export const validateUpdateMenuCategory = (req: Request, res: Response, next: NextFunction) => {
    const result = updateMenuCategorySchema.safeParse(req.body);

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