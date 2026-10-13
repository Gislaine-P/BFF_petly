import {
    crearPedido,
    obtenerPedidosPorUsuario,
    obtenerPedidoPorId
} from '../services/pedido.service.js';

export const postPedido = async (req, res) => {
    try {
        const nuevoPedido = await crearPedido(req.body);
        res.status(201).json(nuevoPedido);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al procesar el pedido', error: error.message });
    }
};

export const getPedidosPorUsuario = async (req, res) => {
    try {
        const { idUsuario } = req.params;
        const pedidos = await obtenerPedidosPorUsuario(idUsuario);
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al consultar historial de pedidos', error: error.message });
    }
};

export const getPedidoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const pedido = await obtenerPedidoPorId(id);
        res.json(pedido);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al consultar el detalle del pedido', error: error.message });
    }
};