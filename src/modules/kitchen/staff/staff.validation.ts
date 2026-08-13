import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Status } from '../../../../prisma/generated/prisma/client';

// =====================================================
// 🛠️ REUSABLE HELPER FOR FORM-DATA BRANCH IDS PARSING
// =====================================================
const preprocessBranchIds = z.preprocess((val) => {
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return val
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id) && id > 0);
    }
  }
  return val;
}, z.array(z.coerce.number().positive()).optional());

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

  // Handles string array, single string, or JSON array string like "[1, 3]"
  branchIds: preprocessBranchIds.default([]),
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

  // 👈 Fix: Postman form-data "[2]" string error ab resolved ho gaya hai
  branchIds: preprocessBranchIds,
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