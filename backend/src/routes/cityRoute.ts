import { Router } from 'express';
import { getCities, createCity, deleteCity } from '../controllers/cityController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getCities);
router.post('/', createCity);
router.delete('/:id', deleteCity);

export default router;
