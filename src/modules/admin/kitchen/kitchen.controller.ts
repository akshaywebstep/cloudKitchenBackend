// src/modules/admin/kitchen/kitchen.controller.ts
import { Request, Response } from 'express';
import * as KitchenAuthService from '../../kitchen/auth/auth.service'; // 🔹 reusing original Kitchen service, not duplicating logic
import debugHelper from '../../../core/helpers/debug';
import { saveFile } from '../../../core/helpers/file.helper';

export const createKitchen = async (req: Request, res: Response) => {
    debugHelper.debug('=== [Admin] CREATE KITCHEN START ===');

    try {
        const request = req as Request & {
            files?: Express.Multer.File[];
        };

        debugHelper.debug("Body:", request.body);
        debugHelper.debug("Files:", request.files?.map(f => ({ fieldname: f.fieldname, originalname: f.originalname })) || "No files");

        const { kitchenName, phone, email, password, contactTitle, contactFirstName, contactLastName, contactEmail, contactPhone } = request.body;

        const errors: Record<string, string> = {};

        // --- Validate files ---
        const allowedFiles = [{ fieldname: "profilePicture", required: true }];
        const filesToSave: Record<string, Express.Multer.File[]> = {};

        for (const fileDef of allowedFiles) {
            const filesForField = request.files?.filter(f => f.fieldname === fileDef.fieldname) || [];
            if (fileDef.required && filesForField.length === 0) {
                errors[fileDef.fieldname] = `${fileDef.fieldname.charAt(0).toUpperCase() + fileDef.fieldname.slice(1)} file is required`;
                debugHelper.debugWarn(errors[fileDef.fieldname]);
            } else if (filesForField.length > 0) {
                filesToSave[fileDef.fieldname] = filesForField;
                debugHelper.debug(`Files ready for saving for '${fileDef.fieldname}':`, filesForField.map(f => f.originalname));
            }
        }

        // --- Availability check (email/phone already used) ---
        if (email || phone) {
            const [emailCheck, phoneCheck] = await Promise.all([
                email
                    ? KitchenAuthService.checkUserAvailability(email)
                    : Promise.resolve({ available: true, message: "", field: null }),

                phone
                    ? KitchenAuthService.checkUserAvailability(phone)
                    : Promise.resolve({ available: true, message: "", field: null }),
            ]);

            if (!emailCheck.available) {
                errors.email = emailCheck.message;
            }

            if (!phoneCheck.available) {
                errors.phone = phoneCheck.message;
            }
        }

        if (Object.keys(errors).length > 0) {
            debugHelper.debugWarn("[Admin Create Kitchen] Validation failed. Errors:", errors);
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                errors
            });
        }

        // --- Save files ---
        const uploadedFiles: Record<string, string> = {};
        for (const fieldname of Object.keys(filesToSave)) {
            for (const file of filesToSave[fieldname]) {
                debugHelper.debug(`Saving file '${file.originalname}' for field '${fieldname}'...`);
                const savedPath = await saveFile(file, {
                    destination: `uploads/${fieldname}`,
                    name: `brand-${fieldname}`,
                    unique: true
                });
                uploadedFiles[fieldname] = savedPath;
                debugHelper.debug(`File saved: ${savedPath}`);
            }
        }

        // --- Create Kitchen (reusing the original Kitchen module service) ---
        debugHelper.debug('[Admin Create Kitchen] Calling KitchenAuthService.createKitchen...');
        const result = await KitchenAuthService.createKitchen({
            profilePicture: uploadedFiles.profilePicture,
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
            return res.status(400).json({
                status: false,
                message: result.message
            });
        }

        res.status(201).json({
            status: true,
            message: "Kitchen created successfully by Admin",
            data: result.data
        });

    } catch (error: any) {
        debugHelper.debugError("❌ [Admin Create Kitchen] Controller Error:", error);
        return res.status(500).json({
            status: false,
            message: error.message || "Internal server error"
        });
    } finally {
        debugHelper.debug("=== [Admin] CREATE KITCHEN END ===");
    }
};