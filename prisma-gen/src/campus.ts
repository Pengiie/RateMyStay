import * as z from "zod"
import { CompleteAddress, relatedAddressSchema, CompleteUniversity, relatedUniversitySchema, CompleteLivingSpace, relatedLivingSpaceSchema } from "./index"

export const campusSchema = z.object({
  id: z.string(),
  name: z.string(),
  addressId: z.string(),
  universityId: z.string(),
})

export interface CompleteCampus extends z.infer<typeof campusSchema> {
  address: CompleteAddress
  university: CompleteUniversity
  livingSpaces: CompleteLivingSpace[]
}

/**
 * relatedCampusSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedCampusSchema: z.ZodSchema<CompleteCampus> = z.lazy(() => campusSchema.extend({
  address: relatedAddressSchema,
  university: relatedUniversitySchema,
  livingSpaces: relatedLivingSpaceSchema.array(),
}))
