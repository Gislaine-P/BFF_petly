import { Router } from 'express';
import { 
  getMarcas, 
  postMarca, 
  putMarca, 
  deleteMarca 
} from '../controllers/marca.controller.js';
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

// Ruta Pública
router.get('/', getMarcas);

// Rutas Protegidas
router.post('/', authenticateToken, requireRole('admin'), postMarca);
router.put('/:id', authenticateToken, requireRole('admin'), putMarca);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteMarca);

export default router;