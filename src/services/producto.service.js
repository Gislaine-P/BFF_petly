import axios from 'axios';

const MS_PRODUCTO_URL = process.env.MS_PRODUCTO_URL || 'http://10.0.141.120:8081/api/producto';
const MS_CATALOGO_URL = process.env.MS_CATALOGO_URL || 'http://10.0.131.3:8082/api/categoria';

export const obtenerProductos = async (categoriaId) => {
  let url = MS_PRODUCTO_URL;
  
  if (categoriaId) {
    url += `?categoriaId=${categoriaId}`;
  }

  const response = await axios.get(url);
  return response.data;
};

export const crearProducto = async (nuevoProducto) => {
  const response = await axios.post(MS_PRODUCTO_URL, nuevoProducto);
  return response.data;
};

export const actualizarProducto = async (id, productoActualizado) => {
  const response = await axios.put(`${MS_PRODUCTO_URL}/${id}`, productoActualizado);
  return response.data;
};

export const eliminarProducto = async (id) => {
  const response = await axios.delete(`${MS_PRODUCTO_URL}/${id}`);
  return response.data;
};

export const obtenerDetalleProducto = async (idProducto) => {
  const resProducto = await axios.get(`${MS_PRODUCTO_URL}/${idProducto}`);
  const producto = resProducto.data;

  let nombreCategoria = 'Sin Categoría';
  if (producto.idCategoria) {
    try {
      const resCategoria = await axios.get(`${MS_CATALOGO_URL}/${producto.idCategoria}`);
      nombreCategoria = resCategoria.data.nombreCategoria;
    } catch (error) {
      console.warn(`No se pudo obtener la categoría ${producto.idCategoria}: ${error.message}`);
    }
  }

  return {
    ...producto,
    idProducto: producto.idProducto || producto.id,
    nombreProducto: producto.nombreProducto,
    precio: producto.precio,
    stock: producto.stock,
    urlImagen: producto.urlImagen,
    descripcion: producto.descripcion || "Sin descripción",
    idEspecie: producto.idEspecie || 1,
    idMarca: producto.idMarca || 1,
    idCategoria: producto.idCategoria || 1,
    categoria: nombreCategoria
  };
};