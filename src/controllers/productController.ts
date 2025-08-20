import { NextFunction, Request, Response } from "express";
import asyncErrorHandler from "../Utils/asyncErrorHandler";
import logger from "../helpers/loggerInfo";
import User from "../models/userModel";
import Store from "../models/storeModel";
import Category from "../models/categoryModel";
import Product from "../models/productModel";
import { ProductInput } from "../types/product";

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
    res.status(200).json({
      message: "created successfully",
    });
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

export const getProducts = asyncErrorHandler(
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
console.log("filter",filterQuery)
      const products = await Product.find(filterQuery).sort(sortQuery).populate(
        "storeId ownerId categoryId",
        "name"
      );

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
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ data: product });
  }
);
