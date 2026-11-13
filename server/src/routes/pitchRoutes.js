import { Router } from 'express';
import {
  evaluatePitch,
  getLatestPitchEvaluation,
  getPitchHistory,
} from '../controllers/pitchController.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.use(requireVerifiedEmail);

router.post('/:startupId', evaluatePitch);
router.get('/:startupId', getLatestPitchEvaluation);
router.get('/:startupId/history', getPitchHistory);

export default router;
