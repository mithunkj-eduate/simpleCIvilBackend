import { NextFunction, Request, Response } from "express";
import asyncErrorHandler from "../Utils/asyncErrorHandler";
import Store from "../models/storeModel";
import { AuthRequest } from "../helpers/verifyjwt";
import { UserRole } from "../types/user";
import logger from "../helpers/loggerInfo";
import { StoreTypes } from "../types/store";

export const createStore = asyncErrorHandler(
  async (req: Request, res: Response, nexr: NextFunction) => {
    const { name, ownerId, address, latitude, longitude, pincode }: StoreTypes =
      req.body;

    if (!name || !ownerId || !address || !latitude || !longitude || !pincode) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if the store already exists
    const store = await Store.findOne({ name });
    if (store) {
      return res.status(400).json({
        message: "Store with this name already exists",
      });
    }

    // Create a new store
    const newStore = new Store({
      name,
      ownerId,
      address,
      location: {
        type: "Point",
        coordinates: [latitude, longitude],
      },
      pincode,
    });

    // Save the store to the database
    await newStore.save();

    res.status(200).json({
      message: "Store created successfully",
    });
  }
);

//sys_admin or admin status update
// POST
export const approvedStore = asyncErrorHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (
      req.user &&
      req.user?.role !== UserRole.SYSTEM_ADMIN &&
      req.user.role !== UserRole.ADMIN
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const id = req.params.id;

    const store = await Store.findById(id);

    if (!store) {
      logger.error(`Store not found this id: ${id}`);
      return res.status(400).json({
        message: "Not found store",
      });
    }
    // update store status
    const storeData = await Store.findByIdAndUpdate(id, {
      status: req.body.status,
    });

    res.status(200).json({
      data: storeData,
      message: "Store status approved successfully",
    });
  }
);

// get store
// GET
export const storeById = asyncErrorHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const store = await Store.findById(req.params.id);

    if (!store) {
      logger.error(`Store not found with id: ${req.params.id}`);
      return res.status(404).json({
        message: "Store not found",
      });
    }

    res.status(200).json({
      data: store,
    });
  }
);

// get stores
// GET
export const stores = asyncErrorHandler(
  async (req: AuthRequest, res: Response) => {
    console.log(req.user?.userId,"get stores")
    if (
      req.user &&
      (req.user.role === UserRole.SYSTEM_ADMIN ||
        req.user.role === UserRole.ADMIN)
    ) {
      const stores = await Store.find().populate("ownerId", "-password");
      res.status(200).json({
        data: stores,
      });
    } else if (
      req.user &&
      (req.user.role === UserRole.SELLER ||
        req.user.role === UserRole.PICE_WORKER ||
        req.user.role === UserRole.PROJECT_MANAGER ||
        req.user.role === UserRole.RESELLER)
    ) {
      const stores = await Store.find({ ownerId: req.user.userId }).populate(
        "ownerId",
        "-password"
      );
      res.status(200).json({
        data: stores,
      });
    }
    res.status(200).json({
      data: null,
    });
  }
);

// get all stores by ownerId
export const storesByOwnerId = asyncErrorHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const ownerId = req.params.ownerId;

    if (!ownerId) {
      return res.status(400).json({
        message: "Owner ID is required",
      });
    }

    const stores = await Store.find({ ownerId }).populate(
      "ownerId",
      "-password"
    );

    if (stores.length === 0) {
      return res.status(404).json({
        message: "No stores found for this owner",
      });
    }

    res.status(200).json({
      data: stores,
    });
  }
);
