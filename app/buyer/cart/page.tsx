"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  IconTrash,
  IconPlus,
  IconMinus,
  IconShoppingCart,
} from "@tabler/icons-react";

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: { url: string; altText?: string }[];
  };
  variant?: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
  selectedOptions?: any;
}

interface Cart {
  id: string;
  items: CartItem[];
}

const Cart = () => {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const cartData = await response.json();
        setCart(cartData);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchCart();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdating(itemId);
    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          quantity: newQuantity,
        }),
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdating(itemId);
    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setUpdating(null);
    }
  };

  const calculateTotal = () => {
    if (!cart?.items.length) return 0;

    return cart.items.reduce((total, item) => {
      const price = item.variant?.price || item.product.price;
      return total + price * item.quantity;
    }, 0);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        <p className="mt-4 text-white text-lg">Loading cart...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a]">
        <IconShoppingCart size={64} className="text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Please sign in</h2>
        <p className="text-gray-400 mb-4">
          You need to be signed in to view your cart.
        </p>
        <a
          href="/auth/signin"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#0a0a0a] min-h-screen">
      <div className="flex justify-center p-6">
        <h1 className="text-5xl font-bold text-white">Shopping Cart</h1>
      </div>

      {!cart?.items.length ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <IconShoppingCart size={96} className="text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-400 mb-6">
            Add some products to get started!
          </p>
          <a
            href="/buyer/market"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 p-6">
          <div className="flex-1">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Cart Items</h2>
              <div className="space-y-4">
                {cart.items.map((item) => {
                  const price = item.variant?.price || item.product.price;
                  const totalPrice = price * item.quantity;
                  const imageUrl =
                    item.product.images[0]?.url || "/placeholder-product.jpg";

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg"
                    >
                      <img
                        src={imageUrl}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">
                          {item.product.name}
                        </h3>
                        {item.variant && (
                          <p className="text-gray-400 text-sm">
                            Variant: {item.variant.name}
                          </p>
                        )}
                        <p className="text-blue-400 font-bold">
                          ${price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={updating === item.id || item.quantity <= 1}
                          className="p-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                        >
                          <IconMinus size={16} className="text-white" />
                        </button>
                        <span className="text-white font-semibold min-w-[40px] text-center">
                          {updating === item.id ? "..." : item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={updating === item.id}
                          className="p-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                        >
                          <IconPlus size={16} className="text-white" />
                        </button>
                      </div>
                      <div className="text-white font-bold">
                        ${totalPrice.toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="p-2 rounded bg-red-600 hover:bg-red-700 disabled:opacity-50"
                      >
                        <IconTrash size={20} className="text-white" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:w-80">
            <div className="bg-gray-900 rounded-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Order Summary
              </h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg mt-6 font-semibold transition-colors">
                Proceed to Checkout
              </button>
              <a
                href="/buyer/market"
                className="block text-center text-blue-400 hover:text-blue-300 mt-4"
              >
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
