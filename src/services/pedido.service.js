import transbank from 'transbank-sdk';

const { WebpayPlus, Options, IntegrationCommerceCodes, IntegrationApiKeys, Environment } = transbank;
const MS_PEDIDOS_URL = process.env.MS_PEDIDOS_URL || 'http://ms-pedido:8084/api/pedidos';
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://3-222-252-115.sslip.io').replace(/\/$/, '');
const WEBPAY_RETURN_URL = process.env.WEBPAY_RETURN_URL || `${FRONTEND_URL}/ConfirmacionPago`;

export const obtenerPedidoPorId = async (idPedido) => {
  const response = await fetch(`${MS_PEDIDOS_URL}/${idPedido}`);
  if (!response.ok) throw new Error('Error al obtener el pedido desde ms-pedidos');
  return await response.json();
};

export const obtenerPedidosPorUsuario = async (idUsuario) => {
  const response = await fetch(`${MS_PEDIDOS_URL}/usuario/${encodeURIComponent(idUsuario)}`);
  if (!response.ok) throw new Error('Error al obtener los pedidos del usuario desde ms-pedidos');
  return await response.json();
};

export const obtenerPedidosPendientesSag = async () => {
  const response = await fetch(`${MS_PEDIDOS_URL}/pendientes-sag`);
  if (!response.ok) throw new Error('Error al obtener pedidos pendientes SAG desde ms-pedidos');
  return await response.json();
};

export const aprobarValidacionSag = async (idPedido) => {
  const response = await fetch(`${MS_PEDIDOS_URL}/${idPedido}/aprobar-sag`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Error al aprobar validación SAG del pedido en ms-pedidos');
  return await response.json();
};

export const obtenerPedidoPendienteUsuario = async (idUsuario, idPedido = null) => {
  const query = idPedido ? `?idPedido=${encodeURIComponent(idPedido)}` : '';
  const response = await fetch(
    `${MS_PEDIDOS_URL}/usuario/${encodeURIComponent(idUsuario)}/pendiente${query}`
  );
  if (response.status === 204 || response.status === 404) return null;
  if (!response.ok) throw new Error('Error al consultar el pedido pendiente desde ms-pedidos');
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const actualizarEstadoPedido = async (idPedido, estado) => {
  const response = await fetch(`${MS_PEDIDOS_URL}/${idPedido}/estado?estado=${estado}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Error al actualizar el estado del pedido en ms-pedidos');
  return await response.json();
};

export const iniciarPagoPedidoExistente = async (idPedido) => {
  const pedido = await obtenerPedidoPorId(idPedido);
  const idPedidoReal = pedido.idPedido || pedido.id || idPedido;
  const amount = Math.round(Number(pedido.montoTotal ?? pedido.monto ?? 0));

  if (!amount || amount <= 0) {
    throw new Error('El pedido no tiene un monto válido para iniciar el pago.');
  }

  const tx = new WebpayPlus.Transaction(
    new Options(
      IntegrationCommerceCodes.WEBPAY_PLUS,
      IntegrationApiKeys.WEBPAY,
      Environment.Integration
    )
  );

  const buyOrder = `ORD-${idPedidoReal}`;
  const sessionId = `SESS-${pedido.idUsuario || 'GUEST'}`;

  const separator = WEBPAY_RETURN_URL.includes('?') ? '&' : '?';
  const returnUrl = `${WEBPAY_RETURN_URL}${separator}idPedido=${encodeURIComponent(idPedidoReal)}`;

  const responseWebpay = await tx.create(buyOrder, sessionId, amount, returnUrl);

  return {
    ...pedido,
    idPedido: idPedidoReal,
    url: responseWebpay.url,
    token: responseWebpay.token,
    urlWebpay: responseWebpay.url,
    tokenWebpay: responseWebpay.token,
  };
};

export const crearPedido = async (datosPedido) => {
  const itemsList =
    datosPedido.items || datosPedido.detalles || datosPedido.productos || datosPedido.carrito;

  const payload = {
    ...datosPedido,
    items: itemsList,
    productos: itemsList,
    detalles: itemsList,
    permisoSag: datosPedido.permisoSag || datosPedido.datosEnvio?.permisoSag || null,
    estado: datosPedido.permisoSag
      ? 'PENDIENTE_VALIDACION_SAG'
      : datosPedido.metodoPago === 'WEBPAY'
      ? 'PENDIENTE_PAGO'
      : 'PAGADO',
  };

  console.log('===> Enviando a ms-pedidos:', JSON.stringify(payload, null, 2));

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
      mensaje: 'Pedido registrado con éxito. Pendiente de validación SAG.',
    };
  }

  const tx = new WebpayPlus.Transaction(
    new Options(
      IntegrationCommerceCodes.WEBPAY_PLUS,
      IntegrationApiKeys.WEBPAY,
      Environment.Integration
    )
  );

  const idPedidoCreado = pedidoGuardado.idPedido || pedidoGuardado.id;
  const buyOrder = `ORD-${idPedidoCreado || Date.now()}`;
  const sessionId = `SESS-${datosPedido.idUsuario || 'GUEST'}`;
  const amount = Math.round(
    Number(datosPedido.monto || datosPedido.montoTotal || pedidoGuardado.montoTotal || pedidoGuardado.monto)
  );

  let returnUrl = WEBPAY_RETURN_URL;
  if (idPedidoCreado) {
    const separator = WEBPAY_RETURN_URL.includes('?') ? '&' : '?';
    returnUrl = `${WEBPAY_RETURN_URL}${separator}idPedido=${encodeURIComponent(idPedidoCreado)}`;
  }

  const responseWebpay = await tx.create(buyOrder, sessionId, amount, returnUrl);

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
    new Options(
      IntegrationCommerceCodes.WEBPAY_PLUS,
      IntegrationApiKeys.WEBPAY,
      Environment.Integration
    )
  );

  const responseCommit = await tx.commit(token);

  let idPedidoFinal = String(idPedido ?? '').trim();
  if (!idPedidoFinal && typeof responseCommit?.buy_order === 'string') {
    const match = responseCommit.buy_order.match(/^ORD-(\d+)$/);
    if (match) {
      idPedidoFinal = match[1];
    }
  }

  if (!idPedidoFinal) {
    const error = new Error(
      'El idPedido falta o no es un ID válido. No se pudo actualizar el estado del pedido.'
    );
    error.status = 400;
    throw error;
  }

  if (responseCommit.response_code === 0) {
    await actualizarEstadoPedido(idPedidoFinal, 'PAGADO');
  } else {
    await actualizarEstadoPedido(idPedidoFinal, 'RECHAZADO');
  }

  return {
    ...responseCommit,
    idPedido: idPedidoFinal,
  };
};