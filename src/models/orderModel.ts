import mongoose from "mongoose";
import { DeliveryStatus, OrderStatus, PaymentMethod } from "../types/order";

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  venderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    enum: [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.CANCELLED,
    ],
    default: OrderStatus.PENDING,
  },
  paymentMethod: {
    type: String,
    enum: [PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.ONLINE],
    default: PaymentMethod.CASH,
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  deliveryStatus: {
    type: String,
    enum: [
      DeliveryStatus.PENDING,
      DeliveryStatus.SHIPPED,
      DeliveryStatus.DELIVERED,
      DeliveryStatus.RETURNED,
    ],
    default: DeliveryStatus.PENDING,
  },
  deliveryDate: {
    type: Date,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
