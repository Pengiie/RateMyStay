"use client";

import {
    ArrowTopRightOnSquareIcon,
    GlobeAltIcon,
    MapPinIcon,
    PhoneIcon,
} from "@heroicons/react/24/outline";
import { RouterOutput } from "../trpc";
import Image from "next/image";
import { useState } from "react";

export type Places = RouterOutput["university"]["campus"]["places"]["search"];

function PlaceImage({ src }: { src: string }) {
    const [loaded, setLoaded] = useState(true);

    return (
        <div className="w-full h-full">
            <Image
                src={src}
                fill
                alt={""}
                className={`object-cover ${loaded ? "block" : "hidden"}`}
                onLoadingComplete={() => setLoaded(true)}
            />
            <div className={`h-full w-full bg-gray-200 ${loaded ? "block" : "hidden"}`} />
        </div>
    );
}

type Props = {
    places: Places;
};

export function PlacesList({ places }: Props) {
    return (
        <>
            {places.map((place) => (
                <div key={place.id} className="flex flex-col gap-1">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <h2 className="text-3xl font-medium leading-none">
                                {place.name}
                            </h2>
                            <a href={place.mapsUrl}>
                                <ArrowTopRightOnSquareIcon
                                    width={32}
                                    height={32}
                                />
                            </a>
                        </div>
                        <div className="h-[1px] flex-grow bg-gray-400" />
                        <p className="text-2xl font-light">
                            {`(${(Number(place.distance) * 0.000621371).toFixed(
                                2
                            )} mi)`}
                        </p>
                    </div>
                    <h3 className="text-lg capitalize text-gray-600">
                        {place.type}
                    </h3>
                    <div className="flex gap-4">
                        <div className="relative h-[312px] w-[448px]">
                            {place.photoUrl ? (
                                <PlaceImage
                                    src={`${place.photoUrl}&maxwidth=448&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                                />
                            ) : (
                                <div className="h-full w-full bg-gray-200" />
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <MapPinIcon width={24} height={24} />
                                <a
                                    href={place.mapsUrl}
                                    target="_blank"
                                    className="text-base hover:underline"
                                >{`${place.address.street} ${place.address.city}, ${place.address.state} ${place.address.zip}`}</a>
                            </div>
                            {place.website && (
                                <div className="flex items-center gap-2">
                                    <GlobeAltIcon width={24} height={24} />
                                    <a
                                        href={place.website}
                                        target="_blank"
                                        className="text-base text-blue-500 hover:underline"
                                    >
                                        {
                                            place.website
                                                .split("//")[1]!
                                                .split("/")[0]
                                        }
                                    </a>
                                </div>
                            )}
                            {place.phone && (
                                <div className="flex items-center gap-2">
                                    <PhoneIcon width={24} height={24} />
                                    <a
                                        href={`phone:${place.phone}`}
                                        target="_blank"
                                        className="text-base hover:underline"
                                    >{`(${place.phone.substring(
                                        0,
                                        3
                                    )}) ${place.phone.substring(
                                        4,
                                        7
                                    )}-${place.phone.substring(7, 10)}`}</a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}
