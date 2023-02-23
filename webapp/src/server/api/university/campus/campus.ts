import { TRPCError } from "@trpc/server";
import { connect } from "http2";
import { nanoid } from "nanoid";
import { URLSearchParams } from "url";
import { z } from "zod";
import {
    addressSchema,
    campusSchema,
} from "../../../../../../prisma/generator/models";
import { createRouter } from "../../trpc";
import { baseProcedure } from "../../trpc";

export const campusRouter = createRouter({
    add: baseProcedure
        .input(
            campusSchema
                .pick({ name: true, universityId: true })
                .extend({ address: z.object({
                    placeId: z.string(),
                })})
        )
        .mutation(async ({ input, ctx }) => {
            
            console.log(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${input.address.placeId}&fields=formatted_address&key=${process.env.GOOGLE_MAPS_API_KEY}`);

            const params = new URLSearchParams();
            params.append("place_id", input.address.placeId);
            params.append("fields", ["name","website","international_phone_number","address_components","adr_address","geometry"].join(","));
            params.append("key", process.env.GOOGLE_MAPS_API_KEY!);
            const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`);
            if(!res.ok) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Could not fetch address details."});
            }
            
            const { result: { address_components, adr_address, geometry } }: { result: google.maps.places.PlaceResult} = await res.json();
            
            const street = address_components!.find((c) => c.types.includes("route"))?.long_name ?? "";
            const city = address_components!.find((c) => c.types.includes("locality"))!.long_name;
            const state = address_components!.find((c) => c.types.includes("administrative_area_level_1"))!.long_name;
            const zip = address_components!.find((c) => c.types.includes("postal_code"))!.long_name;
            const latitude = geometry!.location!.lat as any as number;
            const longitude = geometry!.location!.lng as any as number;

            return await ctx.prisma.campus.create({
                data: {
                    id: nanoid(),
                    name: input.name,
                    university: {
                        connect: {
                            id: input.universityId,
                        }
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
                        }
                    }
                },
            });
        }),
});
