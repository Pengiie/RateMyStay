"use client";

import { Loader } from "@googlemaps/js-api-loader";
import { Combobox } from "@headlessui/react";
import { useEffect, useState } from "react";
import { FieldValues, useController, UseControllerProps } from "react-hook-form";
import { z } from "zod";
import TextBox from "./TextBox";

const addressSchema = z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
});

const loader = new Loader({
    apiKey: "AIzaSyC1ZlU-4MaEZjDDu-EOYj2mGcqn7DJ0BPU",
    version: "weekly",
    libraries: ["places"],
});

export default function AddressForm<FormData extends FieldValues>(props: UseControllerProps<FormData>) {
    const { field } = useController(props);

    const [autocomplete, setAutocompleteService] =
        useState<google.maps.places.AutocompleteService | null>(null);
    const [places, setPlaces] = useState<
        google.maps.places.AutocompletePrediction[]
    >([]);

    useEffect(() => {
        loader.load().then(() => {
            setAutocompleteService(
                new google.maps.places.AutocompleteService()
            );
        });
    }, []);

    const handleAutocomplete = (address: string) => {
        if (autocomplete) {
            autocomplete.getPlacePredictions({ input: address }, (results) => {
                if (results) {
                    setPlaces(results);
                }
            });
        }
    };

    return (
        <Combobox value={field.value} onChange={field.onChange}>
            <Combobox.Input
                onChange={(event) => handleAutocomplete(event.target.value)}
                displayValue={(
                    place: google.maps.places.AutocompletePrediction | null
                ) => place?.description || ""}
                className="w-full rounded-md border-2 border-gray-300 focus:border-primary-500 p-2 text-base font-normal"
            />
            <Combobox.Options className="ui-not-open:hidden ui-open:block border-2 border-primary-500 text-sm font-normal rounded-md mt-1">
                {places &&
                    places.map((place) => (
                        <Combobox.Option key={place.place_id} value={place} className="px-2 py-1 hover:cursor-pointer hover:bg-gray-100 overflow-hidden rounded-md">
                            {place.description}
                        </Combobox.Option>
                    ))}
            </Combobox.Options>
        </Combobox>
    );
}
