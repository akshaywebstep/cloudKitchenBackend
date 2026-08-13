import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Status } from '../../../../prisma/generated/prisma/client';

// ==============================
// 🧾 CREATE STAFF SCHEMA
// ==============================
export const createStaffSchema = z.object({
    title: z.string().optional(),
    firstName: z.string().min(1, "firstName is required"),
    lastName: z.string().optional(),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(1, "phone is required"),
    password: z.string().min(6, "password must be at least 6 characters"),
    roleId: z.coerce.number().positive("roleId is required"),
    branchIds: z.array(z.coerce.number().positive()).optional().default([]),
});

export const validateCreateStaff = (req: Request, res: Response, next: NextFunction) => {
    const result = createStaffSchema.safeParse(req.body);
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
// ✏️ UPDATE STAFF SCHEMA
// ==============================
export const updateStaffSchema = z.object({
    title: z.string().optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().min(1).optional(),
    roleId: z.coerce.number().positive().optional(),
    status: z.nativeEnum(Status).optional(),
    branchIds: z.array(z.coerce.number().positive()).optional(),
});

export const validateUpdateStaff = (req: Request, res: Response, next: NextFunction) => {
    const result = updateStaffSchema.safeParse(req.body);
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
// 🆔 PARAM SCHEMA
// ==============================
export const staffIdSchema = z.object({
    id: z.coerce.number().positive(),
});

export const validateStaffId = (req: Request, res: Response, next: NextFunction) => {
    const result = staffIdSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({ status: false, message: 'Invalid staff id' });
    }
    next();
};