const { Router } = require('express');
const { 
  postPedido, 
  confirmarPago, 
  getPedidosPorUsuario, 
  getPedidoPorId, 
  retornoWebpay 
} = require('../controllers/pedido.controller.js');
const { authenticateToken } = require('../middlewares/auth.middleware.js');

const router = Router();

// Endpoint invocado desde el Checkout del frontend
router.post('/iniciar-pago', authenticateToken, postPedido);
router.post('/', postPedido); // Mantener por compatibilidad

// Confirmación de pago desde Webpay
router.post('/confirmar-pago', confirmarPago);

// Retorno desde Webpay (Acepta GET y POST sin middleware de autenticación)
router.all('/retorno-webpay', retornoWebpay);

// Consultas
router.get('/usuario/:idUsuario', getPedidosPorUsuario);
router.get('/id', getPedidoPorId);

module.exports = router;