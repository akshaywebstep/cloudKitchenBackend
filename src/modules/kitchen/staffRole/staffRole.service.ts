import * as StaffRoleRepository from './staffRole.repository';
import debugHelper from '../../../core/helpers/debug';

export const createKitchenRole = async (userIdVal: any, name: string) => {
    debugHelper.debug('⚙️ [SERVICE] Creating kitchen role:', { userIdVal, name });

    const userId = typeof userIdVal === 'bigint' ? userIdVal : BigInt(userIdVal);

    // Same kitchen ke andar duplicate check
    const existing = await StaffRoleRepository.findRoleByName(userId, name);
    if (existing) {
        throw new Error('Role with this name already exists');
    }

    return await StaffRoleRepository.createRole(userId, name);
};

export const getKitchenStaffMembers = async (kitchenOwnerIdVal: any) => {
    debugHelper.debug('⚙️ [SERVICE] Received kitchenOwnerId:', kitchenOwnerIdVal);
    const kitchenOwnerId = typeof kitchenOwnerIdVal === 'bigint' ? kitchenOwnerIdVal : BigInt(kitchenOwnerIdVal);
    return await StaffRoleRepository.findKitchenStaffMembers(kitchenOwnerId);
};

export const getRolePermissionsOverview = async (roleIdVal: any) => {
    debugHelper.debug('⚙️ [SERVICE] Fetching permission overview for roleId:', roleIdVal);
    const roleId = typeof roleIdVal === 'bigint' ? roleIdVal : BigInt(roleIdVal);
    return await StaffRoleRepository.getRolePermissionsOverview(roleId);
};

export const updateRolePermissions = async (roleIdVal: any, permissionIdStrs: string[]) => {
    debugHelper.debug('⚙️ [SERVICE] Updating role permissions:', { roleIdVal, permissionIdStrs });
    const roleId = typeof roleIdVal === 'bigint' ? roleIdVal : BigInt(roleIdVal);
    const permissionIds = permissionIdStrs.map((id) => BigInt(id));

    return await StaffRoleRepository.updateRolePermissions(roleId, permissionIds);
};