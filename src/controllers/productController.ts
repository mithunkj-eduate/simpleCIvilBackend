import { NextFunction, Request, Response } from "express";
import asyncErrorHandler from "../Utils/asyncErrorHandler";
import logger from "../helpers/loggerInfo";
import User from "../models/userModel";
import Store from "../models/storeModel";
import Category from "../models/categoryModel";
import Product from "../models/productModel";
import { ProductInput } from "../types/product";
import { AuthRequest } from "../helpers/verifyjwt";
import Order from "../models/orderModel";
import { UserRole } from "../types/user";

export const createProduct = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data: ProductInput = req.body;

    const { name, storeId, ownerId, categoryId, latitude, longitude } =
      req.body;
    if (!name || !storeId || !ownerId || !categoryId) {
      logger.error(`Name,storeId,ownerId,categoryId are required`);
      return res.status(400).json({
        message: "Name,storeId,ownerId,categoryId are required",
      });
    }

    const owner = await User.findById(ownerId);

    if (!owner) {
      logger.error(`ownerID: ${ownerId} not found`);
      return res.status(400).json({
        message: `ownerID: ${ownerId} not found`,
      });
    }

    const store = await Store.findById(storeId);

    if (!store) {
      logger.error(`storeID: ${storeId} not found`);
      return res.status(400).json({
        message: `storeID: ${storeId} not found`,
      });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      logger.error(`categoryID: ${categoryId} not found`);
      return res.status(400).json({
        message: `categoryID: ${categoryId} not found`,
      });
    }

    const product = await Product.create({
      ...req.body,
      location: {
        coordinates: [latitude, longitude],
      },
    });
    res.status(201).json({ data: product });
  }
);

// GET Method
// get products with filter
// /products?
export const getProducts1 = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type, categoryId, storeId, availability, minPrice, maxPrice } =
      req.query;

    const filter: any = {};

    if (type) filter.type = type;
    if (categoryId) filter.categoryId = categoryId;
    if (storeId) filter.storeId = storeId;
    if (availability !== undefined) filter.avilablity = availability === "true";

    // Filter by sale price range (if type is SALE or RESALE)
    if (minPrice || maxPrice) {
      filter["saleTerms.price"] = {};
      if (minPrice) filter["saleTerms.price"].$gte = Number(minPrice);
      if (maxPrice) filter["saleTerms.price"].$lte = Number(maxPrice);
    }

    const products = await Product.find(filter).populate(
      "storeId ownerId categoryId",
      "name"
    );

    const totalCount = await Product.find(filter).countDocuments();

    res.status(200).json({
      data: products,
      totalCount,
    });
  }
);

// GET Method
// get products with filter
// /api/products?categoryId=66abc12345&type=SALE&color=Blue&sort=Price: Low to High&lat=12.9716&lng=77.5946

