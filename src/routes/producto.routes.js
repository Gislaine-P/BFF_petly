import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { 
  getProductos, 
  getProductoDetalle, 
  postProducto, 
  putProducto, 
  deleteProducto,
  descontarStock,
  aprobarSag 
} from "../controllers/producto.controller.js";

const router = Router();

// Consulta pública
router.get("/", getProductos);
router.get("/:id/detalle", getProductoDetalle);

// Descontar stock (llamado tras confirmar el pago en ConfirmacionPago.jsx)
router.put("/:id/descontar-stock", authenticateToken, descontarStock);

// Aprobación SAG por parte del Administrador (llamado desde DashboardAdmin.jsx)
router.patch("/:id/aprobar-sag", authenticateToken, requireRole("admin"), aprobarSag);

// CRUD de Gestión (solo admin)
router.post("/", authenticateToken, requireRole("admin"), postProducto);
router.put("/:id", authenticateToken, requireRole("admin"), putProducto);
router.delete("/:id", authenticateToken, requireRole("admin"), deleteProducto);

export default router;