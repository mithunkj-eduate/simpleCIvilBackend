import express from "express";
import {
  createProduct,
  getProductById,
  getProducts,
  getSimilarProducts,
  updateProduct,
} from "../controllers/productController";

const router = express.Router();

router.route("/").post(createProduct);
router.route("/").get(getProducts);
router.route("/similar/:productId").get(getSimilarProducts);
router.route("/:id").get(getProductById);
router.route("/:id").post(updateProduct);

export default router;
