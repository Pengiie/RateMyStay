"use client";

import { useController, UseControllerProps, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "../components/Navbar";
import { campusSchema, universitySchema } from "prisma-gen"
import { z } from "zod";
import { trpc } from "../trpc";
import { Combobox, Listbox } from "@headlessui/react";
import { useEffect } from "react";
import AddressForm from "../components/form/AddressForm";
import ListBox from "../components/form/ListBox";
import Submit from "../components/form/Submit";

const schema = z.object({
    university: universitySchema,
    name: campusSchema.shape["name"],
    // place_id
    address: z.object({
        place_id: z.string(),
        description: z.string(),
    }),
});
type FormData = z.infer<typeof schema>;

export default function Campus() {
    const query = trpc.university.getAll.useQuery();
    const mutation = trpc.university.campus.add.useMutation({
        onSuccess() {
            form.reset();
        },
    });

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            university: {
                id: "",
                name: "",
            },
            name: "",
            address: {
                place_id: "",
                description: "",
            },
        },
    });

    const onSubmit = form.handleSubmit((data) => {
        mutation.mutate({
            universityId: data.university.id,
            name: data.name,
            address: { placeId: data.address.place_id },
        });
    });

    return (
        <>
            <Navbar />
            <main className="mt-52 flex justify-center">
                <div className="flex w-2/6 flex-col gap-8 p-8 shadow-2xl">
                    <h1 className="self-center text-3xl font-medium">
                        Create a campus
                    </h1>
                    <form
                        onSubmit={onSubmit}
                        className="mt-4 flex w-96 flex-col gap-6 text-xl font-thin"
                    >
                        <div className="flex flex-col">
                            <label>University</label>
                            <ListBox<FormData, z.infer<typeof universitySchema>>
                                name="university"
                                control={form.control}
                                defaultLabel="Select a university"
                                items={query.data || []}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label>Name</label>
                            <input
                                type="text"
                                className="w-96 rounded-md border border-gray-300 p-2 text-lg font-normal"
                                {...form.register("name")}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label>Address</label>
                            <AddressForm
                                name="address"
                                control={form.control}
                            />
                        </div>
                        <Submit isLoading={mutation.isLoading} />
                    </form>
                </div>
            </main>
        </>
    );
}
