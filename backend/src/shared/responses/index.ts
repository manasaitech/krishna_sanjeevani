import { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

export const ApiResponse = {
  success<T>(c: Context, data: T, message = "Success", status: ContentfulStatusCode = 200) {
    return c.json(
      {
        success: true,
        message,
        data,
      },
      status
    );
  },

  error(c: Context, message = "Error occurred", status: ContentfulStatusCode = 400, errors: any[] = []) {
    return c.json(
      {
        success: false,
        message,
        errors,
      },
      status
    );
  },
};
