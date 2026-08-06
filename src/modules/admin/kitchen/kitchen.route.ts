// src/modules/admin/kitchen/kitchen.route.ts

import { Router } from 'express';
import multer from 'multer';
import * as KitchenController from './kitchen.controller';
import { verifyToken } from '../auth/auth.middleware';
import { validateCreateKitchen } from './kitchen.validation';

const router = Router({
    mergeParams: true
});

const upload = multer({ dest: 'uploads/' });

// POST /api/v1/admin/kitchen/create
// Only a logged-in Admin can create a Kitchen
router.post(
    '/create',
    verifyToken(),          // 🔹 must be a valid Admin
    upload.any(),           // parse multipart first so req.body is populated
    validateCreateKitchen,  // then validate the parsed body fields
    KitchenController.createKitchen
);

export default router;