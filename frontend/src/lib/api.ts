import axios, { type AxiosRequestConfig, isAxiosError } from "axios"

/** Where the browser calls the API: this same site. */
export const API_PATH = "/api/v1"

/** Every API response has this shape. */
export type ApiResponse<T = unknown> = {
  status: boolean
  message: string
  data?: T
}

/** `data` of list endpoints with paging, e.g. GET /categories. */
export type Paginated<T> = {
  items: T[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

/** Thrown for any failed request. `message` is safe to show to the user. */
export class ApiError extends Error {
  constructor(
    message: string,
    /** HTTP status, e.g. 401, 404, 500; undefined when the API couldn't be reached */
    public readonly statusCode?: number
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/** Turns any axios failure into an ApiError with a readable message. */
function toApiError(error: unknown): ApiError {
  if (isAxiosError<ApiResponse>(error)) {
    if (error.response) {
      return new ApiError(error.response.data?.message ?? "Something went wrong", error.response.status)
    }
    if (error.code === "ECONNABORTED") return new ApiError("The request timed out, please try again")
    return new ApiError("Can't reach the server, please check your connection")
  }
  return new ApiError("Something went wrong")
}

/**
 * Builds an API client. In the browser use the shared `api` below; on the
 * Next.js server use `getServerApi()` from "@/lib/api-server" (it adds the cookie).
 */
export function createApiClient(config: AxiosRequestConfig = {}) {
  const http = axios.create({
    // Browser: this same site (the cookie is sent automatically). The Next.js server passes
    // the real backend URL instead (see getServerApi).
    baseURL: API_PATH,
    timeout: 15_000,
    ...config,
  })

  http.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(toApiError(error))
  )

  // Each method returns the API body: { status, message, data }
  return {
    get: async <T>(url: string, options?: AxiosRequestConfig) =>
      (await http.get<ApiResponse<T>>(url, options)).data,
    post: async <T>(url: string, body?: unknown, options?: AxiosRequestConfig) =>
      (await http.post<ApiResponse<T>>(url, body, options)).data,
    put: async <T>(url: string, body?: unknown, options?: AxiosRequestConfig) =>
      (await http.put<ApiResponse<T>>(url, body, options)).data,
    patch: async <T>(url: string, body?: unknown, options?: AxiosRequestConfig) =>
      (await http.patch<ApiResponse<T>>(url, body, options)).data,
    delete: async <T>(url: string, options?: AxiosRequestConfig) =>
      (await http.delete<ApiResponse<T>>(url, options)).data,
  }
}

/** An API client: the browser one below, or the server one from getServerApi(). */
export type ApiClient = ReturnType<typeof createApiClient>

/**
 * For Client Components (event handlers, forms):
 *   const { data } = await api.get<Category[]>("/categories")
 *   await api.post("/categories", { name, type, color })
 */
export const api = createApiClient()
