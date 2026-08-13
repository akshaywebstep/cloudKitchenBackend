import { Router } from 'express';
import * as StaffController from './staff.controller';
import { verifyToken } from '../auth/auth.middleware';
import {
    validateCreateStaff,
    validateUpdateStaff,
    validateStaffId
} from './staff.validation';
import { checkPermission } from '../../../core/permission/permission.middleware';
import { Panel, Action } from '../../../../prisma/generated/prisma/client';

const router = Router({ mergeParams: true });

// 📌 Create Staff (with branch access)
// POST /api/v1/kitchen/staff
router.post(
    '/',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    checkPermission({ panel: Panel.KITCHEN, module: "staff", action: Action.CREATE }),
    validateCreateStaff,
    StaffController.createStaff
);

// 📌 Get All Staff
// GET /api/v1/kitchen/staff
router.get(
    '/',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    checkPermission({ panel: Panel.KITCHEN, module: "staff", action: Action.VIEW }),
    StaffController.getStaff
);

// 📌 Get Single Staff
// GET /api/v1/kitchen/staff/:id
router.get(
    '/:id',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    checkPermission({ panel: Panel.KITCHEN, module: "staff", action: Action.VIEW }),
    validateStaffId,
    StaffController.getStaffById
);

// 📌 Update Staff (with branch access resync)
// PUT /api/v1/kitchen/staff/:id
router.put(
    '/:id',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    checkPermission({ panel: Panel.KITCHEN, module: "staff", action: Action.UPDATE }),
    validateStaffId,
    validateUpdateStaff,
    StaffController.updateStaff
);

// 📌 Delete Staff (soft delete)
// DELETE /api/v1/kitchen/staff/:id
router.delete(
    '/:id',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    checkPermission({ panel: Panel.KITCHEN, module: "staff", action: Action.DELETE }),
    validateStaffId,
    StaffController.deleteStaff
);

export default router;