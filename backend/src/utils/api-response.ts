import type { Response } from "express"

/**
 * One shape for every API response:
 *   success → { status: true,  message, data? }
 *   error   → { status: false, message }
 * The HTTP status code is set on the response itself.
 */
export type ApiResponseBody<T = unknown> = {
  status: boolean
  message: string
  data?: T
}

export class ApiResponse {
  /** `ApiResponse.success(res, "Category created", category, 201)` */
  static success<T>(res: Response, message: string, data?: T, statusCode = 200) {
    const body: ApiResponseBody<T> = { status: true, message }
    if (data !== undefined) body.data = data
    res.status(statusCode).json(body)
  }

  /** Routes usually `throw new ApiError(...)`; the error handler calls this. */
  static error(res: Response, message: string, statusCode = 500) {
    const body: ApiResponseBody = { status: false, message }
    res.status(statusCode).json(body)
  }
}
