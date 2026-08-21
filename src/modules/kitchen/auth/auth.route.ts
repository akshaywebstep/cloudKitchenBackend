// src/modules/admin/auth/index.ts

import { Router } from 'express';
import multer from 'multer';
import * as AuthController from './auth.controller';
import { verifyToken } from './auth.middleware';
import {
    validateLogin,
    validateRegister,
    validateForgotPassword,
    validateResetPassword
} from './auth.validation';

const router = Router({
    mergeParams: true
});

const upload = multer({ dest: 'uploads/' });

// POST /api/v1/kitchen/auth/register
// validateRegister runs before the controller — catches bad body early (before file parsing overhead isn't an issue with multer)
router.post(
    '/register',
    upload.any(),          // parse multipart first so req.body is populated
    validateRegister,      // then validate the parsed body fields
    AuthController.register
);

// POST /api/v1/kitchen/auth/login
router.post(
    '/login',
    validateLogin,         // validate before hitting the DB
    AuthController.login
);

// GET /api/v1/kitchen/auth/verify
router.get('/verify', verifyToken(), (req, res) => {
    res.status(200).json({
        status: true,
        message: 'Token is valid',
        kitchen: (req as any).kitchen,
    });
});

// POST /api/v1/kitchen/auth/forgot-password (request reset link)
router.post(
    '/forgot-password',
    validateForgotPassword,
    AuthController.forgotPasswordRequest
);


// POST /api/v1/kitchen/auth/reset-password (submit new password)
router.post(
    '/reset-password',
    validateResetPassword,
    AuthController.resetPassword
);

export default router;