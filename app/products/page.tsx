"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import TopNavigationBar from "@/components/TopNavigationBar";
import { GridPatternDashed } from "@/components/GridPatternDashed";
import { IconSearch, IconFilter } from "@tabler/icons-react";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: { url: string }[];
  likes?: number;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (searchQuery = "") => {
    setLoading(true);
    try {
      const url = searchQuery
        ? `/api/products?search=${encodeURIComponent(searchQuery)}`
        : "/api/products";
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(search);
  };

  return (
    <div className="flex flex-col gap-10 w-full min-h-screen bg-[#050505] text-white">
      <div className="flex justify-center w-full pt-1 z-20 relative">
        <TopNavigationBar />
      </div>
      <div className="fixed inset-0 z-0">
        <GridPatternDashed />
      </div>

      <div className="z-10 px-4 md:px-16 flex flex-col gap-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 items-center justify-center pt-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600/20 border border-violet-500/30 rounded-full">
            <IconFilter size={16} className="text-violet-400" />
            <span className="text-sm text-violet-300">Discover Products</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-center">
            <span className="bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">
              Explore Our
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
              Collection
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 text-center max-w-2xl">
            Discover amazing products from sellers worldwide
          </p>

          <form onSubmit={handleSearch} className="relative w-full max-w-2xl mt-4">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-2xl py-4 px-6 pl-14 focus:outline-none focus:border-violet-500/50 transition-all text-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <IconSearch
              className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={24}
            />
          </form>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20 justify-items-center max-w-[1600px] mx-auto"
          >
            {products.length > 0 ? (
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard
                    id={product.id}
                    image={product.images[0]?.url || "/placeholder.png"}
                    likes={product.likes || 0}
                    name={product.name}
                    description={product.description}
                    price={product.price}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-400 py-20">
                <p className="text-2xl mb-2">No products found</p>
                <p>Try adjusting your search</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
