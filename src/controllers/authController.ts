import { NextFunction, Request, Response } from "express";
import CustomError from "../Utils/CustomError";
import asyncErrorHandler from "../Utils/asyncErrorHandler";
import { registerSchema } from "../helpers/joiValidation";
import logger from "../helpers/loggerInfo";
import User from "../models/userModel";
import bcrypt from "bcrypt";
import { AuthMethod, UserRole } from "../types/user";
import jwt from "jsonwebtoken";

const saltRounds = 10;

//@desc user register
//@route /register
//@access public
export const register = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    logger.error("register:17 validation result");

    // const value = await registerSchema(req.body);
    // if (value.error) {
    //   console.log("validation error");
    //   logger.error(value.error.details[0].message);
    //   const err = new CustomError(value.error.details[0].message, 400);
    //   return next(err);
    // }

    if (req.body.role && req.body.role !== UserRole.SYSTEM_ADMIN) {
      logger.error("role is not allowed");
      res.status(400).json({
        message: "role is not allowed, only system admin can create users",
      });
    }
    let existUser = await User.findOne({
      phoneNumber: req.body.phoneNumber,
    });
    if (existUser) {
      logger.error("user already present");
      return res
        .status(400)
        .json({ message: "user already registered with this phone number" });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const newUser = await User.create({
      name: req.body.name,
      password: hashedPassword,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      role: req.body.role,
      authMethod: [req.body.AuthMethod ? req.body.AuthMethod : AuthMethod.NONE],
    });
    res.status(201).json({
      title: "New user has been created",
      data: newUser,
    });
  }
);

export const login = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.phoneNumber || !req.body.password) {
      logger.error("Phone number and password are required");
      return res.status(400).json({
        message: "Phone number and password are required",
      });
    }

    const user = await User.findOne({ phoneNumber: req.body.phoneNumber });
    if (!user) {
      logger.error("User not found");
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (user && bcrypt.compareSync(req.body.password, user.password ?? "")) {
      const token = jwt.sign(
        {
          userId: user._id,
          role: user.role,
        },
        process.env.TOKEN_SECRET ?? "",
        {
          expiresIn: "60d",
        }
      );

      // const refreashToken = jwt.sign(
      //   {
      //     userId: user._id,
      //     role: user.role,
      //   },
      //   process.env.REFRESH_TOKEN_SECKRET,
      //   { expiresIn: process.env.TOKEN_EXPIRY }
      // );
      // const reftoken = new Token({
      //   userId: user._id,
      //   token: refreashToken,
      // });
      // const savedToken = await reftoken.save();
      // res
      //   .cookie("jwt", refreashToken, {
      //     httpOnly: true,
      //     maxAge: process.env.COOKIE_EXPIRY,
      //   })
      //   .json({
      //     user: user,
      //     token: token,
      //   });

      await User.findByIdAndUpdate(
        user._id,
        { lastLoggedInAt: new Date() },
        { projection: { password: 0 }, new: true }
      );

      res.status(200).json({ message: "login successfully", token: token });
    } else {
      logger.error("Invalid phone number or password");
      return res.status(401).json({
        message: "Invalid phone number or password",
      });
    }
  }
);

export const users = asyncErrorHandler(async (req: Request, res: Response) => {
  const users = await User.find({}, { password: 0, __v: 0 });
  res.status(200).json({
    message: "Users retrieved successfully",
    data: users,
  });
});

export const userById = asyncErrorHandler(async (req, res) => {
  const user = await User.findById(req.params.id, { password: 0, __v: 0 });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({
    message: "User retrieved successfully",
    data: user,
  });
});
