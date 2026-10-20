import { crearCola, listarColas, eliminarCola } from '../services/sqsAdmin.service.js';

export const getColas = async (req, res) => {
  try {
    const colas = await listarColas();
    res.json(colas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar las colas', error: error.message });
  }
};

export const postCola = async (req, res) => {
  try {
    const { queueName } = req.body;
    const queueUrl = await crearCola(queueName);
    res.status(201).json({ mensaje: 'Cola creada exitosamente', queueUrl });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear la cola', error: error.message });
  }
};

export const deleteCola = async (req, res) => {
  try {
    const { queueName } = req.params;
    await eliminarCola(queueName);
    res.json({ mensaje: `Cola '${queueName}' eliminada exitosamente` });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la cola', error: error.message });
  }
};