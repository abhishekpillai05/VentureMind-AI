import { Router } from 'express';
import { getStartupReadiness } from '../controllers/readinessController.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.use(requireVerifiedEmail);

router.get('/:startupId', getStartupReadiness);

export default router;
