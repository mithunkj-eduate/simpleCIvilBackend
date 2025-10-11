import express from "express";
import {
  register,
  login,
  users,
  userById,
} from "../controllers/authController";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/").get(users);
router.route("/:id").get(userById);

export default router;
