"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/contexts/cart-context";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Branch {
  id: string;
  name_ar: string;
  name_en: string;
  address_ar: string;
  address_en: string;
  is_active: boolean;
}

interface BranchSelectorProps {
  lang: "ar" | "en";
}

export default function BranchSelector({ lang }: BranchSelectorProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const { selectedBranchId, setSelectedBranch, cart, clearCart } = useCart();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      // Remove trailing /api if present to avoid duplication
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      apiUrl = apiUrl.replace(/\/api\/?$/, "");
      const response = await fetch(`${apiUrl}/api/branches?is_active=true`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.branches && Array.isArray(data.branches)) {
        setBranches(data.branches);
        if (data.branches.length === 0) {
          setError(
            lang === "ar"
              ? "لا توجد فروع متاحة حالياً"
              : "No branches available"
          );
        }
      } else {
        setError(
          lang === "ar" ? "خطأ في تحميل الفروع" : "Error loading branches"
        );
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      setError(
        lang === "ar"
          ? "فشل تحميل الفروع. يرجى التحقق من الاتصال بالخادم."
          : "Failed to load branches. Please check server connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBranchSelect = (branchId: string) => {
    // If cart has items from different branch, show warning
    if (cart.length > 0 && selectedBranchId && selectedBranchId !== branchId) {
      setShowWarning(true);
      return;
    }

    setSelectedBranch(branchId);
    setShowWarning(false);
  };

  const handleConfirmBranchChange = (branchId: string) => {
    // Clear cart and change branch
    clearCart();
    setSelectedBranch(branchId);
    setShowWarning(false);
  };

  if (loading) {
    return (
      <div className="w-full mb-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mb-8">
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="w-full mb-8">
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {lang === "ar"
              ? "لا توجد فروع متاحة حالياً. يرجى المحاولة لاحقاً."
              : "No branches available at the moment. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {lang === "ar" ? "اختر الفرع" : "Select Branch"}
      </h2>

      {showWarning && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {lang === "ar"
              ? "تحتوي سلتك على منتجات من فرع آخر. هل تريد مسح السلة واختيار هذا الفرع؟"
              : "Your cart contains items from another branch. Clear cart and select this branch?"}
          </AlertDescription>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setShowWarning(false)}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded transition"
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <Card
            key={branch.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedBranchId === branch.id
                ? "ring-2 ring-orange-500 shadow-md"
                : "hover:ring-1 hover:ring-gray-300"
            }`}
            onClick={() => {
              if (showWarning) {
                handleConfirmBranchChange(branch.id);
              } else {
                handleBranchSelect(branch.id);
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <h3 className="font-bold text-gray-800">
                      {lang === "ar" ? branch.name_ar : branch.name_en}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {lang === "ar" ? branch.address_ar : branch.address_en}
                  </p>
                </div>
                {selectedBranchId === branch.id && (
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!selectedBranchId && (
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {lang === "ar"
              ? "يرجى اختيار فرع للبدء في الطلب"
              : "Please select a branch to start ordering"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
