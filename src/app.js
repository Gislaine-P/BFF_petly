import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import productoRoutes from './routes/producto.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import marcaRoutes from './routes/marca.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';
import sqsAdminRoutes from './routes/sqsAdmin.routes.js';

const app = express();
const PORT = process.env.PORT || 8083;

// Middleware de CORS global
app.use(cors());

// Middlewares para procesar el cuerpo de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas con el prefijo completo que ahora envía API Gateway
app.use('/api/bff/categorias', categoriaRoutes);
app.use('/api/bff/productos', productoRoutes);
app.use('/api/bff/marcas', marcaRoutes);
app.use('/api/bff/pedidos', pedidoRoutes);
app.use('/admin/queues', sqsAdminRoutes);
app.listen(PORT, () => {
  console.log(`🚀 BFF Servidor corriendo en el puerto ${PORT}`);
});
