import express from "express";
import {
  approvedStore,
  createStore,
  storeById,
  stores,
  storesByOwnerId,
} from "../controllers/storeController";

const router = express.Router();

router.route("/").post(createStore);
router.route("/").get(stores);
router.route("/:id").get(storeById); // Assuming this is to get store by ID
router.route("/:ownerId").get(storesByOwnerId) // Assuming this is to get stores by owner ID
router.route("/:id/approve").post(approvedStore);

export default router;
