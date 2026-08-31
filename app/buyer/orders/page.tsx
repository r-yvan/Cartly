"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { IconHome, IconShoppingCart, IconUser } from "@tabler/icons-react";
import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/buyer/dashboard", icon: <IconHome size={20} /> },
  { label: "Orders", href: "/buyer/orders", icon: <IconShoppingCart size={20} /> },
  { label: "Profile", href: "/buyer/profile", icon: <IconUser size={20} /> },
];

const BuyerOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/buyer/orders");
      const data = await res.json();
      setOrders(data);
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
          <h1 className="text-4xl font-bold mb-2">My Orders</h1>
          <p className="text-gray-400">View and track all your orders</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[#0A0A0A] border border-[#FFFFFF10] rounded-xl p-6 hover:border-violet-500/50 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Order #{order.orderNumber}</h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold mb-1">${Number(order.total).toFixed(2)}</p>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      order.status === "DELIVERED" ? "bg-green-500/20 text-green-400" :
                      order.status === "SHIPPED" || order.status === "IN_TRANSIT" ? "bg-blue-500/20 text-blue-400" :
                      order.status === "PROCESSING" ? "bg-purple-500/20 text-purple-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.product.images[0]?.url || "/placeholder.png"}
                        alt={item.product.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">${Number(item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/buyer/orders/${order.id}`}
                    className="px-4 py-2 bg-[#151515] hover:bg-[#202020] rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                  {order.tracking && (
                    <Link
                      href={`/buyer/orders/${order.id}/track`}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                    >
                      Track Order
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">You haven't placed any orders yet</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg font-semibold transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BuyerOrders;
