import { Router } from 'express';
import { createDrive, getDrives, deleteDrive } from '../controllers/driveController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createDrive);
router.get('/', getDrives);
router.delete('/:id', deleteDrive);


export default router;
