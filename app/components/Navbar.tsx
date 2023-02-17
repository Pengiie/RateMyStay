import Link from "next/link";


const Navbar = () => {
    return (
    <nav className="flex items-center px-32 py-4 gap-4 w-full">
        <p className="text-3xl font-semibold flex-grow"><Link href="/">RateMyStay</Link></p>
        <p className="text-lg font-medium"><Link href={"login"}>Log in</Link></p>
        <Link href={"signup"}><p className=" px-4 py-2 rounded-xl text-white text-md font-medium bg-blue-400 hover:bg-blue-500">Sign up</p></Link>
    </nav>
    )
}

export default Navbar;