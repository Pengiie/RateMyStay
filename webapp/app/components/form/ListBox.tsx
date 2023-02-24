import { useController, UseControllerProps, FieldValues } from "react-hook-form";
import { Listbox } from "@headlessui/react";
import { z } from "zod";
import { universitySchema } from "prisma-gen";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";

type ListBoxItem = {
    id: string,
    name: string
}
type Props<T extends ListBoxItem> = {
    defaultLabel: string,
    items: T[]
}

export default function ListBox<FormData extends FieldValues, T extends ListBoxItem>(props: Props<T> & UseControllerProps<FormData>) {
    const { field: { value, onChange } } = useController(props);

    return (
        <div className="w-full">
            <Listbox value={value} onChange={onChange}>
                <Listbox.Button className="flex items-center w-full rounded-md border border-gray-300 p-2 text-lg text-left font-normal ">
                    <p className="flex-grow">{value ? (value as ListBoxItem).name : props.defaultLabel}</p>
                    <ChevronUpDownIcon width={24} height={24}/>
                </Listbox.Button>
                <Listbox.Options className="rounded-md border border-gray-300 text-base">
                    {props.items.map((item) => (
                        <Listbox.Option
                            key={item.id}
                            value={item}
                            className="px-2 py-1 ui-not-selected:ui-active:bg-gray-100 ui-selected:bg-primary-300 hover:cursor-pointer"
                        >
                            {item.name}
                        </Listbox.Option>
                    ))}
                </Listbox.Options>
            </Listbox>
        </div>
    )
}