export const getProducts2 = asyncErrorHandler(
  async (req: Request, res: Response) => {
    try {
      const {
        categoryId,
        storeId,
        type,
        color,
        size,
        minPrice,
        maxPrice,
        rating,
        lat,
        lng,
        sort,
      } = req.query;

      let filterQuery: any = {};

      if (categoryId) filterQuery.categoryId = categoryId;
      if (storeId) filterQuery.storeId = storeId;
      if (type) filterQuery.type = type;
      if (color) filterQuery.color = color;
      if (size) filterQuery.size = size;
      if (rating) filterQuery.rating = { $gte: Number(rating) };
      if (minPrice || maxPrice) {
        filterQuery["saleTerms.salePrice"] = {};
        if (minPrice)
          filterQuery["saleTerms.salePrice"].$gte = Number(minPrice);
        if (maxPrice)
          filterQuery["saleTerms.salePrice"].$lte = Number(maxPrice);
      }

      // Location filter (within 50 km)
      if (lat && lng) {
        filterQuery.location = {
          $geoWithin: {
            $centerSphere: [[Number(lng), Number(lat)], 50 / 6378.1],
          },
        };
      }

      // Sorting logic
      let sortQuery: any = {};
      switch (sort) {
        case "mostPopular":
          sortQuery.rating = -1;
          break;
        case "bestRating":
          sortQuery.rating = -1;
          break;
        case "newest":
          sortQuery.createdAt = -1;
          break;
        case "priceLowToHigh":
          sortQuery["saleTerms.salePrice"] = 1;
          break;
        case "priceHighToLow":
          sortQuery["saleTerms.salePrice"] = -1;
          break;
      }

      const products = await Product.find(filterQuery)
        .sort(sortQuery)
        .populate("storeId ownerId categoryId", "name");

      const totalCount = await Product.find(filterQuery)
        .sort(sortQuery)
        .countDocuments();

      res.status(200).json({
        data: products,
        totalCount,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// Get all products
export const getProducts = asyncErrorHandler(
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        ownerId,
        categoryId,
        storeId,
        type,
        color,
        size,
        minPrice,
        maxPrice,
        rating,
        lat,
        lng,
        sort,
        tags,
      } = req.query;

      let filterQuery: any = {};
      if (
        req.user &&
        (req.user.role === UserRole.SELLER ||
          req.user.role === UserRole.PICE_WORKER ||
          req.user.role === UserRole.PROJECT_MANAGER ||
          req.user.role === UserRole.RESELLER) &&
        ownerId
      ) {
        filterQuery.ownerId = { $in: (ownerId as string).split(",") };
      }
      if (categoryId) {
        filterQuery.categoryId = { $in: (categoryId as string).split(",") };
      }
      if (storeId) {
        filterQuery.storeId = { $in: (storeId as string).split(",") };
      }
      if (type) {
        filterQuery.type = type;
      }
      if (color) {
        filterQuery.color = { $in: (color as string).split(",") };
      }
      if (size) {
        filterQuery.size = { $in: (size as string).split(",") };
      }
      if (tags) {
        filterQuery.tags = { $in: (tags as string).split(",") };
      }
      if (rating) {
        filterQuery.rating = { $gte: Number(rating) };
      }
      if (minPrice || maxPrice) {
        filterQuery.$or = [
          {
            "saleTerms.salePrice": {
              ...(minPrice && { $gte: Number(minPrice) }),
              ...(maxPrice && { $lte: Number(maxPrice) }),
            },
          },
          {
            "rentalTerms.pricePerUnit": {
              ...(minPrice && { $gte: Number(minPrice) }),
              ...(maxPrice && { $lte: Number(maxPrice) }),
            },
          },
        ];
      }

      // Location filter (within 50 km)
      if (lat && lng) {
        filterQuery.location = {
          $geoWithin: {
            $centerSphere: [[Number(lng), Number(lat)], 50 / 6378.1],
          },
        };
      }

      if (req.query.avilablity === "true") {
        filterQuery.avilablity = true;
      }

      // Sorting logic
      let sortQuery: any = {};
      switch (sort) {
        case "mostPopular":
          sortQuery.rating = -1;
          break;
        case "bestRating":
          sortQuery.rating = -1;
          break;
        case "newest":
          sortQuery.createdAt = -1;
          break;
        case "priceLowToHigh":
          sortQuery["saleTerms.salePrice"] = 1;
          sortQuery["rentalTerms.pricePerUnit"] = 1;
          break;
        case "priceHighToLow":
          sortQuery["saleTerms.salePrice"] = -1;
          sortQuery["rentalTerms.pricePerUnit"] = -1;
          break;
      }

      const products = await Product.find(filterQuery)
        .sort(sortQuery)
        .populate("storeId ownerId categoryId", "name");

      const totalCount = await Product.countDocuments(filterQuery);

      res.status(200).json({
        data: products,
        totalCount,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// PUT method
// update product
export const updateProduct = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });
    res
      .status(200)
      .json({ message: "Product updated", product: updatedProduct });
  }
);

// get product by id
export const getProductById = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // const product = await Product.findById(req.params.id);
    // if (!product) return res.status(404).json({ message: "Product not found" });
    // res.status(200).json({ data: product });

    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId)
      .populate("storeId", "name address")
      .populate("ownerId", "name email")
      .populate("categoryId", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product retrieved successfully", data: product });
  }
);

// GET Method
// /api/products/similar/:productId
// Mock similar products endpoint
export const getSimilarProducts = asyncErrorHandler(
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Order.findOne({ productId: productId }).populate(
      "productId"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const similarProducts = await Product.find({
      categoryId: product.productId.categoryId,
      // color: product.productId.color,
      tags: { $in: product.productId.tags },
      _id: { $ne: productId },
    }).limit(4);

    // const similarProducts = await Product.find()

    res.status(200).json({
      message: "Similar products retrieved successfully",
      data: similarProducts,
    });
  }
);
