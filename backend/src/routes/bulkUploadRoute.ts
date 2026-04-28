import { Router } from 'express';
import { bulkUpload } from '../controllers/bulkUploadController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.post('/', bulkUpload);

export default router;
