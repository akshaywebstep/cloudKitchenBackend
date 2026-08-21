import crypto from 'crypto';
import bcrypt from 'bcrypt';

import { Request, Response } from 'express';
import * as AuthService from './auth.service';
import debugHelper from '../../../core/helpers/debug';
import { saveFile } from '../../../core/helpers/file.helper';
import userRepo from '../../shared/user/user.repository';

export const login = async (req: Request, res: Response) => {
    debugHelper.debug('--- [Login Controller] Start ---');
    try {
        const { username, password } = req.body;
        debugHelper.debug(`[Login Controller] Attempting login for username: ${username}`);

        debugHelper.debug('[Login Controller] Calling AuthService.loginService...');
        const result = await AuthService.loginKitchen({
            username: username,
            password: password
        });

        if (!result.status) {
            return res.status(401).json({
                status: false,
                message: result.message
            });
        }

        debugHelper.debug('[Login Controller] Login successful, sending response.');
        res.status(200).json({
            status: true,
            message: "Login successful",
            data: result.data
        });
    } catch (error: any) {
        debugHelper.debugError(`[Login Controller] Exception caught: ${error.message}`);
        res.status(401).json({
            status: false,
            message: error.message || "Authentication failed"
        });
    } finally {
        debugHelper.debug('--- [Login Controller] End ---');
    }
};

