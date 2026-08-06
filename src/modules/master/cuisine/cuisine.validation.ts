import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Status } from '../../../../prisma/generated/prisma/client';

// ==============================
// 🧾 QUERY SCHEMA
// ==============================
export const getCuisineQuerySchema = z.object({
    page: z.coerce.number().positive().default(1),

    limit: z.coerce.number().positive().max(50).default(10),

    name: z
        .string()
        .optional()
        .transform((val) => val ?? ''),

    category: z
        .string()
        .optional()
        .transform((val) => val ?? ''),

    status: z
        .nativeEnum(Status)
        .optional(),
});

// ==============================
// 🛡️ MIDDLEWARE
// ==============================
export const validateGetCuisines = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const result = getCuisineQuerySchema.safeParse(req.query);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation failed',
            errors: result.error.flatten().fieldErrors,
        });
    }

    // ✅ CORRECT WAY
    (req as any).validatedQuery = result.data;
    next();
};