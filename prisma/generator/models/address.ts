import * as z from "zod"
import { CompleteCampus, relatedCampusSchema, CompleteLivingSpace, relatedLivingSpaceSchema } from "./index"

export const addressSchema = z.object({
  id: z.string(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  latitude: z.number(),
  longitude: z.number(),
})

export interface CompleteAddress extends z.infer<typeof addressSchema> {
  campuses: CompleteCampus[]
  livingSpaces: CompleteLivingSpace[]
}

/**
 * relatedAddressSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedAddressSchema: z.ZodSchema<CompleteAddress> = z.lazy(() => addressSchema.extend({
  campuses: relatedCampusSchema.array(),
  livingSpaces: relatedLivingSpaceSchema.array(),
}))
