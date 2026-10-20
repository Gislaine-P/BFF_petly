import { Router } from 'express';
import { getColas, postCola, deleteCola } from '../controllers/sqsAdmin.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

router.get('/', authenticateToken, requireRole('admin'), getColas);
router.post('/', authenticateToken, requireRole('admin'), postCola);

/*router.get('/', getColas);
router.post('/', postCola);
*/
router.delete('/:queueName', authenticateToken, requireRole('admin'), deleteCola);

export default router;