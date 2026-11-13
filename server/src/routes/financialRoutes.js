import { Router } from 'express';
import {
  simulateFinancials,
  saveFinancialScenario,
  getStartupFinancialModels,
  deleteFinancialModel,
} from '../controllers/financialController.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.use(requireVerifiedEmail);

router.post('/simulate', simulateFinancials);
router.post('/:startupId', saveFinancialScenario);
router.get('/:startupId', getStartupFinancialModels);
router.delete('/:startupId/:modelId', deleteFinancialModel);

export default router;
