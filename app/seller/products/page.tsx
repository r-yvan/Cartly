"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { IconPackage, IconShoppingCart, IconChartBar, IconSettings, IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/seller/dashboard", icon: <IconChartBar size={20} /> },
  { label: "Products", href: "/seller/products", icon: <IconPackage size={20} /> },
  { label: "Orders", href: "/seller/orders", icon: <IconShoppingCart size={20} /> },
  { label: "Settings", href: "/seller/settings", icon: <IconSettings size={20} /> },
];

const SellerProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/seller/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await fetch(`/api/seller/products?id=${id}`, { method: "DELETE" });
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error("Failed to delete product", error);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Seller Portal">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Products</h1>
            <p className="text-gray-400">Manage your product inventory</p>
          </div>
          <Link
            href="/seller/products/new"
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg font-semibold transition-colors"
          >
            <IconPlus size={20} />
            Add Product
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-[#0A0A0A] border border-[#FFFFFF10] rounded-xl p-6 hover:border-violet-500/50 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-[#151515] rounded-lg overflow-hidden flex-shrink-0">
                    {product.images[0] && (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-violet-400 font-semibold">${Number(product.price).toFixed(2)}</span>
                      <span className="text-gray-400">Stock: {product.quantity}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.status === "ACTIVE" ? "bg-green-500/20 text-green-400" :
                        product.status === "DRAFT" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-gray-500/20 text-gray-400"
                      }`}>
                        {product.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/seller/products/${product.id}/edit`}
                      className="p-2 hover:bg-[#151515] rounded-lg transition-colors"
                    >
                      <IconEdit size={20} className="text-gray-400" />
                    </Link>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 hover:bg-[#151515] rounded-lg transition-colors"
                    >
                      <IconTrash size={20} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SellerProducts;
