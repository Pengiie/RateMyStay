"use client";

import {
    MagnifyingGlassIcon,
    ArrowTopRightOnSquareIcon,
    MapPinIcon,
    PhoneIcon,
    GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { campusSchema } from "prisma-gen";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CampusInput from "../components/form/CampusInput";
import Navbar from "../components/Navbar";
import { RouterOutput, trpc, trpcClient } from "../trpc";

type Places = RouterOutput["university"]["campus"]["places"]["search"];

const formSchema = z.object({
    campus: campusSchema
});

type FormData = z.infer<typeof formSchema>;

export default function Search() {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    const [places, setPlaces] = useState<Places>([]);
    const [loading, setLoading] = useState(false);

    const campuses = trpc.university.campus.getAll.useQuery();

    const onSubmit = form.handleSubmit((data) => {
        trpcClient.university.campus.places.search
            .query({
                campusId: data.campus.id,
            })
            .then((res) => {
                setPlaces(res);
                setLoading(false);
            });
        setLoading(true);
    });
    useEffect(() => {
        window.removeEventListener("scroll", () => {});
        window.addEventListener("scroll", () => {
            if (
                window.scrollY + window.innerHeight >=
                    document.body.offsetHeight &&
                places.length > 0 &&
                !loading
            ) {
                setLoading(true);
                trpcClient.university.campus.places.search
                    .query({
                        campusId: "OQCG8qrGMp6V0WSaPXGpI",
                        cursor: places[places.length - 1]!.id,
                    })
                    .then((res) => {
                        setPlaces([...places, ...res]);
                        setLoading(false);
                    });
            }
        });
    }, [places, loading]);

    return (
        <>
            <Navbar />
            <main className="mt-44 mb-24 flex flex-col gap-4 px-32">
                <h1 className="text-4xl">Living Spaces</h1>
                <div className="grid-cols-[1fr minmax(36rem, 30%)] grid gap-8">
                    <form onSubmit={onSubmit} className="flex gap-4">
                        <div className="flex flex-grow flex-row">
                            <div className="flex flex-grow items-center rounded-md border border-gray-400 bg-gray-100">
                                <MagnifyingGlassIcon
                                    width={24}
                                    height={24}
                                    className="ml-4"
                                />
                                <CampusInput name="campus" control={form.control} campuses={campuses.data ?? []}/>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <input
                                type="submit"
                                className="w-fit rounded-lg bg-secondary-800 px-8 py-4 text-white hover:cursor-pointer hover:bg-secondary-900 disabled:cursor-not-allowed disabled:hover:bg-secondary-600"
                                value={"Search"}
                            />
                        </div>
                    </form>
                    {places.length > 0 && <p>{`Showing ${places.length} places`}</p>}
                    <div className="flex flex-col gap-16">
                        {places.map((place) => (
                            <div key={place.id} className="flex flex-col gap-1">
                                <div>
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
                                </div>
                                <h3 className="text-lg capitalize text-gray-600">
                                    {place.type}
                                </h3>
                                <div className="flex gap-4">
                                    <div className="relative h-[312px] w-[448px]">
                                        {place.photoUrl ? (
                                            <Image
                                                src={`${place.photoUrl}&maxwidth=448`}
                                                fill
                                                alt={""}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-gray-200" />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <MapPinIcon
                                                width={24}
                                                height={24}
                                            />
                                            <a
                                                href={place.mapsUrl}
                                                target="_blank"
                                                className="text-base hover:underline"
                                            >{`${place.address.street} ${place.address.city}, ${place.address.state} ${place.address.zip}`}</a>
                                        </div>
                                        {place.website && (
                                            <div className="flex items-center gap-2">
                                                <GlobeAltIcon
                                                    width={24}
                                                    height={24}
                                                />
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
                                                <PhoneIcon
                                                    width={24}
                                                    height={24}
                                                />
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
                                                )}-${place.phone.substring(
                                                    7,
                                                    10
                                                )}`}</a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {loading && (
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-4 border-gray-400 border-t-secondary-800" />
                    )}
                </div>
            </main>
        </>
    );
}
