// src/modules/admin/auth/auth.route.ts

import { Router } from 'express';
import * as AuthController from './auth.controller';
import { verifyToken, AuthRequest } from './auth.middleware';
import {
    validateLogin,
    validateForgotPassword,
    validateResetPassword
} from './auth.validation';

const router = Router({
    mergeParams: true
});

// POST /api/v1/admin/auth/login
router.post(
    '/login',
    validateLogin,
    AuthController.login
);

// GET /api/v1/admin/auth/verify
router.get('/verify', verifyToken(), (req: AuthRequest, res) => {
    res.status(200).json({
        status: true,
        message: 'Token is valid',
        admin: req.admin,
    });
});

// POST /api/v1/admin/auth/forgot-password (request reset link)
router.post(
    '/forgot-password',
    validateForgotPassword,
    AuthController.forgotPasswordRequest
);

// POST /api/v1/admin/auth/reset-password (submit new password)
router.post(
    '/reset-password',
    validateResetPassword,
    AuthController.resetPassword
);

export default router;