import { Router } from 'express';
import {
  analyzeMarketResearch,
  getLatestMarketResearch,
  getMarketHistory,
} from '../controllers/marketController.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.use(requireVerifiedEmail);

router.post('/:startupId', analyzeMarketResearch);
router.get('/:startupId', getLatestMarketResearch);
router.get('/:startupId/history', getMarketHistory);

export default router;
