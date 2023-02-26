import * as z from 'zod';

declare const userSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    email: string;
}, {
    id: string;
    name: string;
    email: string;
}>;

declare const universitySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
}, {
    id: string;
    name: string;
}>;
interface CompleteUniversity extends z.infer<typeof universitySchema> {
    campuses: CompleteCampus[];
}
/**
 * relatedUniversitySchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
declare const relatedUniversitySchema: z.ZodSchema<CompleteUniversity>;

declare const campusSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    addressId: z.ZodString;
    universityId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    addressId: string;
    universityId: string;
}, {
    id: string;
    name: string;
    addressId: string;
    universityId: string;
}>;
interface CompleteCampus extends z.infer<typeof campusSchema> {
    address: CompleteAddress;
    university: CompleteUniversity;
    livingSpaces: CompleteLivingSpace[];
}
/**
 * relatedCampusSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
declare const relatedCampusSchema: z.ZodSchema<CompleteCampus>;

declare const livingSpaceSchema: z.ZodObject<{
    id: z.ZodString;
    placeId: z.ZodString;
    name: z.ZodString;
    distance: z.ZodBigInt;
    website: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    photoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    photoAttributions: z.ZodArray<z.ZodString, "many">;
    mapsUrl: z.ZodString;
    type: z.ZodString;
    addressId: z.ZodString;
    campusId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    website?: string | null | undefined;
    phone?: string | null | undefined;
    photoUrl?: string | null | undefined;
    id: string;
    name: string;
    type: string;
    addressId: string;
    placeId: string;
    distance: bigint;
    photoAttributions: string[];
    mapsUrl: string;
    campusId: string;
}, {
    website?: string | null | undefined;
    phone?: string | null | undefined;
    photoUrl?: string | null | undefined;
    id: string;
    name: string;
    type: string;
    addressId: string;
    placeId: string;
    distance: bigint;
    photoAttributions: string[];
    mapsUrl: string;
    campusId: string;
}>;
interface CompleteLivingSpace extends z.infer<typeof livingSpaceSchema> {
    address: CompleteAddress;
    campus: CompleteCampus;
    pricings: CompletePricing[];
}
/**
 * relatedLivingSpaceSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
declare const relatedLivingSpaceSchema: z.ZodSchema<CompleteLivingSpace>;

declare const pricingSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    price: z.ZodNumber;
    livingSpaceId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    price: number;
    livingSpaceId: string;
}, {
    id: string;
    name: string;
    price: number;
    livingSpaceId: string;
}>;
interface CompletePricing extends z.infer<typeof pricingSchema> {
    livingSpace: CompleteLivingSpace;
}
/**
 * relatedPricingSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
declare const relatedPricingSchema: z.ZodSchema<CompletePricing>;

declare const addressSchema: z.ZodObject<{
    id: z.ZodString;
    street: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    zip: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    latitude: number;
    longitude: number;
}, {
    id: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    latitude: number;
    longitude: number;
}>;
interface CompleteAddress extends z.infer<typeof addressSchema> {
    campuses: CompleteCampus[];
    livingSpaces: CompleteLivingSpace[];
}
/**
 * relatedAddressSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
declare const relatedAddressSchema: z.ZodSchema<CompleteAddress>;

type LivingType = "DORMITORY" | "APARTMENT" | "TOWNHOME";

export { CompleteAddress, CompleteCampus, CompleteLivingSpace, CompletePricing, CompleteUniversity, LivingType, addressSchema, campusSchema, livingSpaceSchema, pricingSchema, relatedAddressSchema, relatedCampusSchema, relatedLivingSpaceSchema, relatedPricingSchema, relatedUniversitySchema, universitySchema, userSchema };
