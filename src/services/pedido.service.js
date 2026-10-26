import axios from 'axios';
import { WebpayPlus } from 'transbank-sdk';

const MS_PEDIDOS_URL = process.env.MS_PEDIDOS_URL || 'http://10.0.133.67:8084/api/pedidos';

export const crearPedidoYIniciarPago = async (datosPedido) => {
  // 1. Guardar el pedido de forma interna en el microservicio Java
  const pedidoResponse = await axios.post(MS_PEDIDOS_URL, datosPedido);
  const pedidoCreado = pedidoResponse.data;

  // Si no es Webpay, simplemente retornamos el pedido (Ej: efectivo/transferencia)
  if (datosPedido.metodoPago !== 'WEBPAY') {
    return pedidoCreado;
  }

  // 2. Conectar a Transbank usando el SDK oficial
  const returnUrl = process.env.WEBPAY_RETURN_URL || 'https://3-222-252-115.sslip.io/api/pedidos/retorno-webpay';
  const buyOrder = pedidoCreado.idPedido.toString();
  const sessionId = `sesion_${pedidoCreado.idUsuario}`;
  const amount = pedidoCreado.montoTotal;

  try {
    // El SDK maneja automáticamente la petición HTTP y las credenciales de integración
    const transbankResponse = await WebpayPlus.Transaction.create(
      buyOrder,
      sessionId,
      amount,
      returnUrl
    );

    // 3. Devolver datos al frontend
    return {
      ...pedidoCreado,
      token_ws: transbankResponse.token,
      url_pago: transbankResponse.url
    };
  } catch (error) {
    console.error('Error SDK Transbank (Crear):', error);
    throw new Error('No se pudo iniciar el pago con la pasarela.');
  }
};

export const confirmarPagoWebpay = async (token, idPedido) => {
  try {
    // 1. El BFF confirma el pago directamente con el SDK de Transbank
    const txData = await WebpayPlus.Transaction.commit(token);

    // 2. Avisamos al microservicio Java (red interna) para que actualice el estado
    if (txData.response_code === 0 && txData.status === 'AUTHORIZED') {
      await axios.patch(`${MS_PEDIDOS_URL}/${idPedido}/estado?estado=PAGADO`);
      return { exito: true, transaccion: txData };
    } else {
      await axios.patch(`${MS_PEDIDOS_URL}/${idPedido}/estado?estado=CANCELADO`); 
      return { exito: false, transaccion: txData };
    }
  } catch (error) {
    console.error('Error SDK Transbank (Confirmar):', error);
    throw new Error('Error al confirmar el pago');
  }
};

export const obtenerPedidosPorUsuario = async (idUsuario) => {
  const response = await axios.get(`${MS_PEDIDOS_URL}/usuario/${idUsuario}`);
  return response.data;
};

export const obtenerPedidoPorId = async (id) => {
  const response = await axios.get(`${MS_PEDIDOS_URL}/${id}`);
  return response.data;
};