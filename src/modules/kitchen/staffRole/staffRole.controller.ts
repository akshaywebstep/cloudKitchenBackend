import { Request, Response } from 'express';
import * as StaffRoleService from './staffRole.service';
import debugHelper from '../../../core/helpers/debug';
import stringHelper from '../../../core/helpers/string.helper';

// 📄 GET ALL KITCHEN STAFF
export const getKitchenStaff = async (req: Request, res: Response) => {
    debugHelper.debug('=== GET KITCHEN STAFF START ===');

    try {
        const request = req as Request & {
            admin?: { id: number | bigint };
            kitchen?: { id: number | bigint };
            user?: { id: number | bigint };
        };

        const userId = request.kitchen?.id ?? request.user?.id ?? request.admin?.id;

        if (!userId) {
            debugHelper.debugError('[StaffRole Controller] ❌ userId not found in request');
            return res.status(401).json({ status: false, message: 'Unauthorized: user not found in request' });
        }

        const result = await StaffRoleService.getKitchenStaffMembers(userId);
        const cleanData = stringHelper.convertBigInt(result);

        return res.status(200).json({
            status: true,
            message: 'Kitchen staff fetched successfully',
            data: cleanData
        });
    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    } finally {
        debugHelper.debug('=== GET KITCHEN STAFF END ===');
    }
};

// 🔑 GET ROLE PERMISSIONS OVERVIEW (Assigned vs Unassigned)
export const getRolePermissionsOverview = async (req: Request, res: Response) => {
    debugHelper.debug('=== GET ROLE PERMISSIONS OVERVIEW START ===');

    try {
        const { roleId } = req.params;

        if (!roleId) {
            return res.status(400).json({ status: false, message: 'roleId param is required' });
        }

        const result = await StaffRoleService.getRolePermissionsOverview(roleId);
        const cleanData = stringHelper.convertBigInt(result);

        return res.status(200).json({
            status: true,
            message: 'Role permissions overview fetched successfully',
            data: cleanData
        });
    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    } finally {
        debugHelper.debug('=== GET ROLE PERMISSIONS OVERVIEW END ===');
    }
};

// 🔄 UPDATE ROLE PERMISSIONS
export const updateRolePermissions = async (req: Request, res: Response) => {
    debugHelper.debug('=== UPDATE ROLE PERMISSIONS START ===');

    try {
        const { roleId } = req.params;
        const { permissionIds } = req.body;

        if (!roleId) {
            return res.status(400).json({ status: false, message: 'roleId param is required' });
        }

        if (!permissionIds || !Array.isArray(permissionIds)) {
            return res.status(400).json({ status: false, message: 'permissionIds array is required' });
        }

        const result = await StaffRoleService.updateRolePermissions(roleId, permissionIds);
        const cleanData = stringHelper.convertBigInt(result);

        return res.status(200).json({
            status: true,
            message: 'Role permissions updated successfully',
            data: cleanData
        });
    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    } finally {
        debugHelper.debug('=== UPDATE ROLE PERMISSIONS END ===');
    }
};