import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { 
  getProductos, 
  getProductoDetalle, 
  postProducto, 
  putProducto, 
  deleteProducto,
  descontarStock 
} from "../controllers/producto.controller.js";

const router = Router();

// Consulta pública
router.get("/", getProductos);
router.get("/:id/detalle", getProductoDetalle);


router.put("/:id/descontar-stock", authenticateToken, descontarStock);

// CRUD de Gestion (solo admin)
router.post("/", authenticateToken, requireRole("admin"), postProducto);
router.put("/:id", authenticateToken, requireRole("admin"), putProducto);
router.delete("/:id", authenticateToken, requireRole("admin"), deleteProducto);

export default router;