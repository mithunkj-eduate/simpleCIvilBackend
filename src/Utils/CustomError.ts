class CustomError extends Error {
  statusCode: number;
  status: "fail" | "error";
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true;

    // Maintains proper stack trace for where error was thrown (only available in V8)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
