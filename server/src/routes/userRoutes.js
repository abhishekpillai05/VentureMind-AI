import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  changePassword,
  deleteAccount,
} from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import {
  updateProfileSchema,
  updatePreferencesSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from '../validators/userValidator.js';

const router = Router();

// Protect all user routes with JWT authentication
router.use(requireAuth);

router.get('/profile', getProfile);
router.put('/profile', validateRequest(updateProfileSchema), updateProfile);

router.get('/preferences', getPreferences);
router.put('/preferences', validateRequest(updatePreferencesSchema), updatePreferences);

router.put('/password', validateRequest(changePasswordSchema), changePassword);

router.delete('/account', validateRequest(deleteAccountSchema), deleteAccount);

export default router;
