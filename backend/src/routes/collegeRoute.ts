import { Router } from 'express';
import { getColleges, getCollegeById, createCollege, deleteCollege } from '../controllers/collegeController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getColleges);
router.post('/', createCollege);
router.get('/:id', getCollegeById);
router.delete('/:id', deleteCollege);

export default router;
