"use client"
import React, {useEffect, useState} from 'react';
import CreditFooter from "@/components/CreditFooter/CreditFooter";
import WelcomeHeader from "@/components/WelcomeHeader/WelcomeHeader";
import Image from "next/image";
import { IoMdPhotos } from "react-icons/io";
import Sample_User_Icon from "@/assets/Sample_User_Icon.png";
import {useRouter} from 'next/router'
import toast, { Toaster } from 'react-hot-toast';

export default function ProfilePage() {
    const [newUsername, setNewUsername] = useState<string>("")
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>();

    const router = useRouter();
    const {userId} = router.query;

    // const user: any = { username: "My test username", email: "test@example.com" };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            const token = getCookie("accessToken");

            const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_API_URL + "/api/v1/user" + "/" + userId, {
                method: "POST",
                headers: {
                    token: "Bearer " + token
                },
                body: JSON.stringify({
                    file: selectedImage,
                    username: newUsername
                })
            })

            if(res.status === 200) {
                toast.success("Profile saved successfully");
                router.push("/start");
                window.location.reload();
                setLoading(false);
            }
            else {
                toast.error("Failed to save profile");
                setLoading(false);
            }
        }
        catch (err: any) {
            toast.error("Failed to save profile");
            setLoading(false);
        }
    }

    const fetchUser = async (id: string, token: string | null) => {
        if (!token) {
            throw new Error("Invalid access token");
        }

        const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_API_URL + "/api/v1/user" + "/" + userId, {
            method: "GET",
            headers: {
                token: "Bearer " + token
            }
        })

        if (res.status === 200) {
            const response = await res.json();
            setUser(response);
            setNewUsername(response?.username || "");
            setSelectedImage(response?.imageURL || null);
        }
        else {
            throw new Error("Request failed with status code: " + res.status);
        }
    }

    function getCookie(name: string) {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [cookieName, cookieValue] = cookie.trim().split('=');
            if (cookieName === name) {
                return decodeURIComponent(cookieValue);
            }
        }
        return null;
    }

    useEffect(() => {

        const cookie = getCookie("accessToken");

        fetchUser(userId as string, cookie);

    }, [])

    return (
        <>
        <WelcomeHeader />
        <Toaster />
        <div className="mx-auto px-4 md:px-6 prose prose-2xl prose-slate flex flex-col justify-center items-center">
            <div className="relative mb-12 flex justify-center items-center">
                <label htmlFor="imageInput" className="cursor-pointer">
                    <Image
                        className="rounded-full w-56 h-56 bg-tertiary cursor-pointer"
                        width={224}
                        height={224}
                        objectFit="cover"
                        src={selectedImage || Sample_User_Icon}
                        alt="profile"
                    />
                    <input
                        id="imageInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                </label>
                <p className="text-h1 absolute bottom-2 right-2 cursor-pointer" onClick={() => document.getElementById('imageInput')?.click()}>
                    <IoMdPhotos />
                </p>
            </div>
            <input 
                className="tracking-widest border-b-4 px-16 max-md:px-4 text-center text-secondary text-4xl max-md:text-2xl focus:outline-none font-sans font-bold mb-3"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                type="text"
            />
            <h5 className="text-h5 font-sans font-regular mb-28">
                {user?.email}
            </h5>
            
            <button 
                type='button' 
                className="border-2 rounded-lg border-primary text-white text-h3 text-center bg-primary px-5 py-2 cursor-pointer w-3/4"
                onClick={handleSaveProfile}
            >
                { loading ? "Loading..." : "Save" }
            </button>
        </div>
        <CreditFooter />
        </>
    )
}
