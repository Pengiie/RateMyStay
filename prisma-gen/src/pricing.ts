import * as z from "zod"
import { CompleteLivingSpace, relatedLivingSpaceSchema } from "./index"

export const pricingSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  livingSpaceId: z.string(),
})

export interface CompletePricing extends z.infer<typeof pricingSchema> {
  livingSpace: CompleteLivingSpace
}

/**
 * relatedPricingSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedPricingSchema: z.ZodSchema<CompletePricing> = z.lazy(() => pricingSchema.extend({
  livingSpace: relatedLivingSpaceSchema,
}))
