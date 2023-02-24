import * as z from "zod"
import { CompleteCampus, relatedCampusSchema } from "./index"

export const universitySchema = z.object({
  id: z.string(),
  name: z.string(),
})

export interface CompleteUniversity extends z.infer<typeof universitySchema> {
  campuses: CompleteCampus[]
}

/**
 * relatedUniversitySchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedUniversitySchema: z.ZodSchema<CompleteUniversity> = z.lazy(() => universitySchema.extend({
  campuses: relatedCampusSchema.array(),
}))
