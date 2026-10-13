import { Router } from 'express';
import { 
  postPedido, 
  getPedidosPorUsuario, 
  getPedidoPorId 
} from '../controllers/pedido.controller.js';

const router = Router();

router.post('/', postPedido);
router.get('/usuario/:idUsuario', getPedidosPorUsuario);
router.get('/:id', getPedidoPorId);

export default router;