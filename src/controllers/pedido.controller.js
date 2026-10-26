import * as pedidoService from '../services/pedido.service.js';

export const postPedido = async (req, res, next) => {
    try {
        const idUsuario = req.user?.sub || req.user?.id || req.body.idUsuario;
        const datosPedido = {
            ...req.body,
            idUsuario
        };

        const resultado = await pedidoService.crearPedidoYIniciarPago(datosPedido);
        return res.status(201).json(resultado);
    } catch (error) {
        next(error);
    }
};

export const confirmarPago = async (req, res, next) => {
    try {
        const { token_ws, token, idPedido } = req.body;
        const tokenFinal = token_ws || token;

        if (!tokenFinal) {
            return res.status(400).json({ message: 'El token de Webpay es requerido' });
        }

        const resultado = await pedidoService.confirmarPagoWebpay(tokenFinal, idPedido);
        return res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

// Controlador para el retorno automático desde Transbank Webpay
export const retornoWebpay = (req, res) => {
    // Unifica datos recibidos por POST (req.body) o GET (req.query)
    const datos = { ...req.query, ...req.body };
    const FRONT = process.env.FRONTEND_URL || 'https://3-222-252-115.sslip.io';

    // Si la transacción fue cancelada o abortada en la pasarela, Webpay envía TBK_TOKEN
    if (datos.TBK_TOKEN || !datos.token_ws) {
        return res.redirect(303, `${FRONT}/ConfirmacionPago?cancelado=1`);
    }

    // Redirección exitosa vía GET a React enviando el token_ws en la URL
    return res.redirect(303, `${FRONT}/ConfirmacionPago?token_ws=${encodeURIComponent(datos.token_ws)}`);
};

export const getPedidosPorUsuario = async (req, res, next) => {
    try {
        const { idUsuario } = req.params;
        const pedidos = await pedidoService.obtenerPedidosPorUsuario(idUsuario);
        return res.status(200).json(pedidos);
    } catch (error) {
        next(error);
    }
};

export const getPedidoPorId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const pedido = await pedidoService.obtenerPedidoPorId(id);
        return res.status(200).json(pedido);
    } catch (error) {
        next(error);
    }
};