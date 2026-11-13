import { Router } from 'express';
import {
  analyzeStartupIdea,
  getLatestValidation,
  getValidationHistory,
  getValidationById,
} from '../controllers/validatorController.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/authMiddleware.js';

const router = Router();

// All validation routes require authentication AND email verification
router.use(requireAuth);
router.use(requireVerifiedEmail);

router.post('/:startupId', analyzeStartupIdea);
router.get('/:startupId', getLatestValidation);
router.get('/:startupId/history', getValidationHistory);
router.get('/:startupId/:validationId', getValidationById);

export default router;
