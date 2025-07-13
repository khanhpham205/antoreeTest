/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import axios from "axios";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@mui/material";
import Loading from "@/components/loadingPage";
import VNInput from "@/components/VNCurrencyInput";
import Blocknotereader from "@/components/blocknotereader";
import { Bookmark } from "lucide-react";
import { toast } from "react-toastify";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { useAuth } from "@/Authcontext";

import GooeyNav from "@/components/ui/GooeyNav";
import { useRouter } from "next/navigation";

const formatVND = (value: number) => value.toLocaleString("vi-VN") + " VND";

interface Prop {
    params: Promise<{ id: string }>;
}

export default function Chiendichdetail({ params }: Prop) {
    const items = [
        { label: "Mô tả chiến dịch" , func: ()=>{settab(1);} },
        { label: "Danh sách từ thiện"  , func: ()=>{settab(2);} },
        { label: "Báo cáo chiến dịch"  , func: ()=>{settab(3);} },
    ];
    const router = useRouter();
    const [openModal, setOpenModal] = useState(false);
    const { id } = use(params);
    const { user } = useAuth();
    const [tab, settab] = useState<number>(1);

    // const [desc, setdesc] = useState<string>("");
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogContent, setDialogContent] = useState<React.ReactNode>(null);
    const [volunteers, setVolunteers] = useState<M_Volunteer[]>([]);
    const [loaded, setloaded] = useState<boolean>(false);
    const [chiendich, setChiendich] = useState<M_chiendich>();
    const [amount, setAmount] = useState<number>(0);
    const [owner, setowner] = useState<{
        _id: string;
        name: string;
        avatar: string;
    }>({ _id: "", name: "", avatar: "" });

    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        (async () => {
            const data = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/chiendich/${id}`
            );
            setChiendich(data.data);
            setloaded(true);
            setowner(data.data.tacGia || data.data.nhanVien);
            const token = localStorage.getItem("JWT");
            if (token) {
                try {
                    const res = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/user/favorite`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    const exists = res.data.some(
                        (f: any) => f._id === data.data._id
                    );
                    setIsFavorite(exists);
                } catch (err) {
                    console.error("Lỗi khi kiểm tra yêu thích:", err);
                }
            }

            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/user/volunteer/${id}`
            );
            setVolunteers(res.data.slice(0, 4));
        })();
        // (async () => {
        //     try {
        //         const res = await axios.get(
        //             `${process.env.NEXT_PUBLIC_API_URL}/user/volunteer/${id}`
        //         );
        //         setVolunteers(res.data.slice(0, 4));
        //     } catch (err) {
        //         console.error("Lỗi khi lấy tình nguyện viên:", err);
        //     }
        // })();
    }, []);

    const donate = async () => {
        const jwt = localStorage.getItem("JWT");
        if (!jwt) {
            alert("Bạn cần đăng nhập để ủng hộ.");
            return;
        }

        if (!amount || amount < 10000) {
            alert("Số tiền không hợp lệ");
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/payment`,
                {
                    amount,
                    campaignId: id, // Gửi campaignId rõ ràng
                },
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                }
            );

            const { payUrl } = response.data;
            if (payUrl) {
                window.location.href = payUrl;
            } else {
                alert("Không thể tạo yêu cầu thanh toán MoMo.");
            }
        } catch (err: any) {
            console.error(
                "❌ Lỗi khi gọi API MoMo:",
                err.response?.data || err.message
            );
            alert(
                "Lỗi tạo thanh toán: " +
                    (err.response?.data?.message || "Không rõ")
            );
        }
    };

    const donateVNPAY = async () => {
        const jwt = localStorage.getItem("JWT");
        if (!jwt) {
            alert("Bạn cần đăng nhập để ủng hộ.");
            return;
        }

        if (!amount || amount < 10000) {
            alert("Số tiền không hợp lệ");
            return;
        }

        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/create-qr`,
                {
                    amount,
                    chiendichId: id,
                    content: "Ủng hộ qua VNPAY",
                },
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                }
            );

            const { paymentUrl } = res.data;
            if (paymentUrl) {
                window.location.href = paymentUrl; // chuyển hướng sang VNPAY
            } else {
                alert("Không thể tạo yêu cầu thanh toán VNPAY.");
            }
        } catch (err: any) {
            console.error(
                "❌ Lỗi khi gọi API VNPAY:",
                err?.response?.data || err?.message
            );
            alert(
                "Lỗi tạo thanh toán: " +
                    (err?.response?.data?.message || "Không rõ")
            );
        }
    };

    const Render= ()=>{
        switch (tab) {
            case 1:
                return <Blocknotereader content={chiendich?.desc} /> ;
            case 2:

                
                break;
            case 3:
                
                break;
        
            default:
                break;
        }
    }

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const success = query.get("success");
        if (!success) return;
        switch (success) {
            case "0":
                toast.success("Ủng hộ thành công!");
                setAmount(0);
                router.refresh();
                break;
            case "3":
                toast.warning("Thông tin tài khoản không tồn tại!");
                break;
            case "17":
                toast.warning("Số tiền không đủ để giao dịch!");
                break;

            default:
                toast.warning("không thành công!");
                break;
        }
        if (!!success && success?.length > 0 && id) {
            const url = new URL(window.location.href);
            url.searchParams.delete("success");
            window.history.replaceState({}, document.title, url.toString());
        }
    }, [id]);

    // return <div className="">{chiendich?._id}</div>
    const toggleFavorite = async () => {
        const token = localStorage.getItem("JWT");
        if (!token)
            return toast.error("Vui lòng đăng nhập để sử dụng tính năng này");

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/user/favorite`,
                { campaignId: id },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setIsFavorite((prev) => !prev);
            toast.success(
                isFavorite ? "Đã gỡ khỏi yêu thích" : "Đã thêm vào yêu thích"
            );
        } catch (err) {
            console.error("Lỗi toggle yêu thích:", err);
            toast.error("Thao tác không thành công");
        }
    };

    const volunteer = () => {
        const jwt = localStorage.getItem("JWT");
        if (!jwt) return toast.error("Vui lòng đăng nhập");

        if (!user) {
            toast.error("Không tìm thấy thông tin người dùng");
            return;
        }
        // Kiểm tra nếu user đã là tình nguyện viên
        const isAlreadyVolunteer = volunteers.some(
            (v) => v.userId._id === user._id
        );

        if (isAlreadyVolunteer) {
            toast.info("Bạn đã là tình nguyện viên chiến dịch này rồi");
            return;
        }

        const isKol = user.role === "kol";
        const isKycVerified = user.flag === true;

        if (isKol || isKycVerified) {
            setDialogContent(
                <>
                    <DialogTitle>Xác nhận tình nguyện</DialogTitle>
                    <DialogContent>
                        Bạn có chắc chắn muốn đăng ký làm tình nguyện viên cho
                        chiến dịch này?
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={async () => {
                                try {
                                    await axios.post(
                                        `${process.env.NEXT_PUBLIC_API_URL}/user/volunteer/register`,
                                        { campaignId: id },
                                        {
                                            headers: {
                                                Authorization: `Bearer ${jwt}`,
                                            },
                                        }
                                    );
                                    toast.success(
                                        "Đăng ký tình nguyện viên thành công"
                                    );
                                    setOpenDialog(false);
                                } catch (error) {
                                    toast.error("Đăng ký thất bại");
                                    console.error(error);
                                }
                            }}
                            variant="contained"
                        >
                            Xác nhận
                        </Button>
                    </DialogActions>
                </>
            );
        } else {
            setDialogContent(
                <>
                    <DialogTitle>Chưa xác thực KYC</DialogTitle>
                    <DialogContent>
                        Tài khoản của bạn chưa xác thực KYC. Bạn có muốn chuyển
                        đến trang KYC để xác minh không?
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>
                            Để sau
                        </Button>
                        <Button
                            onClick={() => {
                                setOpenDialog(false);
                                window.location.href = "/account/KYC";
                            }}
                            variant="contained"
                        >
                            Đi đến xác minh KYC
                        </Button>
                    </DialogActions>
                </>
            );
        }

        setOpenDialog(true);
    };

    return (
        <>
            {openModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setOpenModal(false)}
                >
                    <div
                        className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold mb-4">
                            Chọn phương thức thanh toán
                        </h3>
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outlined"
                                onClick={async () => {
                                    setOpenModal(false);
                                    donateVNPAY();
                                }}
                            >
                                Thanh toán qua VNPAY
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setOpenModal(false);
                                    donate();
                                }}
                            >
                                Thanh toán qua MOMO
                            </Button>
                            <Button
                                variant="text"
                                color="error"
                                onClick={() => setOpenModal(false)}
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {loaded && chiendich ? (
                <div className="gridsys mt-3">
                    <img
                        className=" col-span-6 border-1 border-gray-200 bg-gray-200 rounded w-full object-cover aspect-square"
                        src={chiendich.thumbnail}
                        alt="asd"
                    />
                    <div className="h-full col-span-6 flex flex-col items-start justify-between">
                        {/* thong tin chung */}
                        <div className="flex items-center justify-between w-full">
                            <h3 className="text-xl font-bold">
                                {chiendich.name}
                            </h3>
                            <div
                                onClick={toggleFavorite}
                                className="cursor-pointer bg-white p-1 rounded-full shadow ml-2"
                                title={
                                    isFavorite
                                        ? "Bỏ khỏi yêu thích"
                                        : "Thêm vào yêu thích"
                                }
                            >
                                <Bookmark
                                    size={24}
                                    color={isFavorite ? "#2563eb" : "gray"}
                                    fill={isFavorite ? "#2563eb" : "none"}
                                />
                            </div>
                        </div>

                        {/* thong tin chi tiet du an */}
                        <div className="w-full flex flex-col gap-2">
                            <div className="w-full flex flex-col p-6 gap-2 items-center rounded bg-gray-200 ">
                                {/* thong tin nha tu thien */}
                                <div className="flex w-full flex-row items-center gap-3">
                                    <Image
                                        className="rounded-full w-15 border "
                                        width={300}
                                        height={300}
                                        src={
                                            owner.avatar
                                                ? owner.avatar
                                                : "/user.png"
                                        }
                                        alt="anh"
                                    />
                                    <h5>{owner.name}</h5>
                                </div>

                                <div className=" w-full flex justify-between">
                                    <p>Mục tiêu chiến dịch: </p>
                                    <p className="text-red-400 underline-offset-1">
                                        {formatVND(chiendich.target)}
                                    </p>
                                </div>

                                {/* process bar */}
                                <div className="flex relative h-4 rounded-full overflow-hidden w-full  bg-gray-500 ">
                                    {/* user donation bar */}
                                    <div
                                        className="absolute h-full bg-gray-400 rounded-full z-0"
                                        style={{
                                            width: `${Math.round(
                                                ((amount + chiendich.current) /
                                                    chiendich.target) *
                                                    100
                                            )}%`,
                                        }}
                                    ></div>
                                    {/* main bar */}
                                    <div
                                        className="h-full bg-blue-500 rounded-full z-1"
                                        style={{
                                            width: `${Math.round(
                                                (chiendich.current /
                                                    chiendich.target) *
                                                    100
                                            )}%`,
                                        }}
                                    ></div>
                                    <p className="pl-1 text-xs  text-white z-1">
                                        {Math.round(
                                            (chiendich.current /
                                                chiendich.target) *
                                                100
                                        )}
                                        %
                                    </p>
                                </div>

                                <div className=" w-full flex justify-between">
                                    <p>Đã đạt được: </p>
                                    <p className="text-red-400 underline-offset-1">
                                        {formatVND(chiendich.current)}
                                    </p>
                                </div>
                            </div>

                            {/* chuc nang tu thien */}
                            <div className="w-full flex flex-row items-start gap-2">
                                <VNInput
                                    onChange={(_: string, num: number) =>
                                        setAmount(num)
                                    }
                                    value={
                                        amount
                                            ? amount.toLocaleString("vi-VN")
                                            : ""
                                    }
                                    min={10000}
                                    max={chiendich.target - chiendich.current}
                                />
                                <Button variant="contained" onClick={()=>{setOpenModal(true)}}>
                                    Ủng hộ
                                </Button>
                                <Button variant="outlined" onClick={volunteer}>
                                    Tình nguyện viên CD
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="fullcol border-b">
                        <GooeyNav
                            items={items}
                            particleCount={8}
                            particleDistances={[50, 10]}
                            particleR={100}
                            initialActiveIndex={0}
                            animationTime={600}
                            timeVariance={300}
                        />
                    </div>
                    {Render()}

                    <Blocknotereader content={chiendich.desc} />

                    <Dialog
                        open={openDialog}
                        onClose={() => setOpenDialog(false)}
                    >
                        {dialogContent}
                    </Dialog>

                    {/* <div dangerouslySetInnerHTML={{ __html: a || "" }} /> */}

                    {/* <div
                        dangerouslySetInnerHTML={{ __html: desc }}
                        className="col-span-11 blocknote"
                    /> */}
                </div>
            ) : (
                <Loading />
            )}
        </>
    );
}
