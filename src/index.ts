import express, { Request, Response, NextFunction } from "express";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./db/connectDb";
import verifyToken, { AuthRequest } from "./helpers/verifyjwt";
import globalErrorHandler from "./controllers/errorController";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Monkey patch route registration logging
["use", "get", "post", "put", "delete", "all"].forEach((method) => {
  const original = (app as any)[method];
  (app as any)[method] = function (...args: any[]) {
    const firstArg = args[0];

    const isPath =
      typeof firstArg === "string" ||
      firstArg instanceof RegExp ||
      (Array.isArray(firstArg) &&
        firstArg.every((p) => typeof p === "string" || p instanceof RegExp));

    if (isPath) {
      console.log(
        `✅ Registered route: app.${method}(${JSON.stringify(firstArg)})`
      );
    } else {
      console.log(`✅ Registered route: app.${method}(<implicit path>)`);
    }

    return original.apply(this, args);
  };
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("UNCAUGHT EXCEPTION!  Shutting down 1...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Connect to database
connectDB();

// CORS options
const corsOptions: cors.CorsOptions = {
  origin: [
    "http://192.168.1.3:3000",
    "http://192.168.1.4:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost",
  ],
  credentials: true,
  exposedHeaders: ["set-cookie"],
};

// Middlewares
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

import userRoute from "./routes/userRoute";
import asyncErrorHandler from "./Utils/asyncErrorHandler";
import User from "./models/userModel";
import storeRoute from "./routes/storeRoute";
import categoryRoute from "./routes/categoryRoute";
import productRoute from "./routes/productRoute";
import orderRoute from "./routes/orderRoute";
import commenRoute from "./routes/commenRoute";
import cartRoute from "./routes/cartRoute";
import paymentRoute from "./routes/paymentRoute";

// Test route
app.get("/api", (req: Request, res: Response) => {
  res.send("Hello, server is running.");
});

app.use("/api/users", userRoute);
app.use("/api/commen/products", commenRoute);

// Protect routes after this middleware
app.use(verifyToken);

app.use("/api/carts", cartRoute);
app.use("/api/stores", storeRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/payments", paymentRoute);

// verify user
app.get(
  "/api/user/verify",
  asyncErrorHandler(async (req: AuthRequest, res: Response) => {
    console.log("verify",req.user)
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    const user = await User.findById(req.user.userId, { password: 0, __v: 0 });

    res.status(200).json({
      message: "User verified successfully",
      data: user,
    });
  })
);

app.post(
  "/api/user/logout",
  asyncErrorHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    res.status(200).json({ message: "User logged out successfully" });
  })
);

// // Handle unknown routes
// app.all("*", (req: Request, res: Response, next: NextFunction) => {
//   const err = new CustomError(
//     `Couldn't find any API with URL ${req.originalUrl} on this server.`,
//     404
//   );
//   console.log(err);
//   next(err);
// });

// Global error handler
app.use(globalErrorHandler);

// Start server
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`, new Date().toISOString());
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: any) => {
  console.error("UNHANDLED REJECTION! Shutting down 2...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
