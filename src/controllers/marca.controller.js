import { obtenerMarcas, crearMarca, actualizarMarca, eliminarMarca } from '../services/marca.service.js';

export const getMarcas = async (req, res) => {
  try {
    const marcas = await obtenerMarcas();
    res.json(marcas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener marcas', error: error.message });
  }
};

export const postMarca = async (req, res) => {
  try {
    const creada = await crearMarca(req.body);
    res.status(201).json(creada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear marca', error: error.message });
  }
};

export const putMarca = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizada = await actualizarMarca(id, req.body);
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar marca', error: error.message });
  }
};

export const deleteMarca = async (req, res) => {
  try {
    const { id } = req.params;
    await eliminarMarca(id);
    res.json({ mensaje: 'Marca eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar marca', error: error.message });
  }
};