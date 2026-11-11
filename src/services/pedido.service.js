import transbank from 'transbank-sdk';

const { WebpayPlus, Options, IntegrationCommerceCodes, IntegrationApiKeys, Environment } = transbank;
const MS_PEDIDOS_URL = process.env.MS_PEDIDOS_URL || 'http://10.0.133.67:8084/api/pedido';
const WEBPAY_RETURN_URL = process.env.WEBPAY_RETURN_URL || 'https://3-222-252-115.sslip.io/ConfirmacionPago';

export const obtenerPedidoPorId = async (idPedido) => {
  const response = await fetch(`${MS_PEDIDOS_URL}/${idPedido}`);
  if (!response.ok) throw new Error('Error al obtener el pedido desde ms-pedidos');
  return await response.json();
};

export const obtenerPedidosPorUsuario = async (idUsuario) => {
  const response = await fetch(`${MS_PEDIDOS_URL}/usuario/${idUsuario}`);
  if (!response.ok) throw new Error('Error al obtener los pedidos del usuario desde ms-pedidos');
  return await response.json();
};

export const actualizarEstadoPedido = async (idPedido, estado) => {
  const response = await fetch(`${MS_PEDIDOS_URL}/${idPedido}/estado?estado=${estado}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Error al actualizar el estado del pedido en ms-pedidos');
  return await response.json();
};

export const crearPedido = async (datosPedido) => {
  const itemsList = datosPedido.items || datosPedido.detalles || datosPedido.productos || datosPedido.carrito;

  const payload = {
    ...datosPedido,
    items: itemsList,
    productos: itemsList,
    detalles: itemsList,
    permisoSag: datosPedido.permisoSag || datosPedido.datosEnvio?.permisoSag || null,
    estado: datosPedido.permisoSag ? 'PENDIENTE_VALIDACION_SAG' : (datosPedido.metodoPago === 'WEBPAY' ? 'PENDIENTE_PAGO' : 'PAGADO')
  };

  console.log("===> Enviando a ms-pedidos:", JSON.stringify(payload, null, 2));

  const response = await fetch(MS_PEDIDOS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  console.log(`<=== Respuesta ms-pedidos [${response.status}]:`, responseText);

  if (!response.ok) {
    throw new Error(`Error en ms-pedidos (${response.status}): ${responseText}`);
  }

  let pedidoGuardado;
  try {
    pedidoGuardado = JSON.parse(responseText);
  } catch (e) {
    throw new Error('La respuesta de ms-pedidos no es un JSON válido');
  }

  if (pedidoGuardado.estado === 'PENDIENTE_VALIDACION_SAG') {
    return {
      ...pedidoGuardado,
      mensaje: 'Pedido registrado con éxito. Pendiente de validación SAG.'
    };
  }

  const tx = new WebpayPlus.Transaction(
    new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
  );

  const buyOrder = `ORD-${pedidoGuardado.idPedido || pedidoGuardado.id || Date.now()}`;
  const sessionId = `SESS-${datosPedido.idUsuario || 'GUEST'}`;
  const amount = datosPedido.monto || datosPedido.montoTotal || pedidoGuardado.montoTotal || pedidoGuardado.monto;

  const responseWebpay = await tx.create(buyOrder, sessionId, amount, WEBPAY_RETURN_URL);

  return {
    ...pedidoGuardado,
    url: responseWebpay.url,
    token: responseWebpay.token,
    urlWebpay: responseWebpay.url,
    tokenWebpay: responseWebpay.token,
  };
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
