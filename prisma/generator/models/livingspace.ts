import * as z from "zod"
import { LivingType } from "@prisma/client"
import { CompleteAddress, relatedAddressSchema, CompleteCampus, relatedCampusSchema, CompletePricing, relatedPricingSchema } from "./index"

export const livingSpaceSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  name: z.string(),
  website: z.string().nullish(),
  phone: z.string().nullish(),
  photoUrl: z.string().nullish(),
  photoAttributions: z.string().array(),
  mapsUrl: z.string(),
  type: z.nativeEnum(LivingType),
  addressId: z.string(),
  campusId: z.string(),
})

export interface CompleteLivingSpace extends z.infer<typeof livingSpaceSchema> {
  address: CompleteAddress
  campus: CompleteCampus
  pricings: CompletePricing[]
}

/**
 * relatedLivingSpaceSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedLivingSpaceSchema: z.ZodSchema<CompleteLivingSpace> = z.lazy(() => livingSpaceSchema.extend({
  address: relatedAddressSchema,
  campus: relatedCampusSchema,
  pricings: relatedPricingSchema.array(),
}))
