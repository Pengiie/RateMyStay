// src/user.ts
import * as z from "zod";
var userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string()
});

// src/university.ts
import * as z2 from "zod";
var universitySchema = z2.object({
  id: z2.string(),
  name: z2.string()
});
var relatedUniversitySchema = z2.lazy(() => universitySchema.extend({
  campuses: relatedCampusSchema.array()
}));

// src/campus.ts
import * as z3 from "zod";
var campusSchema = z3.object({
  id: z3.string(),
  name: z3.string(),
  addressId: z3.string(),
  universityId: z3.string()
});
var relatedCampusSchema = z3.lazy(() => campusSchema.extend({
  address: relatedAddressSchema,
  university: relatedUniversitySchema,
  livingSpaces: relatedLivingSpaceSchema.array()
}));

// src/livingspace.ts
import * as z4 from "zod";
var livingSpaceSchema = z4.object({
  id: z4.string(),
  placeId: z4.string(),
  name: z4.string(),
  website: z4.string().nullish(),
  phone: z4.string().nullish(),
  photoUrl: z4.string().nullish(),
  photoAttributions: z4.string().array(),
  mapsUrl: z4.string(),
  type: z4.string(),
  addressId: z4.string(),
  campusId: z4.string()
});
var relatedLivingSpaceSchema = z4.lazy(() => livingSpaceSchema.extend({
  address: relatedAddressSchema,
  campus: relatedCampusSchema,
  pricings: relatedPricingSchema.array()
}));

// src/pricing.ts
import * as z5 from "zod";
var pricingSchema = z5.object({
  id: z5.string(),
  name: z5.string(),
  price: z5.number(),
  livingSpaceId: z5.string()
});
var relatedPricingSchema = z5.lazy(() => pricingSchema.extend({
  livingSpace: relatedLivingSpaceSchema
}));

// src/address.ts
import * as z6 from "zod";
var addressSchema = z6.object({
  id: z6.string(),
  street: z6.string(),
  city: z6.string(),
  state: z6.string(),
  zip: z6.string(),
  latitude: z6.number(),
  longitude: z6.number()
});
var relatedAddressSchema = z6.lazy(() => addressSchema.extend({
  campuses: relatedCampusSchema.array(),
  livingSpaces: relatedLivingSpaceSchema.array()
}));
export {
  addressSchema,
  campusSchema,
  livingSpaceSchema,
  pricingSchema,
  relatedAddressSchema,
  relatedCampusSchema,
  relatedLivingSpaceSchema,
  relatedPricingSchema,
  relatedUniversitySchema,
  universitySchema,
  userSchema
};
//# sourceMappingURL=index.js.map