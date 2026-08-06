// src/modules/admin/onboarding/index.ts

import { Router } from 'express';
import * as OnboardingController from './onboarding.controller';
import { verifyToken } from '../auth/auth.middleware';
import { validateOnboarding } from './onboarding.validation';
import multer from 'multer';

const router = Router({
    mergeParams: true
});
const upload = multer({ dest: 'uploads/' });

// POST /api/v1/admin/onboarding
router.post(
  '/',
  verifyToken(),      // only logged-in user
  upload.any(),       // FSSAI/GST file upload
  validateOnboarding, // validate body
  OnboardingController.completeOnboarding
);

export default router;