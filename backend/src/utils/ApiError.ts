// src/utils/ApiError.ts
class ApiError extends Error {
  statusCode: number;
  data: any | null;
  success: boolean;
  errors: any[];

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: any[] = [],
    stack: string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      data: this.data,
      message: this.message, // 👈 নিশ্চিতভাবে আসবে
      success: this.success,
      errors: this.errors,
    };
  }
}

export { ApiError };

