import express from "express";
import { addToCart, getCart, removeFormCart } from "../controllers/cartController";

const router = express.Router();

router.route("/").get(getCart);
router.route("/").post(addToCart);
router.route("/:productId").delete(removeFormCart);

export default router;
