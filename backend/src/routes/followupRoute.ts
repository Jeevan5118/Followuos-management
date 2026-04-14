import { Router } from 'express';
import { getFollowups, getFollowupsByCollegeId, createFollowup } from '../controllers/followupController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getFollowups);
router.post('/', createFollowup);
router.get('/college/:collegeId', getFollowupsByCollegeId);

export default router;
