import { Router } from 'express';
import { login, resetPassword, completeOnboarding } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/reset-password', resetPassword);
router.post('/complete-onboarding', authMiddleware, completeOnboarding);

export default router;
