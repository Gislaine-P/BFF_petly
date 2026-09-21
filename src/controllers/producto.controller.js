import { 
  obtenerProductos, 
  crearProducto, 
  actualizarProducto, 
  eliminarProducto, 
  obtenerDetalleProducto 
} from '../services/producto.service.js';

export const getProductos = async (req, res) => {
  try {
    const { categoriaId } = req.query;
    const productos = await obtenerProductos(categoriaId);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
  }
};

export const postProducto = async (req, res) => {
  try {
    const productoCreado = await crearProducto(req.body);
    res.status(201).json(productoCreado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear producto', error: error.message });
  }
};

export const putProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const productoEditado = await actualizarProducto(id, req.body);
    res.json(productoEditado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar producto', error: error.message });
  }
};

export const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await eliminarProducto(id);
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
  }
};

export const getProductoDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    const detalle = await obtenerDetalleProducto(id);
    res.json(detalle);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el detalle del producto', error: error.message });
  }
};

export const descontarStock = async (req, res) => {
  try {
    const { id } = req.params;
    
    const productoActual = await obtenerDetalleProducto(id);

    if (!productoActual) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const stockActualizado = req.body.stock !== undefined 
      ? req.body.stock 
      : Math.max(0, productoActual.stock - (req.body.cantidad || 1));

    const payloadCompleto = {
      ...productoActual,
      ...req.body,
      idProducto: parseInt(id, 10),
      stock: stockActualizado,
      idMarca: req.body.idMarca || productoActual.idMarca || 1,
      idCategoria: req.body.idCategoria || productoActual.idCategoria || 1,
      idEspecie: req.body.idEspecie || productoActual.idEspecie || 1
    };

    const productoEditado = await actualizarProducto(id, payloadCompleto);
    res.json(productoEditado);
  } catch (error) {
    console.error("Error en descontarStock:", error);
    res.status(500).json({ mensaje: 'Error al actualizar el stock', error: error.message });
  }
};