import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps async route handlers and passes any thrown errors to next()
 */
const asyncErrorHandler = (
  func: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};

export default asyncErrorHandler;
