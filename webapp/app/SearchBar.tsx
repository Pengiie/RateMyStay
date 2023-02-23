"use client";

import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [search, setSearch] = useState("");

    const onCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            router.push(`/search?lat=${latitude}&lon=${longitude}`);
        });
    }

  const onSearch = () => {
    router.push(`/search?query=${search}`);
  };

  return (
    <div className="flex w-10/12 items-center rounded-md bg-gray-100">
      <MagnifyingGlassIcon
        width={24}
        height={24}
        onClick={onSearch}
        className="ml-4 hover:cursor-pointer"
      />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyUp={(e) => e.key === "Enter" && onSearch()}
        placeholder="Enter your university"
        className="flex-grow bg-gray-100 p-4"
      />
      <div onClick={onCurrentLocation} className="flex h-full items-center rounded-r-md bg-secondary-800 px-4 hover:cursor-pointer hover:bg-secondary-900">
        <MapPinIcon width={32} height={32} className="stroke-white" />
      </div>
    </div>
  );
}
