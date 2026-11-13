import { Router } from 'express';
import {
  getUserStartups,
  createNewStartup,
  getSingleStartup,
  updateStartup,
  deleteStartup,
} from '../controllers/startupController.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createStartupSchema,
  updateStartupSchema,
} from '../validators/startupValidator.js';

const router = Router();

// All startup routes require authentication AND email verification
router.use(requireAuth);
router.use(requireVerifiedEmail);

router.get('/', getUserStartups);
router.post('/', validateRequest(createStartupSchema), createNewStartup);
router.get('/:id', getSingleStartup);
router.put('/:id', validateRequest(updateStartupSchema), updateStartup);
router.delete('/:id', deleteStartup);

export default router;
