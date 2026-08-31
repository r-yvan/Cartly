"use client";

import React, { useState, useEffect } from "react";
import TopNavigationBar from "@/components/TopNavigationBar";
import { GridPatternDashed } from "@/components/GridPatternDashed";
import { useRouter } from "next/navigation";

const CheckoutPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    country: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      alert("Order placed successfully!");
      router.push("/");
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-10 w-full min-h-screen bg-[#050505] text-white">
      <div className="flex justify-center w-full pt-1 z-20">
        <TopNavigationBar />
      </div>
      <div className="fixed inset-0 z-0">
        <GridPatternDashed />
      </div>

      <div className="z-10 px-4 md:px-16 flex flex-col gap-8 pt-10 pb-20 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-bold">Checkout</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="bg-[#151515] p-6 rounded-xl border border-[#FFFFFF10] flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">First Name</label>
                <input
                  required
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="bg-[#0A0A0A] border border-[#FFFFFF20] rounded-lg p-3 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Last Name</label>
                <input
                  required
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="bg-[#0A0A0A] border border-[#FFFFFF20] rounded-lg p-3 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm text-gray-400">Email</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-[#0A0A0A] border border-[#FFFFFF20] rounded-lg p-3 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm text-gray-400">Address</label>
                <input
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="bg-[#0A0A0A] border border-[#FFFFFF20] rounded-lg p-3 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">City</label>
                <input
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="bg-[#0A0A0A] border border-[#FFFFFF20] rounded-lg p-3 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">ZIP Code</label>
                <input
                  required
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  className="bg-[#0A0A0A] border border-[#FFFFFF20] rounded-lg p-3 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm text-gray-400">Country</label>
                <input
                  required
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="bg-[#0A0A0A] border border-[#FFFFFF20] rounded-lg p-3 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#151515] p-6 rounded-xl border border-[#FFFFFF10] flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Payment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm text-gray-400">Card Number</label>
                <input
                  required
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="0000 0000 0000 0000"
                  className="bg-[#0A0A0A] border border-[#FFFFFF20] rounded-lg p-3 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Expiry Date</label>
                <input
                  required
                  name="expiry"
                  value={formData.expiry}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  className="bg-[#0A0A0A] border border-[#FFFFFF20] rounded-lg p-3 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">CVC</label>
                <input
                  required
                  name="cvc"
                  value={formData.cvc}
                  onChange={handleChange}
                  placeholder="123"
                  className="bg-[#0A0A0A] border border-[#FFFFFF20] rounded-lg p-3 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
