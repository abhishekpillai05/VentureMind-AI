import { Router } from 'express';
import { register, login, getMe, verifyEmail, resendOtp } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validate.js';
import { registerSchema, loginSchema, verifyEmailSchema, resendOtpSchema } from '../validators/authValidator.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/verify-email', validateRequest(verifyEmailSchema), verifyEmail);
router.post('/resend-otp', validateRequest(resendOtpSchema), resendOtp);
router.get('/me', requireAuth, getMe);

export default router;
