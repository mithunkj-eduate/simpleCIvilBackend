import express from "express";
import {
    getAllPayments,
  getPayment,
  updatePaymentStatus,
} from "../controllers/paymentController";

const router = express.Router();

router.route("/").get(getAllPayments)
router.route("/:orderId").get(getPayment);
router.route("/:paymentId/action").put(updatePaymentStatus);

export default router;
