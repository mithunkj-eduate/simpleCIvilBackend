import express from "express";
import {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/productController";

const router = express.Router();

router.route("/").post(createProduct);
router.route("/").get(getProducts);
router.route("/:id").get(getProductById);
router.route("/:id").post(updateProduct);

export default router;
