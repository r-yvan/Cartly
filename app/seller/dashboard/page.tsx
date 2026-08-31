"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import AnalyticsCard from "@/components/AnalyticsCard";
import { IconPackage, IconShoppingCart, IconChartBar, IconSettings, IconCurrencyDollar, IconStar } from "@tabler/icons-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const navItems = [
  { label: "Dashboard", href: "/seller/dashboard", icon: <IconChartBar size={20} /> },
  { label: "Products", href: "/seller/products", icon: <IconPackage size={20} /> },
  { label: "Orders", href: "/seller/orders", icon: <IconShoppingCart size={20} /> },
  { label: "Settings", href: "/seller/settings", icon: <IconSettings size={20} /> },
];

interface Analytics {
  totalProducts: number;
  activeProducts: number;
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  averageRating: number;
  salesByDay: Array<{ date: string; revenue: number; orders: number }>;
}

const SellerDashboard = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/seller/analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Seller Portal">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's your store overview.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : analytics ? (
          <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <AnalyticsCard
                title="Total Revenue"
                value={`$${analytics.totalRevenue.toFixed(2)}`}
                icon={<IconCurrencyDollar size={24} className="text-violet-400" />}
                trend="up"
              />
              <AnalyticsCard
                title="Total Orders"
                value={analytics.totalOrders}
                change={`${analytics.pendingOrders} pending`}
                icon={<IconShoppingCart size={24} className="text-violet-400" />}
              />
              <AnalyticsCard
                title="Active Products"
                value={analytics.activeProducts}
                change={`${analytics.totalProducts} total`}
                icon={<IconPackage size={24} className="text-violet-400" />}
              />
              <AnalyticsCard
                title="Average Rating"
                value={analytics.averageRating.toFixed(1)}
                icon={<IconStar size={24} className="text-violet-400" />}
                trend="up"
              />
            </div>

            {/* Sales Chart */}
            <div className="bg-[#0A0A0A] border border-[#FFFFFF10] rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Sales Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF10" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A0A0A",
                      border: "1px solid #FFFFFF20",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400">Failed to load analytics</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SellerDashboard;
