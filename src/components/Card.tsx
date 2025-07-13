/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from "next/image";
interface Prop extends React.HTMLAttributes<HTMLDivElement>{
    product:M_Product;
}

export default function Card({product,...rest}:Prop){
    return <div className="card bg-gray-200  rounded p-2 flex flex-col justify-center cursor-pointer" {...rest} >
        {
        product.thumbnail ? 
            <Image 
                className="rounded object-cover w-full aspect-square"
                src={product.thumbnail} 
                alt='productThumbnail' 
                width={200}
                height={200}
            /> : 
            <h5 className="w-full bg-gray-300 rounded aspect-square flex items-center justify-center">Lỗi khi load ảnh</h5>
        }
        <h5 className="line-clamp-1">{product.title}</h5>
        <p className="text-rose-500">{product.price} $</p>
    </div>
}
