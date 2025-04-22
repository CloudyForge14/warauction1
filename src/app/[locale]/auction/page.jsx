"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import jwt from "jsonwebtoken";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "@/utils/supabase/client";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";

const ViewImageModal = memo(({ imageUrl, onClose }) => {
  const handleImageClick = useCallback((e) => e.stopPropagation(), []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh] p-4">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Auction item preview"
            className="max-w-full max-h-full object-contain"
            onClick={handleImageClick}
          />
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full"
        >
          &times;
        </button>
      </div>
    </div>
  );
});

export default function AuctionItems() {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [paymentType, setPaymentType] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const queryClient = new QueryClient();

  const [viewImageModal, setViewImageModal] = useState({
    isOpen: false,
    imageUrl: null,
  });

  const openImageModal = useCallback((imageUrl) => {
    setViewImageModal({
      isOpen: true,
      imageUrl,
    });
  }, []);

  const closeImageModal = useCallback(() => {
    setViewImageModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const t = useTranslations("AuctionItems");

  // Авторизация / user
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwt.decode(token);
        setUser(decoded);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Failed to decode token:", err);
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!error && user) {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const refreshSession = async () => {
      const { data, error } = await supabase.auth.refreshSession();
      if (!error) {
        localStorage.setItem("authToken", data.session.access_token);
        console.log("Token refreshed successfully.");
      }
    };
    refreshSession();
  }, []);

  // fetchAuctionItems
  const fetchAuctionItems = async () => {
    console.log("Fetching auction items...");
    const response = await fetch("/api/auction-items");
    if (!response.ok) {
      throw new Error("Failed to fetch auction items");
    }
    return await response.json();
  };

  const {
    data: auctionItemsFromServer,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["auctionItems"],
    queryFn: fetchAuctionItems,
    refetchInterval: 5000,
    staleTime: 0,
  });

  useEffect(() => {
    if (!auctionItemsFromServer) return;

    setItems((prevItems) => {
      const updatedItems = auctionItemsFromServer.map((serverItem) => {
        const existingItem = prevItems.find(
          (item) => item.id === serverItem.id
        );
        return {
          ...serverItem,
          time_left: serverItem.time_left,
        };
      });

      if (updatedItems.length < 5) {
        const placeholders = Array.from(
          { length: 5 - updatedItems.length },
          (_, index) => ({
            id: `placeholder-${index}`,
            name: "Coming Soon",
            description: "This item will be available soon!",
            current_bid: 0,
            min_raise: 0,
            time_left: 0,
            image_url: "/auction/comingsoon.jpg",
          })
        );
        return [...updatedItems, ...placeholders];
      }

      return updatedItems;
    });
  }, [auctionItemsFromServer]);

  // Локальный таймер для time_left
  useEffect(() => {
    if (isLoading) return;

    const intervalId = setInterval(() => {
      setItems((prevItems) =>
        prevItems.map((item) => ({
          ...item,
          time_left: Math.max(item.time_left - 1, 0),
        }))
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isLoading]);

  // Модалки, Bid-логика
  const openModal = (item) => {
    if (!item) {
      toast.error("Invalid item.");
      return;
    }
    setSelectedItem({
      ...item,
      bid: item.current_bid + item.min_raise,
    });
    setCurrentImageIndex(0);
    setPaymentType("");
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  const handleBidChange = (change, minRaise) => {
    setSelectedItem((prevItem) => {
      if (!prevItem) return null;
      const newBid = Math.max(
        prevItem.current_bid + minRaise,
        (prevItem.bid || prevItem.current_bid) + change
      );
      return {
        ...prevItem,
        bid: newBid,
      };
    });
  };

  const formatTime = (seconds) => {
    if (seconds < 0) seconds = 0;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  const handlePlaceBid = async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to place a bid");
      return;
    }

    if (!paymentType) {
      toast.error("Payment type not chosen!");
      return;
    }

    if (!selectedItem || !selectedItem.id || !selectedItem.bid) {
      toast.error("Invalid bid data");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Missing token");
        return;
      }

      const response = await fetch(`/api/place-bid/${selectedItem.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newBid: selectedItem.bid,
          paymentType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to place bid");
      }

      const updatedItem = await response.json();
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        )
      );

      toast.success("Bid placed successfully!");
      closeModal();
      queryClient.invalidateQueries(["auctionItems"]);
    } catch (err) {
      console.error("Error placing bid:", err);
      toast.error(err.message || "Failed to place bid. Try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-gray-900 text-white">
        <div className="loader"></div>
        <style jsx>{`
          .loader {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #fff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (queryError) {
    return <div>{String(queryError)}</div>;
  }

  return (
    <main className="bg-gray-900 text-white h-auto py-12">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        toastStyle={{
          marginTop: "60px",
          backgroundColor: "#1f2937",
          color: "#fff",
          border: "1px solid #374151",
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
        }}
        progressStyle={{ backgroundColor: "#2563eb" }}
      />

      <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "itemListElement": items.slice(0, 5).map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": ["Product", "Collectible"],
                  "name": item.name,
                  "image": item.image_url,
                  "offers": {
                    "@price": item.current_bid,
                    "priceCurrency": "USD"
                  }
                }
              }))
            })}
          </script>

      <h1 className="text-3xl font-bold text-center mb-8">Auction Items</h1>
      
      {viewImageModal.isOpen && (
        <ViewImageModal
          imageUrl={viewImageModal.imageUrl}
          onClose={closeImageModal}
        />
      )}

      <div
        className="grid gap-6 px-6"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          maxWidth: "1440px",
          margin: "0 auto",
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => openModal(item)}
            className="relative bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:scale-105 hover:border-yellow-500 transition-transform duration-300 border-2 border-transparent"
          >
            <div className="absolute top-2 left-2 bg-yellow-500 text-black px-3 py-1 rounded text-sm font-semibold">
              {formatTime(item.time_left)}
            </div>

            <img
              src={
                imageErrors[item.id]
                  ? "/auction/comingsoon.jpg"
                  : item.image_url
              }
              alt={item.name}
              className="w-full h-48 object-contain cursor-pointer"
              loading="lazy"
              onError={() =>
                setImageErrors((prev) => ({ ...prev, [item.id]: true }))
              }
              onClick={(e) => {
                e.stopPropagation();
                openImageModal(
                  imageErrors[item.id]
                    ? "/auction/comingsoon.jpg"
                    : item.image_url
                );
              }}
            />

            <div className="p-4 bg-gray-900 text-white text-center">
              <h2 className="text-xl font-bold mb-2">{item.name}</h2>
              <p className="text-gray-400 text-sm mb-4 whitespace-pre-line">
                {item.description}
              </p>
              <hr className="border-t border-gray-600 mb-4" />
              <p className="font-semibold text-lg">
                Current Bid:{" "}
                <span className="text-yellow-500 font-bold">
                  ${item.current_bid?.toFixed(2) || "0.00"}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Остальной код модальных окон остается без изменений */}
      {/* ... */}
    </main>
  );
}


// app/auction/page.js (or layout.js)
export const metadata = {
  title: "Military Auctions | CloudyForge",
  description: "Bid on authentic war artifacts to support Ukraine. Each purchase funds artillery strikes through Project Revenge.",
  keywords: [
    "military auctions",
    "auction",
    "war artifacts for sale",
    "signed artillery shells",
    "support Ukraine army",
    "war artifacts",
    "military collectibles",
  ],
  openGraph: {
    title: "Live Military Auctions | CloudyForge",
    description: "Exclusive auctions funding artillery messages to Russian forces.",
  },
  alternates: {
    canonical: "https://cloudyforge.com/auction",
    languages: {
      "en-US": "https://cloudyforge.com/en/auction",
      "uk-UA": "https://cloudyforge.com/uk/auction",
    },
  }
};