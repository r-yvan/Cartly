"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
}

const AnalyticsCard = ({ title, value, change, icon, trend = "neutral" }: AnalyticsCardProps) => {
  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-gray-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0A0A0A] border border-[#FFFFFF10] rounded-xl p-6 hover:border-violet-500/50 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-2">{title}</p>
          <h3 className="text-3xl font-bold mb-1">{value}</h3>
          {change && (
            <p className={`text-sm ${trendColors[trend]}`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-violet-600/20 rounded-lg">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsCard;
