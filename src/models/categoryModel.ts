import mongoose from "mongoose";
import { categoryLevel, catrgroryStatus } from "../types/category";
import { required } from "joi";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  parentCatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  level: {
    type: String,
    enum: [
      categoryLevel.GROUP,
      categoryLevel.CATEGORY,
      categoryLevel.SUBSIDIARY,
    ],
    default: categoryLevel.GROUP,
  },
  status: {
    type: String,
    enum: [catrgroryStatus.ACTIVE, catrgroryStatus.INACTIVE],
    default: catrgroryStatus.ACTIVE,
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

const Category = mongoose.model("Category", categorySchema);
export default Category;
