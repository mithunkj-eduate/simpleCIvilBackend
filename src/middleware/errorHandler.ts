import { NextFunction, Request, Response } from "express";
import errorCode from "../constants/errorCodes";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let stausCode = res.statusCode ? res.statusCode : 500;
  if (err?.code) {
    stausCode = Number(err.code);
  }

  switch (stausCode) {
    case errorCode.BAD_REQUEST:
      res.json({
        title: "Validation error",
        message: err.message,
      });
    case errorCode.NOT_FOUND:
      res.json({
        title: "NOT_FOUND",
        message: err.message,
      });
    case errorCode.UN_AUTH:
      res.status(401).json({
        title: "un authorized",
        message: err.Error,
      });
    case errorCode.INTERNAL_SERVER:
      res.json({
        title: "internal server error",
        message: err.message,
      });
    default:
      res.status(500).json({
        title: "internal server error",
        message: err.message,
      });
  }
};

export default errorHandler 