export const register = async (req: Request, res: Response) => {
    debugHelper.debug(`=== CREATE BRAND START ===`);

    try {
        const request = req as Request & {
            files?: Express.Multer.File[];
        };

        // --- Step 0: Log incoming request ---
        debugHelper.debug("Body:", request.body);
        debugHelper.debug("Files:", request.files?.map(f => ({ fieldname: f.fieldname, originalname: f.originalname })) || "No files");

        // --- Step 1: Extract and validate fields ---
        const { kitchenName, phone, email, password, contactTitle, contactFirstName, contactLastName, contactEmail, contactPhone } = request.body;

        const errors: Record<string, string> = {};

        // --- Step 2: Validate files dynamically ---
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

        // --- Step 2.5: Validate fields ---
        const requiredFields = ['kitchenName', 'phone', 'email', 'password', 'contactTitle', 'contactFirstName', 'contactEmail', 'contactPhone'];
        for (const field of requiredFields) {
            if (!request.body[field]) {
                errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
                debugHelper.debugWarn(errors[field]);
            }
        }

        // --- Step 2.6: Availability Check ---
        if (email || phone) {

            const [emailCheck, phoneCheck] = await Promise.all([
                email
                    ? AuthService.checkUserAvailability(email)
                    : Promise.resolve({ available: true, message: "", field: null }),

                phone
                    ? AuthService.checkUserAvailability(phone)
                    : Promise.resolve({ available: true, message: "", field: null }),
            ]);

            if (!emailCheck.available) {
                errors.email = emailCheck.message;
            }

            if (!phoneCheck.available) {
                errors.phone = phoneCheck.message;
            }
        }

        // --- Step 3: Return validation errors if any ---
        if (Object.keys(errors).length > 0) {
            debugHelper.debugWarn("Validation failed. Errors:", errors);
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                errors
            });
        }

        // --- Step 5: Save files ---
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

        // --- Step 6: Prepare DB payload ---
        debugHelper.debug('[Register Controller] Calling AuthService.createKitchenService...');
        const result = await AuthService.createKitchen({
            profilePicture: uploadedFiles.profilePicture,
            kitchenName: kitchenName,
            phone: phone,
            email: email,
            password: password,
            contactTitle: contactTitle,
            contactFirstName: contactFirstName,
            contactLastName: contactLastName,
            contactEmail: contactEmail,
            contactPhone: contactPhone
        });

        if (!result.status) {
            return res.status(400).json({
                status: false,
                message: result.message
            });
        }

        res.status(201).json({
            status: true,
            message: "Kitchen created successfully"
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

export const forgotPasswordRequest = async (req: Request, res: Response) => {
    debugHelper.debug('--- [ForgotPassword] START ---');

    try {
        const { username } = req.body;

        debugHelper.debug('[ForgotPassword] Step 1: Input received', { username });

        // 🔹 Step 2: detect type
        let type: "username" | "email" | "phone";

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
        const isPhone = /^\+?[0-9]{7,15}$/.test(username);

        if (isEmail) type = "email";
        else if (isPhone) type = "phone";
        else type = "username";

        const allowedTypes = ["email", "phone"];
        if (!allowedTypes.includes(type)) {
            debugHelper.debugWarn('[ForgotPassword] Step 2 Failed: Invalid identifier type', { type });

            return res.status(400).json({
                status: false,
                message: "Invalid username. Must be a valid email or phone number."
            });
        }

        debugHelper.debug('[ForgotPassword] Step 2: Identifier type detected', { type });

        // 🔹 Step 3: fetch user
        const result = await AuthService.getUserByUsername(username, type);

        debugHelper.debug('[ForgotPassword] Step 3: User lookup result', {
            found: !!result?.data
        });

        if (!result.status || !result.data) {
            debugHelper.debugWarn('[ForgotPassword] Step 3 Failed: User not found');

            return res.status(404).json({
                status: false,
                message: "User does not exist"
            });
        }

        const user = result.data;

        // 🔹 Step 4: generate token
        const rawToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");

        const expiry = new Date(Date.now() + 1000 * 60 * 15);

        debugHelper.debug('[ForgotPassword] Step 4: Token generated', {
            expiresAt: expiry
        });

        // 🔹 Step 5: save token
        await userRepo.update(user.id, {
            resetPasswordToken: hashedToken,
            resetPasswordExpiresAt: expiry
        });

        debugHelper.debug('[ForgotPassword] Step 5: Token saved to DB', {
            userId: user.id
        });

        // 🔹 Step 6: create reset link
        const resetLink = `https://yourdomain.com/reset-password?token=${rawToken}`;

        debugHelper.debug('[ForgotPassword] Step 6: Reset link created', resetLink);

        // TODO: send email

        debugHelper.debug('[ForgotPassword] SUCCESS');

        return res.status(200).json({
            status: true,
            message: "A reset link has been sent.",
            data: {
                resetToken: rawToken,
                resetLink
            }
        });

    } catch (error: any) {
        debugHelper.debugError('[ForgotPassword] ERROR', {
            message: error.message
        });

        return res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    } finally {
        debugHelper.debug('--- [ForgotPassword] END ---');
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    debugHelper.debug('--- [ResetPassword] START ---');

    try {
        const { token, password } = req.body;

        debugHelper.debug('[ResetPassword] Step 1: Input received');

        if (!token || !password) {
            debugHelper.debugWarn('[ResetPassword] Step 1 Failed: Missing token or password');

            return res.status(400).json({
                status: false,
                message: "Token and password are required"
            });
        }

        // 🔹 Step 2: validate token & fetch user
        const result = await AuthService.getUserByResetToken(token);

        debugHelper.debug('[ResetPassword] Step 2: Token validation result', {
            valid: result.status
        });

        if (!result.status || !result.data) {
            debugHelper.debugWarn('[ResetPassword] Step 2 Failed: Invalid or expired token');

            return res.status(400).json({
                status: false,
                message: result.message
            });
        }

        const user = result.data;

        // 🔹 Step 3: hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        debugHelper.debug('[ResetPassword] Step 3: Password hashed');

        // 🔹 Step 4: update password
        await userRepo.update(user.id, {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpiresAt: null
        });

        debugHelper.debug('[ResetPassword] Step 4: Password updated & token cleared', {
            userId: user.id
        });

        debugHelper.debug('[ResetPassword] SUCCESS');

        return res.status(200).json({
            status: true,
            message: "Password reset successful"
        });

    } catch (error: any) {
        debugHelper.debugError('[ResetPassword] ERROR', {
            message: error.message
        });

        return res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    } finally {
        debugHelper.debug('--- [ResetPassword] END ---');
    }
};
