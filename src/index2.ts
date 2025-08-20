// import express, { Request, Response } from "express";
// import connectDB from "./db/connectDb";
// import bodyParser from "body-parser";
// import path from "path";
// const app = express();
// import cookieParser from "cookie-parser";
// import { errorHandler } from "./middleware/errorHandler";
// // import verifyToken from "./helpers/verifyjwt"
// // import authroles from "./helpers/authroles"
// import cors from "cors";
// import morgan from "morgan";
// // import { Verifyrefreshtoken } from "./helpers/Verifyrefreshtoken"
// //port config
// import * as dotenv from "dotenv";

// dotenv.config();

// const port = process.env.PORT || 8000;

// let corsOptions = {};
// if (process.env.NODE_ENV === "production") {
//   corsOptions = {
//     origin: ["https://smi.com", "https://www.smi.com"],
//     credentials: true,
//     exposedHeaders: ["set-cookie"],
//   };
// } else if (process.env.NODE_ENV === "development") {
//   corsOptions = {
//     origin: [
//       "http://127.0.0.1:3000",
//       "http://localhost:3000",
//       "http://localhost",
//     ],
//     credentials: true,
//     exposedHeaders: ["set-cookie"],
//   };
// }

// app.use(cors(corsOptions));
// app.use(cookieParser());
// //connect to database
// connectDB();

// //using middleware
// app.use(express.json());
// app.use(
//   morgan(":method :url :status :res[content-length] - :response-time ms")
// );
// app.use("/api/public", express.static(path.join(__dirname, "public")));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.get("/api", (req, res) => {
//   res.send("hello");
// });
// // //public routes
// // app.use("/api/user", require("./routes/authRoute"));
// // app.use("/api/public", require("./routes/publicRoute"));

// // //verify user is logged in or not
// // app.use(Verifyrefreshtoken); //verify refresh token
// // app.use(verifyToken); // verify access token

// // //protected routes
// // app.use("/api/order", require("./routes/orderRoute"));

// // // app.use(authroles);
// // //admin routes
// // app.use("/api/admin", require("./routes/adminRoute"));
// // app.use("/api/product", require("./routes/productRoutes"));
// // app.use("/api/category", require("./routes/categoryRoute"));

// app.all("*", (req: Request, res: Response) => {
//   res.status(404).json({
//     message: `coudn't found any api with ${req.originalUrl} url on this server`,
//   });
// });

// //using error handler
// app.use(errorHandler);

// app.listen(port, () => {
//   console.log("app start listnening on port " + port);
// });
console.log("Server is running on port " );