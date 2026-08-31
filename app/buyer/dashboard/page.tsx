"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { IconHome, IconShoppingCart, IconUser, IconPackage } from "@tabler/icons-react";
import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/buyer/dashboard", icon: <IconHome size={20} /> },
  { label: "Orders", href: "/buyer/orders", icon: <IconShoppingCart size={20} /> },
  { label: "Profile", href: "/buyer/profile", icon: <IconUser size={20} /> },
];

const BuyerDashboard = () => {
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/buyer/orders");
      const data = await res.json();
      setRecentOrders(data.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Buyer Portal">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-gray-400">Here's what's happening with your orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/products" className="bg-[#0A0A0A] border border-[#FFFFFF10] rounded-xl p-6 hover:border-violet-500/50 transition-all">
            <IconPackage size={32} className="text-violet-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Browse Products</h3>
            <p className="text-gray-400 text-sm">Discover amazing products</p>
          </Link>
          
          <Link href="/buyer/orders" className="bg-[#0A0A0A] border border-[#FFFFFF10] rounded-xl p-6 hover:border-violet-500/50 transition-all">
            <IconShoppingCart size={32} className="text-violet-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">My Orders</h3>
            <p className="text-gray-400 text-sm">Track your purchases</p>
          </Link>
          
          <Link href="/cart" className="bg-[#0A0A0A] border border-[#FFFFFF10] rounded-xl p-6 hover:border-violet-500/50 transition-all">
            <IconShoppingCart size={32} className="text-violet-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Shopping Cart</h3>
            <p className="text-gray-400 text-sm">Review your cart</p>
          </Link>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/buyer/orders/${order.id}`}
                  className="block bg-[#0A0A0A] border border-[#FFFFFF10] rounded-xl p-6 hover:border-violet-500/50 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold mb-1">Order #{order.orderNumber}</h3>
                      <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">${Number(order.total).toFixed(2)}</p>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        order.status === "DELIVERED" ? "bg-green-500/20 text-green-400" :
                        order.status === "SHIPPED" ? "bg-blue-500/20 text-blue-400" :
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>No orders yet. Start shopping!</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BuyerDashboard;
