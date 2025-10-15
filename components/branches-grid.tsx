"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Loader2 } from "lucide-react";
import { getBranches, Branch } from "@/services/apiBranches";

interface BranchesGridProps {
  lang: "en" | "ar";
  dict: any;
}

export default function BranchesGrid({ lang, dict }: BranchesGridProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch branches from Supabase
  const {
    data: branches = [],
    isLoading: branchesLoading,
    error: branchesError,
  } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    enabled: mounted,
  });

  const callBranch = (phone: string) => {
    if (mounted) {
      // Ensure window is available
      window.open(`tel:${phone}`, "_self");
    }
  };

  const openInMaps = (branch: Branch) => {
    if (!mounted) return;

    // If google_map URL exists, use it
    if (branch.google_map) {
      window.open(branch.google_map, "_blank");
      return;
    }

    // Otherwise, use lat/lng to create Google Maps URL
    if (branch.lat && branch.lng) {
      const branchName = lang === "ar" ? branch.name_ar : branch.name_en;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${
        branch.lat
      },${branch.lng}&query_place_id=${encodeURIComponent(branchName)}`;
      window.open(mapsUrl, "_blank");
      return;
    }

    // If no coordinates available, show alert
    alert(
      lang === "ar"
        ? "لا توجد معلومات موقع متاحة لهذا الفرع"
        : "No location information available for this branch"
    );
  };

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <CardContent className="p-0">
              <div className="aspect-[4/3] bg-gray-200"></div>
              <div className="p-6 space-y-4">
                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="flex space-x-4 rtl:space-x-reverse">
                  <div className="h-10 w-1/2 bg-gray-300 rounded-xl"></div>
                  <div className="h-10 w-1/2 bg-gray-300 rounded-xl"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (branchesLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          <span className="text-lg font-semibold">
            {lang === "ar" ? "جاري تحميل الفروع..." : "Loading branches..."}
          </span>
        </div>
      </div>
    );
  }

  if (branchesError) {
    // Error is logged internally by the API service
    return (
      <div className="text-center py-20">
        <div className="text-red-500 text-lg font-semibold mb-4">
          {lang === "ar" ? "حدث خطأ في تحميل الفروع" : "Error loading branches"}
        </div>
        <p className="text-gray-500 mb-4">
          {lang === "ar"
            ? "يرجى التحقق من الاتصال بالإنترنت"
            : "Please check your internet connection"}
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          {lang === "ar" ? "إعادة المحاولة" : "Retry"}
        </Button>
      </div>
    );
  }

  // If no branches found, show a message
  if (branches.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-500 text-lg font-semibold mb-4">
          {lang === "ar"
            ? "لا توجد فروع متاحة حالياً"
            : "No branches available"}
        </div>
        <p className="text-gray-400">
          {lang === "ar" ? "يرجى المحاولة لاحقاً" : "Please try again later"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
      {branches.map((branch: Branch) => (
        <Card
          key={branch.id}
          className="overflow-hidden hover:shadow-lg transition-shadow"
        >
          <CardContent className="p-0">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={branch.image || "/placeholder.svg"}
                alt={lang === "ar" ? branch.name_ar : branch.name_en}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-3">
                {lang === "ar" ? branch.name_ar : branch.name_en}
              </h3>

              {/* Area */}
              {(branch.area_ar || branch.area_en) && (
                <div className="mb-2">
                  <span className="text-sm text-gray-500">
                    {lang === "ar" ? branch.area_ar : branch.area_en}
                  </span>
                </div>
              )}

              {/* Address */}
              {(branch.address_ar || branch.address_en) && (
                <div className="flex items-start space-x-2 rtl:space-x-reverse mb-4">
                  <MapPin className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">
                    {lang === "ar" ? branch.address_ar : branch.address_en}
                  </p>
                </div>
              )}

              {/* Working Hours */}
              {branch.works_hours && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">
                      {lang === "ar" ? "ساعات العمل:" : "Working Hours:"}
                    </span>{" "}
                    {branch.works_hours}
                  </p>
                </div>
              )}

              {/* Phone */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6">
                <Phone className="h-5 w-5 text-gray-500" />
                <p className="text-gray-600">{branch.phone}</p>
              </div>

              <div className="flex space-x-4 rtl:space-x-reverse">
                <Button
                  onClick={() => callBranch(branch.phone)}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  <Phone className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {dict.branches.call}
                </Button>
                <Button
                  onClick={() => openInMaps(branch)}
                  variant="outline"
                  className="flex-1"
                  disabled={!branch.google_map && !branch.lat && !branch.lng}
                >
                  <MapPin className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {dict.branches.maps}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
