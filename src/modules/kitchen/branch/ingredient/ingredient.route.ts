import { Router } from 'express';
import * as IngredientController from './ingredient.controller';
import { verifyToken } from '../../auth/auth.middleware';
import { validateCreateIngredient, validateUpdateInventoryIngredient } from './ingredient.validation';
import stockRoutes from './stock/stock.route';

const router = Router({
    mergeParams: true
});

router.use('/stock', stockRoutes);

// 📌 Create Ingredient
// POST /api/v1/kitchen/branch/:branchId/ingredient
router.post(
    '/',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    validateCreateIngredient,
    IngredientController.CreateIngredient
);

// 📌 Get All Ingredients
// GET /api/v1/kitchen/branch/:branchId/ingredient
router.get(
    '/',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    IngredientController.getIngredients
);

router.put(
    '/:inventoryId',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    validateUpdateInventoryIngredient,
    IngredientController.updateInventoryIngredient
);

router.delete(
    '/:inventoryId',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    IngredientController.deleteInventoryIngredient
);


export default router;