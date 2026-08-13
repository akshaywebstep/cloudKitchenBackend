import * as StaffRoleRepository from './staffRole.repository';
import debugHelper from '../../../core/helpers/debug';

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