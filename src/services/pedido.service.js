import transbank from 'transbank-sdk';

const { WebpayPlus, Options, IntegrationCommerceCodes, IntegrationApiKeys, Environment } = transbank;
const MS_PEDIDOS_URL = process.env.MS_PEDIDOS_URL || 'http://localhost:8084/api/pedidos';//configuracion local que despues hay que cambiarlo
const WEBPAY_RETURN_URL = process.env.WEBPAY_RETURN_URL || 'http://localhost:5173/ConfirmacionPago';//configuracion local que despues hay que cambiarlo 

export const obtenerPedidoPorId = async (idPedido) => {
  const response = await fetch(`${MS_PEDIDOS_URL}/${idPedido}`);

  if (!response.ok) {
    throw new Error('Error al obtener el pedido desde ms-pedidos');
  }

  return await response.json();
};

export const obtenerPedidosPorUsuario = async (idUsuario) => {
  const response = await fetch(`${MS_PEDIDOS_URL}/usuario/${idUsuario}`);

  if (!response.ok) {
    throw new Error('Error al obtener los pedidos del usuario desde ms-pedidos');
  }

  return await response.json();
};

export const actualizarEstadoPedido = async (idPedido, estado) => {
  const response = await fetch(`${MS_PEDIDOS_URL}/${idPedido}/estado?estado=${estado}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Error al actualizar el estado del pedido en ms-pedidos');
  }

  return await response.json();
};

export const crearPedido = async (datosPedido) => {
  const payload = {
    ...datosPedido,
    estado: datosPedido.metodoPago === 'WEBPAY' ? 'PENDIENTE_PAGO' : 'PAGADO'
  };

  const response = await fetch(MS_PEDIDOS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || errorBody.error || 'Error al crear el pedido en ms-pedidos');
  }

  const pedidoGuardado = await response.json();

  if (pedidoGuardado.estado === 'PENDIENTE_VALIDACION_SAG') {
    return pedidoGuardado;
  }

  if (datosPedido.metodoPago === 'WEBPAY') {
    const tx = new WebpayPlus.Transaction(
      new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
    );

    const buyOrder = `ORD-${pedidoGuardado.idPedido}`;
    const sessionId = `SESS-${datosPedido.idUsuario}`;
    const amount = pedidoGuardado.montoTotal;

    // Se utiliza la constante WEBPAY_RETURN_URL definida arriba
    const responseWebpay = await tx.create(buyOrder, sessionId, amount, WEBPAY_RETURN_URL);

    return {
      ...pedidoGuardado,
      urlWebpay: responseWebpay.url,
      tokenWebpay: responseWebpay.token,
    };
  }

  return pedidoGuardado;
};

export const confirmarPagoWebpay = async (token, idPedido) => {
  const tx = new WebpayPlus.Transaction(
    new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
  );

  const responseCommit = await tx.commit(token);

  if (responseCommit.response_code === 0) {
    await actualizarEstadoPedido(idPedido, 'PAGADO');
  } else {
    await actualizarEstadoPedido(idPedido, 'RECHAZADO');
  }

  return responseCommit;
};