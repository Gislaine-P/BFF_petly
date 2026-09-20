import axios from 'axios';

const MS_CATALOGO_URL = process.env.MS_CATALOGO_URL || 'http://127.0.0.1:8082/api/marca';

export const obtenerMarcas = async () => {
  const response = await axios.get(MS_CATALOGO_URL);
  return response.data;
};

export const crearMarca = async (nuevaMarca) => {
  const response = await axios.post(MS_CATALOGO_URL, nuevaMarca);
  return response.data;
};

export const actualizarMarca = async (id, marca) => {
  const response = await axios.put(`${MS_CATALOGO_URL}/${id}`, marca);
  return response.data;
};

export const eliminarMarca = async (id) => {
  const response = await axios.delete(`${MS_CATALOGO_URL}/${id}`);
  return response.data;
};