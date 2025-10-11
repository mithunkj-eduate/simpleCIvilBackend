import mongoose from "mongoose";
import { PaymentMethod } from "../types/order";
import { PaymentStatus } from "../types/payment";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  amount: { type: Number, required: true },
  method: {
    type: String,
    enum: [PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.ONLINE],
    required: true,
  },
  status: {
    type: String,
    enum: [
      PaymentStatus.CREATED,
      PaymentStatus.AUTHORIZED,
      PaymentStatus.CAPTURED,
      PaymentStatus.REFUNDED,
      PaymentStatus.FAILED,
    ],
    required: true,
  },
  transactionId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
