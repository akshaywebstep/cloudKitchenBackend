import { Request, Response } from 'express';
import * as OnboardingService from './onboarding.service';
import debugHelper from '../../../core/helpers/debug';
import { saveFile } from '../../../core/helpers/file.helper';

export const completeOnboarding = async (req: Request, res: Response) => {
    debugHelper.debug(`=== CREATE BRAND START ===`);

    try {
        const request = req as Request & {
            files?: Express.Multer.File[];
            kitchen: {
                id: number;
            }
        };

        const kitchenId = request.kitchen.id;

        debugHelper.debug("Body:", request.kitchen);
        debugHelper.debug("Body:", request.body);
        debugHelper.debug(
            "Files:",
            request.files?.map(f => ({
                fieldname: f.fieldname,
                originalname: f.originalname
            })) || "No files"
        );

        // =============================
        // 🔹 Extract Fields
        // =============================
        const fssaiNumber = request.body.fssaiNumber;
        const gstNumberRaw = request.body.gstNumber;

        // normalize GST
        const gstNumber =
            gstNumberRaw && gstNumberRaw.trim() !== ""
                ? gstNumberRaw.trim()
                : undefined;

        const errors: Record<string, string> = {};

        // =============================
        // 🔹 File Handling Rules
        // =============================
        const files = request.files || [];

        const fssaiFiles = files.filter(f => f.fieldname === "fssaiFile");
        const gstFiles = files.filter(f => f.fieldname === "gstFile");

        // =============================
        // 🔹 VALIDATION
        // =============================

        // FSSAI required
        if (!fssaiNumber) {
            errors.fssaiNumber = "FSSAI number is required";
        }

        if (fssaiFiles.length === 0) {
            errors.fssaiFile = "FSSAI file is required";
        }

        // GST optional
        if (gstNumber) {
            // validate format (extra safety, even though Zod already did)
            const GST_REGEX =
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[0-9A-Z]{1}$/;

            if (!GST_REGEX.test(gstNumber)) {
                errors.gstNumber = "Invalid GST number format";
            }

            // file required ONLY if GST present
            if (gstFiles.length === 0) {
                errors.gstFile = "GST file is required when GST number is provided";
            }
        }

        // =============================
        // ❌ Return errors
        // =============================
        if (Object.keys(errors).length > 0) {
            debugHelper.debugWarn("Validation failed:", errors);

            return res.status(400).json({
                status: false,
                message: "Validation failed",
                errors
            });
        }

        // =============================
        // 💾 Save Files
        // =============================
        const uploadedFiles: Record<string, string> = {};

        // FSSAI
        if (fssaiFiles.length > 0) {
            const file = fssaiFiles[0];

            const savedPath = await saveFile(file, {
                destination: `uploads/fssai`,
                name: `fssai`,
                unique: true
            });

            uploadedFiles.fssaiFile = savedPath;
        }

        // GST (only if present)
        if (gstNumber && gstFiles.length > 0) {
            const file = gstFiles[0];

            const savedPath = await saveFile(file, {
                destination: `uploads/gst`,
                name: `gst`,
                unique: true
            });

            uploadedFiles.gstFile = savedPath;
        }

        // =============================
        // 🗄️ DB Call
        // =============================
        const result = await OnboardingService.completeOnboarding({
            kitchenId: BigInt(kitchenId),
            fssaiNumber,
            gstNumber,
            fssaiFile: uploadedFiles.fssaiFile,
            gstFile: uploadedFiles.gstFile
        });

        if (!result.status) {
            debugHelper.debugError("❌ Controller Error:", result.message);
            return res.status(500).json({
                status: false,
                message: result.message
            });
        }

        // =============================
        // ✅ Response
        // =============================
        return res.status(201).json({
            status: true,
            message: "Onboarding completed successfully"
        });

    } catch (error: any) {
        debugHelper.debugError("❌ Controller Error:", error);

        return res.status(500).json({
            status: false,
            message: error.message || "Internal server error"
        });

    } finally {
        debugHelper.debug("=== CREATE BRAND END ===");
    }
};