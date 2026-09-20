import { 
  obtenerCategorias, 
  crearCategoria, 
  actualizarCategoria, 
  eliminarCategoria 
} from '../services/categoria.service.js';

export const getCategorias = async (req, res) => {
  try {
    const categorias = await obtenerCategorias();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener categorías', error: error.message });
  }
};

export const postCategoria = async (req, res) => {
  try {
    const categoriaCreada = await crearCategoria(req.body);
    res.status(201).json(categoriaCreada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear categoría', error: error.message });
  }
};

export const putCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizada = await actualizarCategoria(id, req.body);
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar categoría', error: error.message });
  }
};

export const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    await eliminarCategoria(id);
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar categoría', error: error.message });
  }
};