import { NextFunction, Response, request } from "express";
import asyncErrorHandler from "../Utils/asyncErrorHandler";
import { AuthRequest } from "../helpers/verifyjwt";
import User from "../models/userModel";
import Product from "../models/productModel";
import Store from "../models/storeModel";
import Order from "../models/orderModel";
import { DeliveryStatus, OrderStatus, PaymentMethod } from "../types/order";
import Cart from "../models/cartModel";
import Payment from "../models/paymentModel";
import { PaymentStatus } from "../types/payment";
import { v4 as uuidv4 } from "uuid"; // For generating transactionId
import { UserRole } from "../types/user";

export const createOrder = asyncErrorHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !user.userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }
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

    // Create Payment record based on payment method
    let initialStatus = PaymentStatus.CREATED;
    if (paymentMethod === PaymentMethod.CASH) {
      initialStatus = PaymentStatus.CAPTURED; // Cash is captured at order creation or delivery
    }
    console.log("Creating payment with status:", initialStatus);
    const payment = await Payment.create({
      userId: user.userId,
      orderId: order._id,
      amount: totalPrice,
      method: paymentMethod,
      status: initialStatus,
      transactionId: uuidv4(), // Unique transaction ID
    });
    console.log("Payment created:", payment);

    // Remove cart item
    const cart = await Cart.findOne({ userId: user.userId });
    if (cart) {
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId
      ) as any;
      await cart.save();
    }

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
export const getAllOrdersByFilter1 = asyncErrorHandler(
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

export const getAllOrdersByFilter = asyncErrorHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      venderId,
      productId,
      storeId,
      buyerId,
      orderStatus,
      deliveryStatus,
      paymentMethod,
      sort,
      page = "1",
      limit = "20",
    } = req.query;

    const filter: any = {};
    if (venderId) filter.venderId = venderId;
    if (productId) filter.productId = productId;
    if (storeId) filter.storeId = storeId;
    if (buyerId) filter.buyerId = buyerId;
    if (orderStatus)
      filter.orderStatus = { $in: (orderStatus as string).split(",") };
    if (deliveryStatus)
      filter.deliveryStatus = { $in: (deliveryStatus as string).split(",") };
    if (paymentMethod)
      filter.paymentMethod = { $in: (paymentMethod as string).split(",") };

    const sortQuery: any = {};
    switch (sort) {
      case "newest":
        sortQuery.createdAt = -1;
        break;
      case "oldest":
        sortQuery.createdAt = 1;
        break;
      case "priceLowToHigh":
        sortQuery.totalPrice = 1;
        break;
      case "priceHighToLow":
        sortQuery.totalPrice = -1;
        break;
      default:
        sortQuery.createdAt = -1;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    const orders = await Order.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .populate("buyerId", "name email phoneNumber")
      .populate("venderId", "name email phoneNumber")
      .populate("productId", "name saleTerms.salePrice")
      .populate("storeId", "name address");

    const totalCount = await Order.countDocuments(filter);
    res.status(200).json({
      message: "Orders retrieved successfully",
      data: orders,
      totalCount,
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
    )
      .populate("buyerId", "name email phoneNumber")
      .populate("venderId", "name email phoneNumber")
      .populate("productId", "name saleTerms.salePrice")
      .populate("storeId", "name address");

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
    const { deliveryStatus }: { deliveryStatus: DeliveryStatus } = req.body;

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
// /api/orders/history?days=30
// Get recent order history for authenticated user
export const getOrderHistory = asyncErrorHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user; // From AuthRequest
    if (!user || !user.userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const { days = 30 } = req.query; // Default to 30 days for "recent"
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days as string));
    const orders = await Order.find({
      buyerId: user.userId,
      createdAt: { $gte: dateThreshold },
    })
      .populate("productId", "name image saleTerms categoryId color tags")
      .populate("storeId", "name address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Order history retrieved successfully",
      data: orders,
    });
  }
);

// GET Method
// near confromed products
// delivery boy login only
// "/api/delivery/orders?lat=13.028473178767564&&lng=77.63284503525036"
export const nearByOrders = asyncErrorHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.user && req.user.role !== UserRole.DELIVERY_BOY) {
      res.status(401).json({ message: "Authorization header not found" });
      return;
    }
    const { lat, lng } = req.query;

    let filterQuery: any = {};

    // Location filter (within 50 km)
    if (lat && lng) {
      filterQuery.location = {
        $geoWithin: {
          $centerSphere: [[Number(lng), Number(lat)], 50 / 6378.1],
        },
      };
    }
    const stores = await Store.find(filterQuery)
      .sort({ createdAt: -1 })
      .populate("ownerId", "name");

    let filterOrdersQuery: any = {};

    filterOrdersQuery.orderStatus = OrderStatus.CONFIRMED;

    if (stores.length) {
      filterOrdersQuery.storeId = { $in: stores.map((item) => item._id) };
    }

    const Orders = await Order.find(filterOrdersQuery)
      .sort({ createdAt: -1 })
      .populate("venderId productId storeId", "name");

    const totalCount = await Order.countDocuments(filterOrdersQuery);

    res.status(200).json({
      data: Orders,
      totalCount,
    });
  }
);
