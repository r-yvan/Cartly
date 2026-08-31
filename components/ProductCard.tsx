"use client";
import { Bars } from "react-loader-spinner";
import React, { useState } from "react";
import svg from "@/public/upt.png";
import Image from "next/image";
import {
  IconHeart,
  IconHeartFilled,
  IconShoppingCartPlus,
  IconCheck,
} from "@tabler/icons-react";

interface Props {
  id: string; // Added id prop
  image: string;
  likes: number;
  name: string;
  description: string;
  price: number;
}

const ProductCard = ({ id, image, likes, name, description, price }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const addToCart = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: id,
          quantity: 1,
        }),
      });

      if (res.ok) {
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
        console.log("Added to cart!");
      } else {
        console.error("Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="lighter relative flex flex-col gap-3 h-[420px] w-80 p-2 bg-[#0f0f0f] rounded-xl border border-white border-opacity-5">
        <div className="relative w-fit rounded-lg overflow-hidden h-[200px] w-full flex items-center justify-center bg-[#151515]">
          <Image
            src={image}
            alt={name}
            width={300}
            height={300}
            className="object-cover h-full w-full"
          />
          <div className="absolute top-1 right-1 opacity-50 w-fit h-fit bg-[#151515] p-1 rounded-full">
            <IconHeart size={20} />
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-grow">
          <div className="flex flex-row gap-1 px-2 py-1 bg-[#151515] w-fit rounded-full">
            <IconHeartFilled size={20} color="#F54254" />
            <p className="text-sm opacity-50">{likes}</p>
          </div>
          <div>
            <p className="text-lg font-bold truncate">{name}</p>
          </div>
          <div className="h-12 overflow-hidden">
            <p className="opacity-50 text-sm line-clamp-2">{description}</p>
          </div>
          <div className="bg-[#151515] w-fit px-3 py-1 rounded-full mt-auto">
            <p className="text-xl text-white">$ {Number(price).toFixed(2)}</p>
          </div>
        </div>
        <div
          className={`flex w-40 px-3 py-2 justify-center items-center rounded-lg cursor-pointer transition-colors ${
            isAdded ? "bg-green-600" : "bg-violet-700 hover:bg-violet-600"
          }`}
          onClick={addToCart}
        >
          {isLoading ? (
            <Bars
              height="24"
              width="20"
              color="#FFFFFF"
              ariaLabel="bars-loading"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
            />
          ) : isAdded ? (
            <div className="flex flex-row gap-2">
              <IconCheck />
              <p>Added</p>
            </div>
          ) : (
            <div className="flex flex-row gap-2">
              <IconShoppingCartPlus />
              <p>Add to Cart</p>
            </div>
          )}
        </div>
        <Image
          src={svg}
          alt=""
          className="absolute bottom-1 right-1 opacity-50"
        />
      </div>
    </div>
  );
};

export default ProductCard;
