import { Request, Response } from "express";
import asyncErrorHandler from "../Utils/asyncErrorHandler";
import Cart from "../models/cartModel";
import { AuthRequest } from "../helpers/verifyjwt";

export const getCart = asyncErrorHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user || !user.userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const cart = await Cart.findOne({ userId: user.userId }).populate({
      path: "items.productId",
      populate: [
        { path: "storeId", select: "name address" },
        { path: "ownerId", select: "name email" },
      ],
    });

    if (!cart) {
      return res
        .status(200)
        .json({ message: "Cart retrieved successfully", data: [] });
    }

    res.status(200).json({
      message: "Cart retrieved successfully",
      data: cart.items.map((item) => ({
        ...item.toObject(),
        ...(item.productId as any).toObject(),
        quantity: item.quantity,
      })),
    });
  }
);

export const addToCart = asyncErrorHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    const { productId, quantity, selectedColor, selectedSize } = req.body;

    if (!user || !user.userId || !productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    let cart = await Cart.findOne({ userId: user.userId });
    if (!cart) {
      cart = new Cart({ userId: user.userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem && quantity === 1) {
      existingItem.quantity += quantity;
    } else if (existingItem && quantity > 1) {
      existingItem.quantity = quantity;
    } else {
      cart.items.push({ productId, quantity, selectedColor, selectedSize });
    }

    await cart.save();
    res.status(200).json({ message: "Item added to cart", data: cart });
  }
);

export const removeFormCart = asyncErrorHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    const { productId } = req.params;

    if (!user || !user.userId || !productId) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const cart = await Cart.findOne({ userId: user.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    ) as any;

    await cart.save();
    res.status(200).json({ message: "Item removed from cart", data: cart });
  }
);
