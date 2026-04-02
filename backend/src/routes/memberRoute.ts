import { Router } from 'express';
import { getMembers, createMember } from '../controllers/memberController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getMembers);
router.post('/', authMiddleware, createMember);

export default router;
