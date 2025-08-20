import { NextFunction, Response, request } from "express";
import asyncErrorHandler from "../Utils/asyncErrorHandler";
import { AuthRequest } from "../helpers/verifyjwt";
import User from "../models/userModel";
import Product from "../models/productModel";
import Store from "../models/storeModel";
import Order from "../models/orderModel";
import { OrderStatus } from "../types/order";

export const createOrder = asyncErrorHandler(
  async (req: AuthRequest, res: Response, nexr: NextFunction) => {
    const {
      venderId,
      productId,
      storeId,
      quantity,
      totalPrice,
      paymentMethod,
      deliveryAddress,
    } = req.body;

    if (
      !venderId ||
      !productId ||
      !storeId ||
      !quantity ||
      !totalPrice ||
      !paymentMethod ||
      !deliveryAddress
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const vender = await User.findById(venderId);
    if (!vender) {
      return res.status(400).json({
        message: `Vender with ID ${venderId} not found`,
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({
        message: `Product with ID ${productId} not found`,
      });
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(400).json({
        message: `Store with ID ${storeId} not found`,
      });
    }

    const order = await Order.create({
      buyerId: req.user?.userId,
      venderId,
      productId,
      storeId,
      quantity,
      totalPrice,
      paymentMethod,
      deliveryAddress,
    });

    res.status(201).json({
      message: "Order created successfully",
      data: order,
    });
  }
);

export const getOrderById = asyncErrorHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).json({
        message: "Order ID is required",
      });
    }

    const order = await Order.findById(orderId)
      .populate("buyerId", "name email phoneNumber")
      .populate("venderId", "name email phoneNumber")
      .populate("productId", "name price image")
      .populate("storeId", "name address");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order retrieved successfully",
      data: order,
    });
  }
);

// get All orders
// Get /api/orders/all?
// filter by vender, product, store, buyer, orderStatus, deliveryStatus particlarly
export const getAllOrdersByFilter = asyncErrorHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      venderId,
      productId,
      storeId,
      buyerId,
      orderStatus,
      deliveryStatus,
    } = req.query;

    const filter: any = {};

    if (venderId) filter.venderId = venderId;
    if (productId) filter.productId = productId;
    if (storeId) filter.storeId = storeId;
    if (buyerId) filter.buyerId = buyerId;
    if (orderStatus) filter.orderStatus = orderStatus;
    if (deliveryStatus) filter.deliveryStatus = deliveryStatus;

    const orders = await Order.find(filter)
      .populate("buyerId", "name email phoneNumber")
      .populate("venderId", "name email phoneNumber")
      .populate("productId", "name price image")
      .populate("storeId", "name address");

    res.status(200).json({
      message: "Orders retrieved successfully",
      data: orders,
    });
  }
);

export const updateOrderStatus = asyncErrorHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const orderId = req.params.id;
    const { orderStatus }: { orderStatus: OrderStatus } = req.body;

    if (!orderId || !orderStatus) {
      return res.status(400).json({
        message: "Order ID and status are required",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  }
);

export const updateOrderDeliveryStatus = asyncErrorHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const orderId = req.params.id;
    const { deliveryStatus }: { deliveryStatus: string } = req.body;

    if (!orderId || !deliveryStatus) {
      return res.status(400).json({
        message: "Order ID and delivery status are required",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { deliveryStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order delivery status updated successfully",
      data: updatedOrder,
    });
  }
);
