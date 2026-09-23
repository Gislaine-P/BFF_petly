import axios from 'axios';

const MS_CATALOGO_URL = process.env.MS_CATALOGO_URL || 'http://10.0.131.3:8082/api/categoria';

export const obtenerCategorias = async () => {
  const response = await axios.get(MS_CATALOGO_URL);
  return response.data;
};

export const crearCategoria = async (nuevaCategoria) => {
  const response = await axios.post(MS_CATALOGO_URL, nuevaCategoria);
  return response.data;
};

export const actualizarCategoria = async (id, categoria) => {
  const response = await axios.put(`${MS_CATALOGO_URL}/${id}`, categoria);
  return response.data;
};

export const eliminarCategoria = async (id) => {
  const response = await axios.delete(`${MS_CATALOGO_URL}/${id}`);
  return response.data;
};