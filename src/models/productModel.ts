import mongoose from "mongoose";
import { productType } from "../types/product";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: [true, "Store ID is required"],
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Owner ID is required"],
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Category ID is required"],
  },
  rentalTerms: [
    {
      unit: { type: Number, default: 0 },
      pricePerUnit: { type: Number, default: 0 },
      minduration: { type: String },
    },
  ],
  saleTerms: {
    mrpPrice: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
  },
  type: {
    type: String,
    enum: [productType.SALE, productType.RENTAL, productType.RESALE],
    default: productType.SALE,
  },
  image: [
    {
      type: String,
      url: String,
    },
  ],
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  avilablity: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  color: { type: String, index: true }, // "Blue"
  size: { type: String, index: true }, // "40L"
  brand: { type: String, index: true },
  tags: [{ type: String, index: true }], // ["new-arrivals", "sale"]

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.index({ categoryId: 1 });
productSchema.index({ storeId: 1 });
productSchema.index({ type: 1 });
productSchema.index({ color: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ location: "2dsphere" }); // For geospatial queries

const Product = mongoose.model("Product", productSchema);
export default Product;
