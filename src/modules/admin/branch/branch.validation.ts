import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Status } from '../../../../prisma/generated/prisma/client';

// ==============================
// 🧾 CREATE SCHEMA
// ==============================
export const createBranchSchema = z.object({
    userId: z.coerce.number().positive("Valid userId (kitchen) is required"),
    name: z.string().trim().min(1, "Branch name is required"),
    addressLine1: z.string().trim().min(1, "Address line 1 is required"),
    addressLine2: z.string().trim().optional(),
    landmark: z.string().trim().optional(),
    area: z.string().trim().optional(),
    pincode: z.string().trim().optional(),
    countryId: z.coerce.number().positive("Valid countryId is required"),
    stateId: z.coerce.number().positive("Valid stateId is required"),
    cityId: z.coerce.number().positive("Valid cityId is required"),
    contactTitle: z.string().trim().min(1, "Contact title is required"),
    contactFirstName: z.string().trim().min(1, "Contact first name is required"),
    contactLastName: z.string().trim().optional(),
    contactEmail: z.string().trim().email("Valid contact email is required"),
    contactPhone: z.string().trim().min(10, "Valid contact phone is required"),
    status: z.nativeEnum(Status).optional(),
    cuisines: z
        .array(
            z.object({
                id: z.coerce.number().positive().optional(),
                name: z.string().trim().min(1).optional()
            })
        )
        .optional()
});

export const validateCreateBranch = (req: Request, res: Response, next: NextFunction) => {
    const result = createBranchSchema.safeParse(req.body);

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
export const updateBranchSchema = z.object({
    name: z.string().trim().min(1).optional(),
    addressLine1: z.string().trim().min(1).optional(),
    addressLine2: z.string().trim().optional(),
    landmark: z.string().trim().optional(),
    area: z.string().trim().optional(),
    pincode: z.string().trim().optional(),
    countryId: z.coerce.number().positive().optional(),
    stateId: z.coerce.number().positive().optional(),
    cityId: z.coerce.number().positive().optional(),
    contactTitle: z.string().trim().min(1).optional(),
    contactFirstName: z.string().trim().min(1).optional(),
    contactLastName: z.string().trim().optional(),
    contactEmail: z.string().trim().email().optional(),
    contactPhone: z.string().trim().min(10).optional(),
    status: z.nativeEnum(Status).optional(),

    cuisines: z
        .array(
            z.object({
                id: z.coerce.number().positive().optional(),
                name: z.string().trim().min(1).optional()
            })
        )
        .optional()
}).refine((val) => Object.keys(val).length > 0, {
    message: "At least one field is required",
});

export const validateUpdateBranch = (req: Request, res: Response, next: NextFunction) => {
    const result = updateBranchSchema.safeParse(req.body);

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