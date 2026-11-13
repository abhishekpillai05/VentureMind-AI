import { Router } from 'express';
import {
  downloadPDFReport,
  getReportDataSummary,
} from '../controllers/reportController.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.use(requireVerifiedEmail);

router.get('/:startupId/summary', getReportDataSummary);
router.get('/:startupId/pdf', downloadPDFReport);

export default router;
