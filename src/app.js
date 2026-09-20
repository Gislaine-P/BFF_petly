import express from 'express';
import cors from 'cors';
import productoRoutes from './routes/producto.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import marcaRoutes from './routes/marca.routes.js'

const app = express();
const PORT = process.env.PORT || 8083;

// Middlewares
app.use(cors());
app.use(express.json());

// Registro de rutas
app.use('/api/bff/productos', productoRoutes);
app.use('/api/bff/categorias', categoriaRoutes); 
app.use('/api/bff/marcas', marcaRoutes);

app.listen(PORT, () => {
  console.log(`🚀 BFF Servidor corriendo en http://localhost:${PORT}`);
});