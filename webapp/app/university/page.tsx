"use client";

import { useController, UseControllerProps, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "../components/Navbar";
import { universitySchema } from "../../prisma/generator/models";
import { z } from "zod";
import { trpc } from "../trpc";
import { Combobox } from "@headlessui/react";
import { useEffect } from "react";

const schema = universitySchema
    .pick({ name: true })
    .extend({ name: z.string().min(4).max(100) });

type Props = {
    universities: z.infer<typeof universitySchema>[];
};

export const Autocomplete = (
    props: Props & UseControllerProps<{ name: string }>
) => {
    const {
        field: { value, onChange },
    } = useController(props);

    console.log(props.universities);

    return (
        <div className="w-96">
            <Combobox value={value} onChange={onChange}>
                <Combobox.Input onChange={onChange} className="w-full rounded-md border border-gray-300 p-2 text-lg font-normal"/>
                <Combobox.Options className="bg-gray-50">
                    {props.universities.map((university) => (
                        <Combobox.Option
                            key={university.id}
                            value={university.name}
                            className="px-2 py-1 hover:bg-gray-200 hover:cursor-pointer"
                        >
                            {university.name}
                        </Combobox.Option>
                    ))}
                </Combobox.Options>
            </Combobox>
        </div>
    );
};

export default function University() {
    const query = trpc.university.getAll.useQuery();

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
    });
    const mutation = trpc.university.add.useMutation({
        onSuccess() {
            query.refetch()
            form.reset();
        },
        onError(error) {
            form.setError("name", { message: error.message });
        },
    });

    const onSubmit = form.handleSubmit((data) => {
        mutation.mutate(data);
    });

    return (
        <>
            <Navbar />
            <main className="mt-52 flex justify-center">
                <div className="flex w-2/6 flex-col gap-8 p-8 shadow-2xl">
                    <h1 className="self-center text-3xl font-medium">
                        Create a university
                    </h1>
                    <form
                        onSubmit={onSubmit}
                        className="mt-4 flex flex-col gap-6 text-xl font-thin"
                    >
                        <div className="flex flex-col">
                            <label>Name</label>
                            <Autocomplete name="name" control={form.control} universities={query.data ?? []} />
                            {/* <input
                                type="text"
                                className="w-96 rounded-md border border-gray-300 p-2 text-lg font-normal"
                                {...form.register("name")}
                            /> */}
                            <p className="text-base font-normal text-red-400">
                                {form.formState.errors.name?.message}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="submit"
                                disabled={mutation.isLoading}
                                className="w-fit rounded-lg bg-primary-600 px-8 py-4 text-white hover:cursor-pointer hover:bg-primary-700 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
                                value={"Create"}
                            />
                            {mutation.isLoading && (
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-4 border-gray-400 border-t-blue-500" />
                            )}
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
