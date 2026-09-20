import { Router } from 'express';
import { 
  deleteCategoria, 
  getCategorias, 
  postCategoria, 
  putCategoria 
} from '../controllers/categoria.controller.js';
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

// Ruta Pública
router.get('/', getCategorias);

// Rutas Protegidass
router.post('/', authenticateToken, requireRole('admin'), postCategoria);
router.put('/:id', authenticateToken, requireRole('admin'), putCategoria);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteCategoria);

export default router;