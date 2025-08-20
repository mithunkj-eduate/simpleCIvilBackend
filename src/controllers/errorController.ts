import { Request, Response, NextFunction } from "express";
import CustomError from "../Utils/CustomError";

const devErrors = (res: Response, error: any) => {
  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
    stackTrace: error.stack,
    error,
  });
};

const castErrorHandler = (err: any): CustomError => {
  const msg = `Invalid value for ${err.path}: ${err.value}`;
  return new CustomError(msg, 400);
};

const duplicateKeyErrorHandler = (err: any): CustomError => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const msg = `Duplicate value for field "${field}": "${value}". Please use a different value.`;
  return new CustomError(msg, 400);
};

const validationErrorHandler = (err: any): CustomError => {
  const errors = Object.values(err.errors).map((val: any) => val.message);
  const msg = `Invalid input data: ${errors.join(". ")}`;
  return new CustomError(msg, 400);
};

const prodErrors = (res: Response, error: any) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong! Please try again later.",
    });
  }
};

export default (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    devErrors(res, error);
  } else if (process.env.NODE_ENV === "production") {
    if (error.name === "CastError") {
      error = castErrorHandler(error);
    }
    if (error.code === 11000) {
      error = duplicateKeyErrorHandler(error);
    }
    if (error.name === "ValidationError") {
      error = validationErrorHandler(error);
    }
    prodErrors(res, error);
  }
};
