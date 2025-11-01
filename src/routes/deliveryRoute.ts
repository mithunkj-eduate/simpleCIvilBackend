import express from "express";
import { nearByOrders } from "../controllers/orderController";

const router = express.Router();

router.route("/orders").get(nearByOrders);

export default router;
