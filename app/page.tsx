"use client";

import { GridPatternDashed } from "@/components/GridPatternDashed";
import TopNavigationBar from "@/components/TopNavigationBar";
import FeatureCard from "@/components/FeatureCard";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import {
  IconChartPie,
  IconCoins,
  IconTruck,
  IconShieldCheck,
  IconArrowRight,
  IconStar,
} from "@tabler/icons-react";

const Home = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Navigation */}
      <div className="flex justify-center w-full pt-1 z-20 relative">
        <TopNavigationBar />
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 z-0">
        <GridPatternDashed />
      </div>
    </div>
  );
};

export default Home;
