import { Router } from 'express';
import {
  getPersonas,
  startSession,
  sendMessage,
  evaluateSession,
  getStartupSessions,
  getSessionDetails,
} from '../controllers/investorController.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.use(requireVerifiedEmail);

router.get('/personas', getPersonas);
router.post('/:startupId/start', startSession);
router.post('/:startupId/sessions/:sessionId/message', sendMessage);
router.post('/:startupId/sessions/:sessionId/evaluate', evaluateSession);
router.get('/:startupId/sessions', getStartupSessions);
router.get('/:startupId/sessions/:sessionId', getSessionDetails);

export default router;
