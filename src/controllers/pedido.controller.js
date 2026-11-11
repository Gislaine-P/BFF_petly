import * as pedidoService from '../services/pedido.service.js';

export const postPedido = async (req, res, next) => {
    try {
        console.log("===> Payload recibido en BFF:", JSON.stringify(req.body, null, 2));

        const idUsuario = req.user?.email || 
                          req.user?.sub || 
                          req.user?.id || 
                          req.body?.idUsuario || 
                          req.body?.email || 
                          req.body?.datosEnvio?.email || 
                          'GUEST';

        const items = req.body?.items || 
                      req.body?.productos || 
                      req.body?.carrito || 
                      req.body?.cart || 
                      req.body?.detalles ||
                      req.body?.lineItems;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                mensaje: 'El pedido debe incluir al menos un producto.'
            });
        }

        const monto = req.body?.monto || req.body?.montoTotal || req.body?.total;

        const datosPedido = {
            ...req.body,
            idUsuario,
            items,
            montoTotal: monto,
            monto
        };

        const resultado = await pedidoService.crearPedido(datosPedido);
        return res.status(201).json(resultado);
    } catch (error) {
        console.error('Error al procesar el pedido en BFF:', error.message || error);
        next(error);
    }
};

export const confirmarPago = async (req, res, next) => {
    try {
        const token = req.body?.token || req.body?.token_ws;
        const idPedido = String(req.body?.idPedido ?? '').trim();

        if (!token || typeof token !== 'string') {
            return res.status(400).json({
                mensaje: 'Falta el token de Webpay o formato inválido'
            });
        }

        if (!idPedido) {
            return res.status(400).json({
                mensaje: 'El idPedido falta o no es un ID válido. No se confirmó la transacción.'
            });
        }

        const resultado = await pedidoService.confirmarPagoWebpay(token, idPedido);
        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Error al confirmar pago Webpay:', error.message || error);
        next(error);
    }
};

export const retornoWebpay = (req, res) => {
    const datos = { ...req.query, ...req.body };
    const FRONT = process.env.FRONTEND_URL || 'https://3-222-252-115.sslip.io';

    if (datos.TBK_TOKEN || !datos.token_ws) {
        return res.redirect(303, `${FRONT}/ConfirmacionPago?cancelado=1`);
    }

    return res.redirect(303, `${FRONT}/ConfirmacionPago?token_ws=${encodeURIComponent(datos.token_ws)}`);
};

export const getPedidosPorUsuario = async (req, res, next) => {
    try {
        const idUsuario = req.params.idUsuario || req.user?.email || req.user?.sub;
        if (!idUsuario) {
            return res.status(400).json({ mensaje: 'ID de usuario requerido' });
        }

        const pedidos = await pedidoService.obtenerPedidosPorUsuario(idUsuario);
        return res.status(200).json(pedidos);
    } catch (error) {
        next(error);
    }
};

export const getPedidoPorId = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ mensaje: 'ID de pedido requerido' });
        }

        const pedido = await pedidoService.obtenerPedidoPorId(id);
        return res.status(200).json(pedido);
    } catch (error) {
        next(error);
    }
};
