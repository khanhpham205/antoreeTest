/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import Card from "@/components/Card";
import Image from "next/image";
import { useEffect, useState } from "react";
import Viewmodal from './viewProduct.modal'
import Select from "react-select";
import {  Bot, Search } from "lucide-react";


interface select {
  label: string;
  value: string;
}

export default function Home() {
    const [products, setProducts] = useState<M_Product[]>([])
    const [productsshow, setProductsshow] = useState<M_Product[]>([])
    
    const [issuggestions, setIssuggestions] = useState<boolean>(false)
    
    const [search, setsearch] = useState<string>('')
    const [searchdebounce, setsearchdebounce] = useState<string>('')
    
    const [fillter, setFillter] = useState<{ label: string; value: string }>()
    const fillteroptions:{label: string;value:string;}[] = [
        { 
            label: '<5$',
            value: '1', 
        },
        { 
            label: '5$ -> 10$',
            value: '2', 
        },
        {
            label: '10$ -> 20$',
            value: '3', 
        },
        {
            label: '>20$',
            value: '4', 
        },
    ]

    const [product, setProduct] = useState<M_Product>()
    const [showmodal, setShowmodal] = useState<boolean>(false)

    useEffect(()=>{
        (async()=>{
            const fe = await fetch('https://dummyjson.com/products')
            const data = await fe.json()
            setProducts(data.products)
            setProductsshow(data.products)
        })()
    },[])

    useEffect(()=>{
        const timeout = setTimeout(()=>{
            setsearchdebounce(search)
        }, 700)
        return ()=>{clearTimeout(timeout)}
    },[search])

    useEffect(()=>{
        let data= [...products]
        
        // gợi ý theo danh mục của các sản phẩm đã yêu thích
        if(issuggestions){
            // lay các id san pham yeu thich
            const keys = JSON.parse(localStorage.getItem("favorites") || "[]")
            // lay các tên danh mục của sản phẩm đó và lọc các items trùng
            const productfav = [...new Set(products.filter(e => keys.includes(String(e.id))).map(e=>e.category))]
            data = (products.filter(e=>productfav.includes( e.category )))
        }

        // search
        if(searchdebounce.trim()){
            const kw = searchdebounce.trim().toLowerCase()
            data = data.filter(e=>e.title.toLowerCase().includes(kw))
        }

        // lọc giá
        if(fillter){
            data = data.filter(e=>{
                switch (fillter.value) {
                    case '1':
                        if(e.price < 5) return true;
                        break;
                    case '2':
                        if(e.price >= 5 && e.price < 10) return true;
                        break;
                    case '3':
                        if(e.price >= 10 && e.price < 20) return true;
                        break;
                    case '4':
                        if(e.price >= 20) return true;    
                        break;
                    default:
                        return true;
                }
            })
        }
        setProductsshow(data)       
    },[fillter, issuggestions, products, searchdebounce])

    const handleShow = (e:M_Product)=>{
        setShowmodal(true)
        setProduct(e)
    }

    return <>
        <div className="gridsys">
            <h3 className="fullcol text-center mt-3" >Sản phẩm </h3>
            <Select
                isClearable={true}
                className="col-span-3 lg:col-span-3 md:col-span-2 sm:col-span-2"
                options={fillteroptions} 
                value={fillter} 
                placeholder="Price filter"
                onChange={(e)=>{setFillter(e as select)}} 
            />
            <div 
                className={`cursor-pointer w-fit p-2 rounded aspect-square flex justify-center items-center ${issuggestions ? 'bg-blue-500' : 'bg-gray-200'} `}
                onClick={()=>{setIssuggestions(e=>!e)}}
            >
                <Bot color={issuggestions? 'white':'black'} />
            </div>
            

            <div 
                className=" 
                    relative w-full flex justify-between items-center 
                    lg:col-end-13 lg:col-span-3
                    md:col-end-7 md:col-span-2
                    sm:col-end-7 sm:col-span-2
                "
            >
                <input
                    type="text"
                    className='border !absolute w-full '
                    value={search}
                    placeholder="Search product"
                    onChange={(e) => setsearch(e.target.value)}
                    autoComplete="off"
                />
                <Search className='absolute right-4' />
            </div>
            {productsshow.map((e,i)=> <Card key={i} product={e} onClick={a=>{handleShow(e)}} />)}
        </div>;
        <Viewmodal product={product} ShowModel={showmodal} setShowModel={setShowmodal} />
    </>
}
