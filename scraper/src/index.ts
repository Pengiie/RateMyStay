import { PrismaClient } from "@prisma/client";
import { LivingType } from "prisma-gen";
import chalk from "chalk";
import * as figlet from "figlet";
import { nanoid } from "nanoid";
import { prisma } from "../../webapp/src/server/db";

const scrapePlace = async (campusId: string) => {
    const prisma = new PrismaClient({
        log: ["query", "error", "warn"],
    });

    const campus = await prisma.campus.findUnique({
        where: {
            id: campusId,
        },
        select: {
            address: {
                select: {
                    latitude: true,
                    longitude: true,
                },
            },
        },
    });

    if (!campus) {
        console.log("Campus not found");
        return;
    }

    const { latitude, longitude } = campus.address;

    const dorms = await searchFor("dormitory", 2000, 3, latitude, longitude);
    const apartments = await searchFor("apartment", 10000, 3, latitude, longitude);
    const townhomes = await searchFor("townhomes", 10000, 3, latitude, longitude);

    type Place = { placeId: string, type: LivingType };
    const places: Place[] = [...dorms.map(dorm => ({ placeId: dorm, type: "DORMITORY" })), 
    ...apartments.map(apartment => ({ placeId: apartment, type: "APARTMENT"})),
    ...townhomes.map(townhome => ({ placeId: townhome, type: "TOWNHOME"}))] as Place[];
    
    console.log(`Found ${dorms.length} dormitories, ${apartments.length} apartments, and ${townhomes.length} townhomes`);
    await Promise.all(places.map(place => getAndSavePlaceDetails({ id: campusId, latitude, longitude }, place.placeId, place.type)));
};

const searchFor = async (keyword: string, radius: number, pages: number, latitude: number, longitude: number): Promise<string[]> => {
    const params = new URLSearchParams();
    params.append("location", `${latitude},${longitude}`);
    params.append("radius", radius.toString());
    params.append("keyword", keyword);
    params.append("key", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!);

    const res = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`, {
        method: "GET",
    });
    const data = await res.json();
    let nextPageToken = data.next_page_token as string;

    const places = data.results as any[];

    for(let i = 0; i < (pages - 1); i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const params = new URLSearchParams();
        params.append("pagetoken", nextPageToken);
        params.append("key", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!);

        const res = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`, {
            method: "GET",
        });
        const data = await res.json();
        nextPageToken = data.next_page_token;

        places.push(...data.results);
    }

    return places.map((place) => place.place_id);
}   

const getAndSavePlaceDetails = async (campus: { id: string, latitude: number, longitude: number}, placeId: string, placeType: LivingType) => {
    const params = new URLSearchParams();
    params.append("place_id", placeId);
    params.append("fields", "name,address_components,photo,geometry,website,international_phone_number,url");
    params.append("key", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!);

    const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`, {
        method: "GET",
    });
    const data = await res.json();

    const place: google.maps.places.PlaceResult = data.result;

    const street = place.address_components?.find((component) => component.types.includes("route"))?.long_name ?? "";
    const city = place.address_components?.find((component) => component.types.includes("locality"))?.long_name!;
    const state = place.address_components?.find((component) => component.types.includes("administrative_area_level_1"))?.short_name!;
    const zip = place.address_components?.find((component) => component.types.includes("postal_code"))?.long_name!;

    const lat = place.geometry?.location!.lat! as any as number;
    const lon = place.geometry?.location!.lng! as any as number;
    const toRad = (x: number) => x * Math.PI / 180;
    const distance = BigInt(Math.ceil(Math.acos(Math.sin(toRad(lat))*Math.sin(toRad(campus.latitude))+Math.cos(toRad(lat))*Math.cos(toRad(campus.latitude))*Math.cos(toRad(campus.longitude-lon)))*6371*1000));

    if(!city || !state || !zip) 
        return;

    // Ignore international code
    const phoneNumber = place.international_phone_number?.split(" ")[1]!.replace(/\D/g, "");

    const photo = place.photos?.[0] as any;
    const photoUrl = photo && await getPhotoUrl(photo.photo_reference);

    await prisma.livingSpace.upsert({
        where: {
            placeId: placeId
        },
        update: {
            distance: distance === BigInt(0) ? BigInt(20000): distance,
            photoUrl
        },
        create: {
            id: nanoid(),
            campus: {
                connect: {
                    id: campus.id
                }
            },
            placeId: placeId,
            name: place.name!,
            type: placeType,
            website: place.website,
            phone: phoneNumber,
            photoUrl: photoUrl,
            photoAttributions: photo?.html_attributions,
            mapsUrl: place.url!,

            address: {
                create: {
                    id: nanoid(),
                    street,
                    city,
                    state,
                    zip,
                    latitude: place.geometry?.location!.lat as any as number,
                    longitude: place.geometry?.location!.lng as any as number,
                }
            }
        }
    })
}

const getPhotoUrl = async (photoReference: string): Promise<string> => {
    const params = new URLSearchParams();
    params.append("photoreference", photoReference);

    return `https://maps.googleapis.com/maps/api/place/photo?${params.toString()}`;
}

//console.log(chalk.cyan(figlet("Place Scraper", () => {})));
scrapePlace("QrXZ3z0n04YBnnNYB2Zio");