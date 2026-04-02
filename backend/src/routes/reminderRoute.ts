import { Router } from 'express';
import { getReminders, createReminder, deleteReminder } from '../controllers/reminderController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', getReminders);
router.post('/', createReminder);
router.delete('/:id', deleteReminder);

export default router;
