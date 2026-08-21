import { Router } from 'express';
import * as StaffRoleController from './staffRole.controller';
import { verifyToken } from '../auth/auth.middleware';
import { checkPermission } from '../../../core/permission/permission.middleware';
import { Panel, Action } from '../../../../prisma/generated/prisma/client';
import {
    validateCreateRole,
    validateRoleIdParam,
    validateUpdateRolePermissions
} from './staffRole.validation';

const router = Router({ mergeParams: true });

// 📌 4. Create new KITCHEN role (scoped to logged-in kitchen owner)
// POST /api/v1/kitchen/staffRole/role
router.post(
    '/role',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    validateCreateRole,
    // checkPermission({
    //     panel: Panel.KITCHEN,
    //     module: 'role',
    //     action: Action.CREATE
    // }),
    StaffRoleController.createKitchenRole
);

// 📌 1. Get all KITCHEN_STAFF list
// GET /api/v1/kitchen/staffRole/staff
router.get(
    '/',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    // checkPermission({
    //     panel: Panel.KITCHEN,
    //     module: 'role',
    //     action: Action.VIEW
    // }),
    StaffRoleController.getKitchenStaff
);

// 📌 2. Get assigned & unassigned permissions for a specific role
// GET /api/v1/kitchen/staffRole/role/:roleId/permissions
router.get(
    '/role/:roleId/permissions',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    // checkPermission({
    //     panel: Panel.KITCHEN,
    //     module: 'role',
    //     action: Action.VIEW
    // }),
    StaffRoleController.getRolePermissionsOverview
);


// 📌 3. Update Role Permissions
// PUT /api/v1/kitchen/staffRole/role/:roleId/permissions
router.put(
    '/role/:roleId/permissions',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    // checkPermission({
    //     panel: Panel.KITCHEN,
    //     module: 'role',
    //     action: Action.UPDATE
    // }),
    StaffRoleController.updateRolePermissions
);

export default router;