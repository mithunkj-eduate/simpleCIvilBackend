import express from "express";
import {
  categories,
  categoryById,
  createCategory,
  updateCategoryStatus,
} from "../controllers/categoryController";

const router = express.Router();

router.route("/").post(createCategory);
router.route("/").get(categories);
router.route("/:id").get(categoryById);
router.route("/:id/status").post(updateCategoryStatus);

export default router;
