import { Router } from 'express';
import { getMembers, createMember, deleteMember } from '../controllers/memberController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getMembers);
router.post('/', authMiddleware, createMember);
router.delete('/:id', authMiddleware, deleteMember);

export default router;
