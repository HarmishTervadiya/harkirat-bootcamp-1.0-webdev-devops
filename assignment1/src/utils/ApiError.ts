class ApiError extends Error {
  statusCode: number;
  success: false;
  data: null;
  error: string;

  constructor(
    statusCode: number,
    message = "Something went wrong",
    errors: string,
    stack = "",
  ) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.data = null;
    this.error = errors;
    this.message = message;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
