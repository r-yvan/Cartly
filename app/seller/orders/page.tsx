"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { IconPackage, IconShoppingCart, IconChartBar, IconSettings } from "@tabler/icons-react";

const navItems = [
  { label: "Dashboard", href: "/seller/dashboard", icon: <IconChartBar size={20} /> },
  { label: "Products", href: "/seller/products", icon: <IconPackage size={20} /> },
  { label: "Orders", href: "/seller/orders", icon: <IconShoppingCart size={20} /> },
  { label: "Settings", href: "/seller/settings", icon: <IconSettings size={20} /> },
];

const SellerOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/seller/orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetch("/api/seller/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order", error);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Seller Portal">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Orders</h1>
          <p className="text-gray-400">Manage and fulfill your orders</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[#0A0A0A] border border-[#FFFFFF10] rounded-xl p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Order #{order.orderNumber}</h3>
                    <p className="text-gray-400 text-sm">{order.user.name} • {order.user.email}</p>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="bg-[#151515] border border-[#FFFFFF20] rounded-lg px-4 py-2"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </div>
                <div className="space-y-2">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 text-sm">
                      <img
                        src={item.product.images[0]?.url}
                        alt={item.product.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">${Number(item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SellerOrders;
