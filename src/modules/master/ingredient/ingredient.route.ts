import { Router } from 'express';
import * as IngredienteController from './ingredient.controller';
import { validateGetIngredientes } from './ingredient.validation';

const router = Router({
    mergeParams: true
});

// 📌 Get All ingredientes
// GET /api/v1/kitchen/branch
router.get(
    '/',
    validateGetIngredientes,
    IngredienteController.getIngredientes
);
export default router;