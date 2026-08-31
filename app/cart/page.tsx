"use client";

import React, { useEffect, useState } from "react";
import TopNavigationBar from "@/components/TopNavigationBar";
import { GridPatternDashed } from "@/components/GridPatternDashed";
import Image from "next/image";
import { IconTrash, IconMinus, IconPlus } from "@tabler/icons-react";
import Link from "next/link";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: { url: string }[];
  };
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    const newTotal = cartItems.reduce(
      (acc, item) => acc + item.quantity * Number(item.product.price),
      0
    );
    setTotal(newTotal);
  }, [cartItems]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      if (data.items) {
        setCartItems(data.items);
      }
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      });
      if (res.ok) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to update quantity", error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      }
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  };

  return (
    <div className="flex flex-col gap-10 w-full min-h-screen bg-[#050505] text-white">
      <div className="flex justify-center w-full pt-1 z-20">
        <TopNavigationBar />
      </div>
      <div className="fixed inset-0 z-0">
        <GridPatternDashed />
      </div>

      <div className="z-10 px-4 md:px-16 flex flex-col gap-8 pt-10 pb-20 max-w-7xl mx-auto w-full">
        <h1 className="text-4xl font-bold">Your Cart</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-grow flex flex-col gap-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center gap-4 bg-[#151515] p-4 rounded-xl border border-[#FFFFFF10]"
                >
                  <div className="w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.images[0]?.url || "/placeholder.png"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-grow flex flex-col gap-1 text-center sm:text-left">
                    <h3 className="text-xl font-semibold">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-400">
                      $ {Number(item.product.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#0A0A0A] rounded-lg p-1">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 hover:bg-[#202020] rounded"
                        disabled={item.quantity <= 1}
                      >
                        <IconMinus size={16} />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 hover:bg-[#202020] rounded"
                      >
                        <IconPlus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-[#202020] rounded-lg transition-colors"
                    >
                      <IconTrash size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="bg-[#151515] p-6 rounded-xl border border-[#FFFFFF10] flex flex-col gap-6 sticky top-24">
                <h2 className="text-2xl font-bold">Order Summary</h2>
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-400">Shipping</span>
                  <span className="font-semibold">Calculated at checkout</span>
                </div>
                <div className="h-px bg-[#FFFFFF10]"></div>
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Link
                  href="/checkout"
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <p className="text-2xl text-gray-400">Your cart is empty</p>
            <Link
              href="/products"
              className="px-6 py-3 bg-violet-600 rounded-lg font-semibold hover:bg-violet-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
