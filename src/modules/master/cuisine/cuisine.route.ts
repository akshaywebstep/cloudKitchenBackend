import { Router } from 'express';
import * as CuisineController from './cuisine.controller';
import { validateGetCuisines } from './cuisine.validation';

const router = Router({
    mergeParams: true
});

// 📌 Get All cuisines
// GET /api/v1/kitchen/branch
router.get(
    '/',
    validateGetCuisines,
    CuisineController.getCuisines
);
export default router;