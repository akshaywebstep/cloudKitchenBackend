import bcrypt from 'bcrypt';
import DebugHelper from '../../../core/helpers/debug';
import { UserType, Status } from '../../../../prisma/generated/prisma/client';
import kitchenRepo from './kitchen.repository';

// =====================================================
// ✅ CREATE KITCHEN
// =====================================================
export const createKitchen = async (data: {
    profilePicture?: string;
    kitchenName: string;
    phone: string;
    email: string;
    password: string;
    contactTitle?: string;
    contactFirstName?: string;
    contactLastName?: string;
    contactEmail?: string;
    contactPhone?: string;
}) => {
    try {
        const emailExists = await kitchenRepo.findFirst({ where: { email: data.email } });
        if (emailExists.status) {
            return { status: false, message: 'Email already in use' };
        }

        const phoneExists = await kitchenRepo.findFirst({ where: { phone: data.phone } });
        if (phoneExists.status) {
            return { status: false, message: 'Phone already in use' };
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const result = await kitchenRepo.create({
            profilePicture: data.profilePicture,
            kitchenName: data.kitchenName,
            phone: data.phone,
            email: data.email,
            password: hashedPassword,
            contactTitle: data.contactTitle,
            contactFirstName: data.contactFirstName,
            contactLastName: data.contactLastName,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            userType: UserType.KITCHEN,
            status: Status.ACTIVE
        });

        if (!result.status) {
            return { status: false, message: result.message };
        }

        const { password, ...safeData } = result.data;

        return { status: true, data: safeData, message: 'Kitchen created successfully' };
    } catch (error: any) {
        DebugHelper.debugError('[Kitchen Service] createKitchen failed:', error);
        return { status: false, message: error.message || 'Failed to create kitchen' };
    }
};

// =====================================================
// 📄 GET ALL KITCHENS
// =====================================================
export const getKitchens = async (params: {
    page: number;
    limit: number;
    filters: {
        kitchenName?: string;
        status?: Status;
    };
}) => {
    try {
        const { page, limit, filters } = params;
        const skip = (page - 1) * limit;

        const where: any = { userType: UserType.KITCHEN };

        if (filters.kitchenName) {
            where.kitchenName = { contains: filters.kitchenName.trim() };
        }

        if (filters.status) {
            where.status = filters.status;
        }

        const [dataRes, filteredCountRes, totalCountRes] = await Promise.all([
            kitchenRepo.findMany({
                where,
                skip,
                take: limit,
                orderBy: { id: 'desc' }
            }),
            kitchenRepo.count({ where }),
            kitchenRepo.count({ where: { userType: UserType.KITCHEN } })
        ]);

        const data = (dataRes.data || []).map((u: any) => {
            const { password, ...safe } = u;
            return safe;
        });
        const filtered = filteredCountRes.data || 0;
        const total = totalCountRes.data || 0;
        const totalPages = Math.ceil(filtered / limit);

        return {
            status: true,
            data,
            meta: {
                page, limit, total, filtered,
                count: data.length,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    } catch (error: any) {
        DebugHelper.debugError(`[Kitchen Service] getKitchens failed: ${error.message}`);
        return { status: false, message: error.message || 'Failed to fetch kitchens', data: [], meta: null };
    }
};

// =====================================================
// 📄 GET SINGLE KITCHEN
// =====================================================
export const getKitchenById = async (id: number) => {
    try {
        const result = await kitchenRepo.findUnique({ where: { id } });
        if (!result.status) return { status: false, message: result.message };

        const { password, ...safeData } = result.data;
        return { status: true, data: safeData, message: 'Kitchen fetched successfully' };
    } catch (error: any) {
        return { status: false, message: error.message || 'Failed to fetch kitchen' };
    }
};

// =====================================================
// ✏️ UPDATE KITCHEN
// =====================================================
export const updateKitchen = async (
    id: number,
    data: {
        profilePicture?: string;
        kitchenName?: string;
        phone?: string;
        email?: string;
        password?: string;
        contactTitle?: string;
        contactFirstName?: string;
        contactLastName?: string;
        contactEmail?: string;
        contactPhone?: string;
        status?: Status;
    }
) => {
    try {
        const existing = await kitchenRepo.findUnique({ where: { id } });
        if (!existing.status) return { status: false, message: 'Kitchen not found' };

        if (data.email) {
            const emailClash = await kitchenRepo.findFirst({ where: { email: data.email, NOT: { id } } });
            if (emailClash.status) return { status: false, message: 'Another kitchen with this email already exists' };
        }

        if (data.phone) {
            const phoneClash = await kitchenRepo.findFirst({ where: { phone: data.phone, NOT: { id } } });
            if (phoneClash.status) return { status: false, message: 'Another kitchen with this phone already exists' };
        }

        let hashedPassword: string | undefined;
        if (data.password) {
            hashedPassword = await bcrypt.hash(data.password, 10);
        }

        const result = await kitchenRepo.update(id, {
            ...(data.profilePicture !== undefined ? { profilePicture: data.profilePicture } : {}),
            ...(data.kitchenName ? { kitchenName: data.kitchenName } : {}),
            ...(data.phone ? { phone: data.phone } : {}),
            ...(data.email ? { email: data.email } : {}),
            ...(hashedPassword ? { password: hashedPassword } : {}),
            ...(data.contactTitle !== undefined ? { contactTitle: data.contactTitle } : {}),
            ...(data.contactFirstName !== undefined ? { contactFirstName: data.contactFirstName } : {}),
            ...(data.contactLastName !== undefined ? { contactLastName: data.contactLastName } : {}),
            ...(data.contactEmail !== undefined ? { contactEmail: data.contactEmail } : {}),
            ...(data.contactPhone !== undefined ? { contactPhone: data.contactPhone } : {}),
            ...(data.status ? { status: data.status } : {})
        });

        if (!result.status) return { status: false, message: result.message };

        const { password, ...safeData } = result.data;
        return { status: true, data: safeData, message: 'Kitchen updated successfully' };
    } catch (error: any) {
        return { status: false, message: error.message || 'Failed to update kitchen' };
    }
};

// =====================================================
// 🗑️ DELETE KITCHEN
// =====================================================
export const deleteKitchen = async (id: number) => {
    try {
        const existing = await kitchenRepo.findUnique({ where: { id } });
        if (!existing.status) return { status: false, message: 'Kitchen not found' };

        const result = await kitchenRepo.delete({ id });
        if (!result.status) return { status: false, message: result.message };

        return { status: true, data: result.data, message: 'Kitchen deleted successfully' };
    } catch (error: any) {
        return { status: false, message: error.message || 'Failed to delete kitchen' };
    }
};