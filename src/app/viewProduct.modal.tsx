// import "bootstrap/dist/css/bootstrap.min.css";
/* eslint-disable @typescript-eslint/no-unused-vars */
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "next/image";
import { toast } from "react-toastify";

import "bootstrap/dist/css/bootstrap.min.css";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface Prop {
    ShowModel: boolean;
    setShowModel: (value: boolean) => void;
    product: M_Product | undefined;
}

export default function ViewProduct({
    ShowModel,
    setShowModel,
    product,
}: Prop) {
    const [isFavorite, setisFavorite] = useState<boolean>(false);
    const handleClose = () => {
        setShowModel(false);
    };
    useEffect(()=>{
        setisFavorite(false)
        const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
        console.log(favs);
        
        if(favs.includes(String(product?.id))) {setisFavorite(true)}
        else{  setisFavorite(false)}
    },[product])

    const toggleFavorite = () => {
        const id = String(product!.id); // bảo đảm id là string

        // let favs: string[];
        const favs = JSON.parse(localStorage.getItem("favorites") || "[]");

        const idx = favs.indexOf(id);
        if (idx > -1) {
            favs.splice(idx, 1); 
            setisFavorite(false);
            toast.success('Hủy yêu thích thành công')
        } else {
            favs.push(id); 
            setisFavorite(true);
            toast.success('Thêm yêu thích thành công')
        }

        // 3️⃣ Lưu lại
        localStorage.setItem("favorites", JSON.stringify(favs));
    };

    return (
        <div className="modal show">
            <Modal
                show={ShowModel}
                onHide={handleClose}
                backdrop="static"
                keyboard={true}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: "var(--secondary)" }}>
                        Product detail
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {product && product.thumbnail && (
                        <div className="flex gap-2">
                            <Image
                                src={product.thumbnail}
                                alt={product.thumbnail}
                                height={200}
                                width={200}
                                className="rounded object-cover aspect-square"
                            />
                            <div className="flex-1 ">
                                {/* {product.id} */}
                                <h3 className="flex justify-between items-center">
                                    {product.title}
                                    <Heart
                                        fill={isFavorite ? "red" : "none"}
                                        color="red"
                                        onClick={toggleFavorite}
                                    />
                                </h3>
                                <p className="bg-rose-400 w-fit px-3 py-1 rounded text-white">
                                    {product.category}
                                </p>
                                <p className="text-rose-500">
                                    {product.price} $
                                </p>
                                <p className="line-clamp-3">
                                    {product.description}
                                </p>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
