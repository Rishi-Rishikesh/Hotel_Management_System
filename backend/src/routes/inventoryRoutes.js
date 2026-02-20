import express from "express";
import {
  addInventoryItem,
  getProducts,
  getRoomInventory,
  updateRoomInventory,
  getInventoryHistory,
  updateInventoryStatus,
  deleteInventoryItem,
  generateInventoryReport, // Added
} from "../controllers/inventoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

console.log("Registering inventory routes...");

router.post("/additem", authMiddleware(["Staff", "Admin"]), (req, res, next) => {
  console.log(`Route: POST /api/inventory/additem - Reached with userId: ${req.userId}`);
  addInventoryItem(req, res, next);
});

router.get("/getproducts", authMiddleware(["Staff", "Admin"]), (req, res, next) => {
  console.log(`Route: GET /api/inventory/getproducts - Reached with userId: ${req.userId}`);
  getProducts(req, res, next);
});

router.get("/room/:roomId/inventory", authMiddleware(["Staff", "Admin"]), (req, res, next) => {
  console.log(`Route: GET /api/inventory/room/${req.params.roomId}/inventory - Reached with userId: ${req.userId}`);
  getRoomInventory(req, res, next);
});

router.post("/room/:roomId/inventory", authMiddleware(["Staff"]), (req, res, next) => {
  console.log(`Route: POST /api/inventory/room/${req.params.roomId}/inventory - Reached with userId: ${req.userId}`);
  updateRoomInventory(req, res, next);
});

router.get("/history", authMiddleware(["Staff", "Admin"]), (req, res, next) => {
  console.log(`Route: GET /api/inventory/history - Reached with userId: ${req.userId}`);
  getInventoryHistory(req, res, next);
});

router.put("/updates/:id/status", authMiddleware(["Admin"]), (req, res, next) => {
  console.log(`Route: PUT /api/inventory/updates/${req.params.id}/status - Reached with userId: ${req.userId}`);
  updateInventoryStatus(req, res, next);
});

router.delete("/:id", authMiddleware(["Staff", "Admin"]), (req, res, next) => {
  console.log(`Route: DELETE /api/inventory/${req.params.id} - Reached with userId: ${req.userId}`);
  deleteInventoryItem(req, res, next);
});

router.get("/report", authMiddleware(["Admin","Staff"]), (req, res, next) => {
  console.log(`Route: GET /api/inventory/report - Reached with userId: ${req.userId}`);
  generateInventoryReport(req, res, next);
});

console.log("Inventory routes registered");

export default router;