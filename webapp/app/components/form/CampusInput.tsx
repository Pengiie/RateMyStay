import { Combobox } from "@headlessui/react";
import { campusSchema as sc, universitySchema } from "prisma-gen";
import { useState } from "react";
import { useController, UseControllerProps } from "react-hook-form";
import { FieldValue, FieldValues } from "react-hook-form/dist/types";
import { z } from "zod";

export const campusSchema = sc.pick({ id: true, name: true }).extend({
    university: universitySchema.pick({ id: true, name: true }),
});

export type Campus = z.infer<typeof campusSchema>;

const displayName = (campus: Campus) =>
    `${campus.university.name} - ${campus.name}`;

export default function UniversityInput<FormData extends FieldValues>(
    props: { campuses: Campus[] } & UseControllerProps<FormData>
) {
    const { field } = useController(props);

    const [query, setQuery] = useState("");

    return (
        <div className="flex-grow relative">
            <Combobox value={field.value} onChange={field.onChange}>
                <Combobox.Input<"input", Campus>
                    onChange={(e) => setQuery(e.target.value)} // This is a hack to prevent the input from being cleared
                    displayValue={(campus: Campus | null) =>
                        campus ? displayName(campus) : ""
                    }
                    placeholder="University"
                    className="w-full bg-gray-100 p-4"
                    autoComplete="off"
                />
                <Combobox.Options className="w-[calc(100%-0.5rem)] ml-2 rounded-md rounded-t-none border border-gray-400 text-sm font-normal ui-open:block absolute ui-not-open:hidden bg-gray-100">
                    {props.campuses &&
                        props.campuses.map((campus) => (
                            <Combobox.Option
                                key={campus.id}
                                value={campus}
                                className="overflow-hidden p-2 hover:cursor-pointer hover:bg-gray-200"
                            >
                                {displayName(campus)}
                            </Combobox.Option>
                        ))}
                </Combobox.Options>
            </Combobox>
        </div>
    );
}
