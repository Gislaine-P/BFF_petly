import axios from 'axios';

const MS_MARCA_URL = process.env.MS_MARCA_URL || 'http://127.0.0.1:8082/api/marca';

export const obtenerMarcas = async () => {
  const response = await axios.get(MS_MARCA_URL);
  return response.data;
};

export const crearMarca = async (nuevaMarca) => {
  const response = await axios.post(MS_MARCA_URL, nuevaMarca);
  return response.data;
};

export const actualizarMarca = async (id, marca) => {
  const response = await axios.put(`${MS_MARCA_URL}/${id}`, marca);
  return response.data;
};

export const eliminarMarca = async (id) => {
  const response = await axios.delete(`${MS_MARCA_URL}/${id}`);
  return response.data;
};