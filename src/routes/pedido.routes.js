import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { 
  postPedido,
  confirmarPago,
  retornoWebpay,
  getPedidosPorUsuario, 
  getPedidoPorId 
} from '../controllers/pedido.controller.js';

const router = Router();

router.post('/', authenticateToken, postPedido);
router.post('/iniciar-pago', authenticateToken, postPedido);
router.post('/confirmar-pago', authenticateToken, confirmarPago);
router.post('/retorno-webpay', retornoWebpay);
router.get('/usuario/:idUsuario', authenticateToken, getPedidosPorUsuario);
router.get('/:id', authenticateToken, getPedidoPorId);

export default router;