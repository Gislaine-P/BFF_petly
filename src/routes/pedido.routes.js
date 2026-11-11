import { Router } from 'express';
import { 
  postPedido,
  confirmarPago,
  retornoWebpay,
  getPedidosPorUsuario, 
  getPedidoPorId 
} from '../controllers/pedido.controller.js';

const router = Router();

router.post('/', postPedido);
router.post('/confirmar-pago',confirmarPago);
router.post('/retorno-webpay', retornoWebpay);
router.get('/usuario/:idUsuario', getPedidosPorUsuario);
router.get('/:id', getPedidoPorId);

export default router;