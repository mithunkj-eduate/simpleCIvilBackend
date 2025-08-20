import mongoose from "mongoose";
import { StoreStatus } from "../types/store";

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    trim: true,
    required: false,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Owner ID is required"],
  },
  status: {
    type: String,
    enum: [StoreStatus.PENDING, StoreStatus.APPROVED, StoreStatus.REJECTED],
    default: StoreStatus.PENDING,
  },
  address: {
    type: String,
    required: false,
  },
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
  pincode: {
    type: String,
    required: true,
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

const Store = mongoose.model("Store", storeSchema);
export default Store;
