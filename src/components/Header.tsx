import Link from "next/link";



export default function Headder(){
    return <nav className="gridsys bg-gray-200 py-4 ">
        <Link href='/' className="text-black !no-underline">Products</Link>
        <Link href='/favorites' className="text-black !no-underline">Favorites</Link>
    </nav>
}