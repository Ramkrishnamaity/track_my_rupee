/**
 * An error with an HTTP status, safe to show to the client.
 * Throw it from any route: `throw new ApiError(404, "Category not found")`.
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}
