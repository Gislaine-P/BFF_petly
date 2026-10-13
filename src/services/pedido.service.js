//import fetch from'node-fetch';

const MS_PEDIDOS_URL = process.env.MS_PEDIDOS_URL||'http://localhost:8084/api/pedidos';

export const crearPedido = async(datosPedido) =>{
    const response = await fetch(MS_PEDIDOS_URL,{
        method:'POST',
        headers:{'Content-Type': 'application/json'},
        body:JSON.stringify(datosPedido),
    });

    if(!response.ok){
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || errorBody.error ||'Error al crear el pedido en ms-pedidos');
        
    }
    return await response.json();
};

export const obtenerPedidosPorUsuario = async (idUsuario) => {
    const response = await fetch(`${MS_PEDIDOS_URL}/usuario/${idUsuario}`);

    if(!response.ok){
        throw new Error('Error al obtener los pedidos del usuario');
    }
    return await response.json();
};

export const obtenerPedidoPorId = async(idPedido) => {
    const response = await fetch(`${MS_PEDIDOS_URL}/${idPedido}`);

    if(!response.ok){
        throw new Error('Error al obtener el detalle del pedido');
    }
    return await response.json();
};