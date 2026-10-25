import { z } from "zod"

const typeSchema = z.union([z.literal(1), z.literal(2)], {
  error: "type must be 1 (income) or 2 (expense)",
})
const statusSchema = z.union([z.literal(0), z.literal(1)], {
  error: "status must be 0 (inactive) or 1 (active)",
})
const nameSchema = z.string().trim().min(1, "name is required").max(20, "name can be at most 20 characters")
const colourCodeSchema = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "colourCode must be a hex colour like #3B82F6")

/** GET /categories?type=2&status=1&page=1&limit=10 (query values arrive as strings) */
export const listCategoriesQuery = z.object({
  type: z.coerce.number().pipe(typeSchema).optional(),
  status: z.coerce.number().pipe(statusSchema).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

/** GET /categories/all?type=0|1|2 (0 = all types) for dropdowns, no pagination */
export const allCategoriesQuery = z.object({
  type: z.coerce
    .number()
    .pipe(
      z.union([z.literal(0), z.literal(1), z.literal(2)], {
        error: "type must be 0 (all), 1 (income) or 2 (expense)",
      })
    )
    .default(0),
})

/** POST /categories (new categories are active) */
export const createCategoryBody = z.strictObject({
  name: nameSchema,
  type: typeSchema,
  colourCode: colourCodeSchema,
})

/** PATCH /categories/:id (type can't change after creation) */
export const updateCategoryBody = z
  .strictObject({
    name: nameSchema.optional(),
    colourCode: colourCodeSchema.optional(),
  })
  .refine((body) => body.name !== undefined || body.colourCode !== undefined, {
    error: "Send name and/or colourCode to update",
  })

/** PATCH /categories/:id/status */
export const updateCategoryStatusBody = z.strictObject({ status: statusSchema })

export const categoryIdParams = z.object({
  id: z.coerce
    .number({ error: "Invalid category id" })
    .int("Invalid category id")
    .positive("Invalid category id"),
})

// Types of the cleaned values that reach the middlewares/controllers after `validate`.
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuery>
export type AllCategoriesQuery = z.infer<typeof allCategoriesQuery>
export type CreateCategoryBody = z.infer<typeof createCategoryBody>
export type UpdateCategoryBody = z.infer<typeof updateCategoryBody>
export type UpdateCategoryStatusBody = z.infer<typeof updateCategoryStatusBody>
export type CategoryIdParams = z.infer<typeof categoryIdParams>
