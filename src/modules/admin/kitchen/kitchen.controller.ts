import { Request, Response } from 'express';
import * as KitchenService from './kitchen.service';
import debugHelper from '../../../core/helpers/debug';
import { saveFile } from '../../../core/helpers/file.helper';

// =====================================================
// ✅ CREATE KITCHEN
// =====================================================
export const createKitchen = async (req: Request, res: Response) => {
    debugHelper.debug('=== [Admin] CREATE KITCHEN START ===');

    try {
        const request = req as Request & { files?: Express.Multer.File[] };

        const {
            kitchenName, phone, email, password,
            contactTitle, contactFirstName, contactLastName,
            contactEmail, contactPhone
        } = request.body;

        const errors: Record<string, string> = {};

        const profilePictureFile = request.files?.find(f => f.fieldname === 'profilePicture');
        if (!profilePictureFile) {
            errors.profilePicture = 'Profile picture is required';
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ status: false, message: 'Validation failed', errors });
        }

        let savedPath: string | undefined;
        if (profilePictureFile) {
            savedPath = await saveFile(profilePictureFile, {
                destination: 'uploads/profilePicture',
                name: 'kitchen-profilePicture',
                unique: true
            });
        }

        const result = await KitchenService.createKitchen({
            profilePicture: savedPath,
            kitchenName,
            phone,
            email,
            password,
            contactTitle,
            contactFirstName,
            contactLastName,
            contactEmail,
            contactPhone
        });

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(201).json({
            status: true,
            message: 'Kitchen created successfully',
            data: result.data
        });
    } catch (error: any) {
        debugHelper.debugError('❌ [Admin Create Kitchen] Controller Error:', error);
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    } finally {
        debugHelper.debug('=== [Admin] CREATE KITCHEN END ===');
    }
};

// =====================================================
// 📄 GET ALL KITCHENS
// =====================================================
export const getKitchens = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, kitchenName, status } = req.query;

        const result = await KitchenService.getKitchens({
            page: Number(page),
            limit: Number(limit),
            filters: {
                kitchenName: kitchenName ? String(kitchenName) : undefined,
                status: status ? (String(status) as any) : undefined
            }
        });

        return res.status(200).json({
            status: true,
            message: 'Kitchens fetched successfully',
            data: result.data,
            meta: result.meta
        });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

// =====================================================
// 📄 GET SINGLE KITCHEN
// =====================================================
export const getKitchenById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await KitchenService.getKitchenById(id);

        if (!result.status) {
            return res.status(404).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};

// =====================================================
// ✏️ UPDATE KITCHEN
// =====================================================
export const updateKitchen = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const request = req as Request & { files?: Express.Multer.File[] };

        const profilePictureFile = request.files?.find(f => f.fieldname === 'profilePicture');
        let savedPath: string | undefined;

        if (profilePictureFile) {
            savedPath = await saveFile(profilePictureFile, {
                destination: 'uploads/profilePicture',
                name: 'kitchen-profilePicture',
                unique: true
            });
        }

        const result = await KitchenService.updateKitchen(id, {
            ...request.body,
            ...(savedPath ? { profilePicture: savedPath } : {})
        });

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};

// =====================================================
// 🗑️ DELETE KITCHEN
// =====================================================
export const deleteKitchen = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await KitchenService.deleteKitchen(id);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};