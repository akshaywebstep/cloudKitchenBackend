import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// ==============================
// 🆕 CREATE KITCHEN ROLE SCHEMA
// ==============================
export const createRoleSchema = z.object({
  name: z.string().min(1, "name is required").trim(),
});

export const validateCreateRole = (req: Request, res: Response, next: NextFunction) => {
  const result = createRoleSchema.safeParse(req.body);
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
// 🆔 ROLE ID PARAM SCHEMA
// (getRolePermissionsOverview & updateRolePermissions ke liye)
// ==============================
export const roleIdParamSchema = z.object({
  roleId: z.coerce.number().positive("roleId must be a valid positive number"),
});

export const validateRoleIdParam = (req: Request, res: Response, next: NextFunction) => {
  const result = roleIdParamSchema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      status: false,
      message: 'Validation failed',
      errors: result.error.flatten().fieldErrors,
    });
  }
  next();
};

// ==============================
// 🔄 UPDATE ROLE PERMISSIONS SCHEMA
// ==============================
export const updateRolePermissionsSchema = z.object({
  permissionIds: z
    .array(z.coerce.number().positive())
    .min(0, "permissionIds must be an array"),
});

export const validateUpdateRolePermissions = (req: Request, res: Response, next: NextFunction) => {
  const result = updateRolePermissionsSchema.safeParse(req.body);
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