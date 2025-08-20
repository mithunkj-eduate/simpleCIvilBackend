import express from "express";
import {
  createOrder,
  getAllOrdersByFilter,
  getOrderById,
  updateOrderDeliveryStatus,
  updateOrderStatus,
} from "../controllers/orderController";

const router = express.Router();

router.route("/").post(createOrder); // Assuming this is to create a new order
router.route("/all?").get(getAllOrdersByFilter); // Assuming this is to get all orders with some filter
router.route("/:id").get(getOrderById); // Assuming this is to get order by ID
router.route("/:id/status").post(updateOrderStatus); // Assuming this is to update order status
router.route("/:id/deliveryStatus").post(updateOrderDeliveryStatus); // Assuming this is to update order delivery status

export default router;
