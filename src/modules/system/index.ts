// src/modules/system/routes.ts

import { Router, Request, Response } from 'express';
// Assuming your folder structure is: src/modules/system/controller.ts
import * as SystemController from './controller';

const router: Router = Router();

/**
 * Public System Routes
 */
router.get('/hello', SystemController.getHello);
router.get('/health', SystemController.getHealth);
router.get('/info', SystemController.getSystemInfo);

// If you don't provide a path string, it automatically catches everything
// that hasn't been handled by the routes above.
router.use((req: Request, res: Response) => {
    res.status(404).json({ 
        status: false,
        error: 'Endpoint not found',
        requestedPath: req.originalUrl
    });
});

export default router;