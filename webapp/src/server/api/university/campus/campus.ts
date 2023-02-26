import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { URLSearchParams } from "url";
import { z } from "zod";
import type { LivingType } from "prisma-gen";
import {
    addressSchema,
    campusSchema,
    livingSpaceSchema,
    universitySchema,
} from "prisma-gen";
import { createRouter } from "../../trpc";
import { baseProcedure } from "../../trpc";

const PLACES_PER_PAGE = 20;

export const campusRouter = createRouter({
    add: baseProcedure
        .input(
            campusSchema.pick({ name: true, universityId: true }).extend({
                address: z.object({
                    placeId: z.string(),
                }),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const params = new URLSearchParams();
            params.append("place_id", input.address.placeId);
            params.append(
                "fields",
                [
                    "name",
                    "website",
                    "international_phone_number",
                    "address_components",
                    "adr_address",
                    "geometry",
                ].join(",")
            );
            params.append("key", process.env.GOOGLE_MAPS_API_KEY!);
            const res = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`
            );
            if (!res.ok) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Could not fetch address details.",
                });
            }

            const {
                result: { address_components, geometry },
            } = (await res.json()) as {
                result: google.maps.places.PlaceResult;
            };

            if (!address_components || !geometry)
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

            const street =
                address_components.find((c) => c.types.includes("route"))
                    ?.long_name ?? "";
            const city =
                address_components.find((c) => c.types.includes("locality"))
                    ?.long_name ?? "";
            const state =
                address_components.find((c) =>
                    c.types.includes("administrative_area_level_1")
                )?.long_name ?? "";
            const zip =
                address_components.find((c) => c.types.includes("postal_code"))
                    ?.long_name ?? "";
            // eslint-disable-next-line @typescript-eslint/unbound-method
            const latitude = geometry?.location?.lat as unknown as number;
            // eslint-disable-next-line @typescript-eslint/unbound-method
            const longitude = geometry?.location?.lng as unknown as number;

            return await ctx.prisma.campus.create({
                data: {
                    id: nanoid(),
                    name: input.name,
                    university: {
                        connect: {
                            id: input.universityId,
                        },
                    },
                    address: {
                        create: {
                            id: nanoid(),
                            street,
                            city,
                            state,
                            zip,
                            latitude,
                            longitude,
                        },
                    },
                },
            });
        }),
    getAll: baseProcedure
        .output(z.array(campusSchema.extend({ university: universitySchema })))
        .query(async ({ ctx }) => {
            return await ctx.prisma.campus.findMany({
                include: {
                    university: true,
                },
            });
        }),
    places: createRouter({
        search: baseProcedure
            .input(
                z.object({
                    campusId: z.string(),
                    options: z
                        .object({
                            // Rating: 0 to 5
                            rating: z.object({
                                min: z.number(),
                                max: z.number(),
                            }),
                            // Price: 100 to 10000
                            price: z.object({
                                min: z.number(),
                                max: z.number(),
                            }),
                            // Distance: 0 to 50000 (meters)
                            distance: z.object({
                                min: z.number(),
                                max: z.number(),
                            }),
                            sorting: z.array(
                                z.object({
                                    key: z.enum([
                                        "rating",
                                        "price",
                                        "distance",
                                    ]),
                                    order: z.enum(["asc", "dsc"]),
                                })
                            ),
                            type: z.array(
                                z.enum<
                                    LivingType,
                                    [LivingType, ...LivingType[]]
                                >(["DORMITORY", "APARTMENT", "TOWNHOME"])
                            ),
                        })
                        .deepPartial()
                        .default({
                            rating: { min: 0, max: 5 },
                            price: { min: 100, max: 10000 },
                            distance: { min: 0, max: 50000 },
                            sorting: [{ key: "distance", order: "dsc" }],
                            type: ["DORMITORY", "APARTMENT", "TOWNHOME"],
                        }),
                    page: z.number(),
                })
            )
            .output(
                z.array(
                    livingSpaceSchema.extend({
                        address: addressSchema,
                    })
                )
            )
            .query(async ({ input, ctx }) => {
                return await ctx.prisma.livingSpace.findMany({
                    where: {
                        campusId: input.campusId,
                        type: { in: input.options.type },
                    },
                    include: {
                        address: true,
                    },
                    take: PLACES_PER_PAGE,
                    skip: input.page * PLACES_PER_PAGE,
                    orderBy: {
                        distance: "asc",
                    },
                });
            }),
    }),
});
