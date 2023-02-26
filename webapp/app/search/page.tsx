"use client";

import { Menu, Popover } from "@headlessui/react";
import {
    MagnifyingGlassIcon,
    ArrowTopRightOnSquareIcon,
    MapPinIcon,
    PhoneIcon,
    GlobeAltIcon,
    ArrowDownIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";

import { campusSchema, LivingType } from "prisma-gen";
import React, { memo } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RecordType } from "zod/lib";
import CampusInput from "../components/form/CampusInput";
import Navbar from "../components/Navbar";
import { RouterInput, RouterOutput, trpc, trpcClient } from "../trpc";
import { PlacesList, Places } from "./PlacesList";

const formSchema = z.object({
    campus: campusSchema,
    dormitory: z.boolean(),
    apartment: z.boolean(),
    townhouse: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

let lastOptions: {
    options: RouterInput["university"]["campus"]["places"]["search"]["options"];
    id: string;
} | null = null;
let page = 0;
let loadingMore = false;
let globalPlaces = [] as Places;

export default function Search() {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dormitory: true,
            apartment: true,
            townhouse: true,
        },
    });

    const [places, setPlaces] = useState<Places>([]);
    const [loading, setLoading] = useState(false);

    const campuses = trpc.university.campus.getAll.useQuery();

    const onSubmit = form.handleSubmit((data) => {
        const type: RecordType<LivingType, boolean> = {
            DORMITORY: data.dormitory,
            APARTMENT: data.apartment,
            TOWNHOME: data.townhouse,
        };

        lastOptions = {
            id: data.campus.id,
            options: {
                type: Object.entries(type)
                    .filter(([_, value]) => value)
                    .map(([key, _]) => key) as LivingType[],
            },
        };

        setLoading(true);
        trpcClient.university.campus.places.search
            .query({
                campusId: data.campus.id,
                options: lastOptions.options,
                page,
            })
            .then((res) => {
                globalPlaces = res;
                setPlaces(globalPlaces);
                setLoading(false);
                loadingMore = false;
            });
    });
    useEffect(() => {
        window.removeEventListener("scroll", () => {});
        window.addEventListener("scroll", () => {
            if (
                window.scrollY + window.innerHeight >=
                    document.body.offsetHeight * 0.9 &&
                places.length > 0 &&
                !loadingMore
            ) {
                loadingMore = true;
                setLoading(true);
                trpcClient.university.campus.places.search
                    .query({
                        campusId: lastOptions!.id,
                        options: lastOptions!.options,
                        page: ++page,
                    })
                    .then((res) => {
                        setLoading(false);
                        if(res.length === 0) return;
                        console.log(res);
                        globalPlaces = [...globalPlaces, ...res];
                        setPlaces(globalPlaces);
                        console.log(globalPlaces.length);
                        loadingMore = false;
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
                            <div className="flex flex-grow items-center rounded-l-md border border-gray-400 bg-gray-100">
                                <MagnifyingGlassIcon
                                    width={24}
                                    height={24}
                                    className="ml-4"
                                />
                                <CampusInput
                                    name="campus"
                                    control={form.control}
                                    campuses={campuses.data ?? []}
                                />
                            </div>
                            <div className="relative h-full">
                                <Popover className="h-full">
                                    {({ open }) => (
                                        <>
                                            <Popover.Button as={React.Fragment}>
                                                <div className="flex h-full items-center gap-2 rounded-r-md border border-gray-400 bg-gray-200 px-8 hover:cursor-pointer ui-open:rounded-br-none">
                                                    <p className="font-normal text-secondary-800">
                                                        Type
                                                    </p>
                                                    {open ? (
                                                        <ChevronUpIcon
                                                            width={24}
                                                            height={24}
                                                        />
                                                    ) : (
                                                        <ChevronDownIcon
                                                            width={24}
                                                            height={24}
                                                        />
                                                    )}
                                                </div>
                                            </Popover.Button>
                                            <Popover.Panel className="absolute w-full rounded-md rounded-t-none border border-gray-400 bg-gray-100 p-4 text-sm font-normal focus-visible:border-gray-400 ui-open:block ui-not-open:hidden ">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            {...form.register(
                                                                "dormitory"
                                                            )}
                                                        />
                                                        <label>Dormitory</label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            {...form.register(
                                                                "apartment"
                                                            )}
                                                        />
                                                        <label>Apartment</label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            {...form.register(
                                                                "townhouse"
                                                            )}
                                                        />
                                                        <label>Townhouse</label>
                                                    </div>
                                                </div>
                                            </Popover.Panel>
                                        </>
                                    )}
                                </Popover>
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
                    <div className="flex flex-col gap-16">
                        <PlacesList places={places} />
                    </div>
                    {loading && (
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-4 border-gray-400 border-t-secondary-800" />
                    )}
                </div>
            </main>
        </>
    );
}
