import Navbar from "./components/Navbar";
import SearchBar from "./SearchBar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="mt-52 flex justify-center bg-gradient-to-r from-primary-300 to-primary-200 py-28">
        <div className="flex flex-col items-center gap-11">
          <div className="flex flex-col text-center">
            <p className="text-3xl font-medium">
              Searching for your perfect home is tiring
            </p>
            <p className="text-3xl font-normal">Let us make it easier.</p>
          </div>
          <SearchBar />
        </div>
      </main>
    </>
  );
}
