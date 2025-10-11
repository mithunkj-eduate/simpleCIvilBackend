import { Request, Response } from "express";
import Payment from "../models/paymentModel";
import Order from "../models/orderModel";
import asyncErrorHandler from "../Utils/asyncErrorHandler";
import { PaymentStatus } from "../types/payment";
import { AuthRequest } from "../helpers/verifyjwt";

// Get payment GET API by orderId
export const getPayment = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const payment = await Payment.findOne({ orderId: orderId })
      .populate("userId", "name email")
      .populate("orderId", "totalPrice deliveryAddress");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res
      .status(200)
      .json({ message: "Payment retrieved successfully", data: payment });
  }
);

// Update payment status PUT API by paymentId
export const updatePaymentStatus = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const { action } = req.body; // e.g., "capture", "refund"
    if (!paymentId || !action) {
      return res
        .status(400)
        .json({ message: "Payment ID and action are required" });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    let newStatus;
    switch (action) {
      case "capture":
        if (payment.status !== PaymentStatus.AUTHORIZED) {
          return res
            .status(400)
            .json({ message: "Payment must be authorized to capture" });
        }
        newStatus = PaymentStatus.CAPTURED;
        break;
      case "refund":
        if (payment.status !== PaymentStatus.CAPTURED) {
          return res
            .status(400)
            .json({ message: "Payment must be captured to refund" });
        }
        newStatus = PaymentStatus.REFUNDED;
        break;
      default:
        return res.status(400).json({ message: "Invalid action" });
    }

    payment.status = newStatus;
    await payment.save();

    res.status(200).json({ message: "Payment status updated", data: payment });
  }
);

// Get all payments for the authenticated user
export const getAllPayments = asyncErrorHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user; // From AuthRequest
    if (!user || !user.userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const payments = await Payment.find({ userId: user.userId })
      .populate("orderId", "totalPrice deliveryAddress")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ message: "Payments retrieved successfully", data: payments });
  }
);
