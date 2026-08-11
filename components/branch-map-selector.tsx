"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useCart } from "@/hooks/use-cart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Navigation, AlertCircle, Check, Loader2 } from "lucide-react";

interface Branch {
  id: string;
  name_ar: string;
  name_en: string;
  address_ar: string;
  address_en: string;
  phone?: string;
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
}

interface BranchMapSelectorProps {
  lang: "ar" | "en";
  /** Auto-pick nearest branch on enter; false when user is manually changing branch */
  autoSelectNearest?: boolean;
}

const mapContainerStyle = {
  width: "100%",
  height: "450px",
  borderRadius: "12px",
};

// Default center (Saudi Arabia - Riyadh)
const defaultCenter = {
  lat: 24.7136,
  lng: 46.6753,
};

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function BranchMapSelector({
  lang,
  autoSelectNearest = true,
}: BranchMapSelectorProps) {
  const [mounted, setMounted] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingBranchId, setPendingBranchId] = useState<string | null>(null);
  const [isFindingNearest, setIsFindingNearest] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [autoSelectFailed, setAutoSelectFailed] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const autoSelectAttemptedRef = useRef(false);

  const { selectedBranchId, setSelectedBranch, cart, clearCart } = useCart();

  // Ensure component only renders on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
    language: lang,
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      apiUrl = apiUrl.replace(/\/api\/?$/, "");
      const response = await fetch(`${apiUrl}/api/branches?is_active=true`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.branches && Array.isArray(data.branches)) {
        // Normalize lat/lng fields
        const normalizedBranches = data.branches
          .map((branch: any) => ({
            ...branch,
            lat: Number(branch.lat ?? branch.latitude),
            lng: Number(branch.lng ?? branch.longitude),
          }))
          .filter(
            (branch: Branch) =>
              Number.isFinite(branch.lat) && Number.isFinite(branch.lng)
          );
        setBranches(normalizedBranches);

        if (normalizedBranches.length === 0) {
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

  const findNearestBranch = useCallback(
    (location: { lat: number; lng: number }, branchList: Branch[]) => {
      if (branchList.length === 0) return null;

      return branchList.reduce((nearest, branch) => {
        const nearestDistance = calculateDistance(
          location.lat,
          location.lng,
          nearest.lat,
          nearest.lng
        );
        const branchDistance = calculateDistance(
          location.lat,
          location.lng,
          branch.lat,
          branch.lng
        );
        return branchDistance < nearestDistance ? branch : nearest;
      });
    },
    []
  );

  const applyNearestBranch = useCallback(
    (
      location: { lat: number; lng: number },
      branchList: Branch[],
      options?: { silent?: boolean }
    ) => {
      setUserLocation(location);
      setMapCenter(location);

      const nearest = findNearestBranch(location, branchList);
      if (!nearest) {
        if (!options?.silent) {
          setLocationError(
            lang === "ar"
              ? "لا توجد فروع متاحة للاختيار"
              : "No branches available to select"
          );
        }
        setIsFindingNearest(false);
        setAutoSelectFailed(true);
        return false;
      }

      // Auto-select should not trip cart-change warning on first entry
      if (
        !options?.silent &&
        cart.length > 0 &&
        selectedBranchId &&
        selectedBranchId !== nearest.id
      ) {
        setPendingBranchId(nearest.id);
        setShowWarning(true);
        setSelectedMarker(nearest.id);
      } else {
        setSelectedBranch(nearest.id);
        setSelectedMarker(nearest.id);
      }

      setMapCenter({ lat: nearest.lat, lng: nearest.lng });

      if (mapRef.current) {
        mapRef.current.panTo({ lat: nearest.lat, lng: nearest.lng });
        mapRef.current.setZoom(14);
      }

      setIsFindingNearest(false);
      return true;
    },
    [
      cart.length,
      findNearestBranch,
      lang,
      selectedBranchId,
      setSelectedBranch,
    ]
  );

  const handleBranchSelect = (branchId: string) => {
    // If cart has items from different branch, show warning
    if (cart.length > 0 && selectedBranchId && selectedBranchId !== branchId) {
      setPendingBranchId(branchId);
      setShowWarning(true);
      return;
    }

    setSelectedBranch(branchId);
    setSelectedMarker(branchId);
  };

  // Auto-select nearest branch when entering the menu
  useEffect(() => {
    if (!autoSelectNearest) return;
    if (selectedBranchId) return;
    if (loading || error) return;
    if (branches.length === 0) return;
    if (autoSelectAttemptedRef.current) return;

    autoSelectAttemptedRef.current = true;
    setIsFindingNearest(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setIsFindingNearest(false);
      setAutoSelectFailed(true);
      setLocationError(
        lang === "ar"
          ? "تعذر تحديد موقعك تلقائياً. اختر الفرع يدوياً من الخريطة."
          : "Couldn't detect your location. Please choose a branch on the map."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyNearestBranch(
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          branches,
          { silent: true }
        );
      },
      () => {
        setIsFindingNearest(false);
        setAutoSelectFailed(true);
        setLocationError(
          lang === "ar"
            ? "تعذر تحديد موقعك تلقائياً. اختر الفرع يدوياً من الخريطة."
            : "Couldn't detect your location. Please choose a branch on the map."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }, [
    autoSelectNearest,
    selectedBranchId,
    loading,
    error,
    branches,
    lang,
    applyNearestBranch,
  ]);

  // When user is changing branch manually, still try to show their location on the map
  useEffect(() => {
    if (autoSelectNearest) return;
    if (userLocation || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setMapCenter(location);
      },
      () => {
        // Keep default map center
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }, [autoSelectNearest, userLocation]);

  const handleSelectNearestBranch = () => {
    setLocationError(null);
    setIsFindingNearest(true);

    const finishWithLocation = (location: { lat: number; lng: number }) => {
      applyNearestBranch(location, branches);
    };

    if (userLocation) {
      finishWithLocation(userLocation);
      return;
    }

    if (!navigator.geolocation) {
      setLocationError(
        lang === "ar"
          ? "المتصفح لا يدعم خدمات الموقع"
          : "Browser doesn't support geolocation"
      );
      setIsFindingNearest(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        finishWithLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setLocationError(
          lang === "ar"
            ? "فشل الحصول على موقعك. يرجى السماح بالوصول للموقع ثم المحاولة مرة أخرى."
            : "Failed to get your location. Please allow location access and try again."
        );
        setIsFindingNearest(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000,
      }
    );
  };

  const handleConfirmBranchChange = () => {
    if (pendingBranchId) {
      clearCart();
      setSelectedBranch(pendingBranchId);
      setSelectedMarker(pendingBranchId);
      setShowWarning(false);
      setPendingBranchId(null);
    }
  };

  const handleCancelBranchChange = () => {
    setShowWarning(false);
    setPendingBranchId(null);
  };

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      // Fit bounds to show all branches
      if (branches.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        branches.forEach((branch) => {
          bounds.extend({ lat: branch.lat, lng: branch.lng });
        });
        if (userLocation) {
          bounds.extend(userLocation);
        }
        map.fitBounds(bounds);
      }
    },
    [branches, userLocation]
  );

  const showAutoSelectLoading =
    autoSelectNearest &&
    !selectedBranchId &&
    !autoSelectFailed &&
    (loading || isFindingNearest);

  // Don't render until mounted on client
  if (!mounted || loading || showAutoSelectLoading) {
    return (
      <div className="w-full mb-8">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">
              {autoSelectNearest
                ? lang === "ar"
                  ? "جاري تحديد أقرب فرع وفتح المنيو..."
                  : "Finding your nearest branch..."
                : lang === "ar"
                  ? "جاري تحميل الفروع..."
                  : "Loading branches..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || loadError) {
    return (
      <div className="w-full mb-8">
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error ||
              (lang === "ar" ? "فشل تحميل الخريطة" : "Failed to load map")}
          </AlertDescription>
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

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  return (
    <div className="w-full mb-8">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {lang === "ar" ? "🗺️ اختر الفرع" : "🗺️ Choose a Branch"}
        </h2>
        <p className="text-gray-600 mb-3">
          {lang === "ar"
            ? "اضغط على فرع من الخريطة، أو استخدم زر أقرب فرع"
            : "Tap a branch on the map, or use the nearest branch button"}
        </p>
        <Button
          onClick={handleSelectNearestBranch}
          disabled={isFindingNearest || branches.length === 0}
          className="bg-orange-500 hover:bg-orange-600 text-white inline-flex items-center gap-2"
        >
          {isFindingNearest ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {lang === "ar" ? "جاري تحديد أقرب فرع..." : "Finding nearest branch..."}
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              {lang === "ar" ? "اختيار أقرب فرع" : "Select Nearest Branch"}
            </>
          )}
        </Button>
        {locationError && (
          <Alert className="mt-3 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {locationError}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Warning Dialog */}
      {showWarning && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {lang === "ar"
              ? "تحتوي سلتك على منتجات من فرع آخر. هل تريد مسح السلة واختيار هذا الفرع؟"
              : "Your cart contains items from another branch. Clear cart and select this branch?"}
          </AlertDescription>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelBranchChange}
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmBranchChange}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {lang === "ar" ? "تأكيد ومسح السلة" : "Confirm & Clear Cart"}
            </Button>
          </div>
        </Alert>
      )}

      {/* Selected Branch Info */}
      {selectedBranch && (
        <Card className="mb-4 border-2 border-orange-500 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg mb-1">
                  {lang === "ar"
                    ? selectedBranch.name_ar
                    : selectedBranch.name_en}
                </h3>
                <p className="text-gray-600 text-sm flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {lang === "ar"
                    ? selectedBranch.address_ar
                    : selectedBranch.address_en}
                </p>
                {selectedBranch.phone && (
                  <p className="text-gray-600 text-sm mt-1">
                    📞 {selectedBranch.phone}
                  </p>
                )}
                {userLocation && (
                  <p className="text-orange-600 text-sm mt-2 font-medium">
                    📍{" "}
                    {calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      selectedBranch.lat,
                      selectedBranch.lng
                    ).toFixed(1)}{" "}
                    {lang === "ar" ? "كم من موقعك" : "km from your location"}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map */}
      {isLoaded ? (
        <div className="relative">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={12}
            onLoad={onMapLoad}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            {/* User Location Marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#3b82f6",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                }}
              />
            )}

            {/* Branch Markers */}
            {branches.map((branch) => (
              <Marker
                key={branch.id}
                position={{ lat: branch.lat, lng: branch.lng }}
                onClick={() => handleBranchSelect(branch.id)}
                icon={{
                  url:
                    selectedBranchId === branch.id
                      ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%23f97316'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E"
                      : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%23ef4444'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
                  scaledSize: new google.maps.Size(40, 40),
                }}
              >
                {selectedMarker === branch.id && (
                  <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                    <div className="p-2" dir={lang === "ar" ? "rtl" : "ltr"}>
                      <h3 className="font-bold text-gray-800 mb-1">
                        {lang === "ar" ? branch.name_ar : branch.name_en}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {lang === "ar" ? branch.address_ar : branch.address_en}
                      </p>
                      {userLocation && (
                        <p className="text-xs text-orange-600 font-medium">
                          📍{" "}
                          {calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            branch.lat,
                            branch.lng
                          ).toFixed(1)}{" "}
                          {lang === "ar" ? "كم" : "km"}
                        </p>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}
          </GoogleMap>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">
                {lang === "ar" ? "موقعك" : "Your Location"}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="text-gray-700">
                {lang === "ar" ? "فرع متاح" : "Available Branch"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span className="text-gray-700">
                {lang === "ar" ? "فرع محدد" : "Selected Branch"}
              </span>
            </div>
          </div>

          {/* Nearest branch shortcut on map */}
          <div className="absolute top-4 end-4">
            <Button
              size="sm"
              onClick={handleSelectNearestBranch}
              disabled={isFindingNearest || branches.length === 0}
              className="bg-white text-gray-800 hover:bg-orange-50 border shadow-lg inline-flex items-center gap-2"
            >
              {isFindingNearest ? (
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
              ) : (
                <Navigation className="w-4 h-4 text-orange-500" />
              )}
              {lang === "ar" ? "أقرب فرع" : "Nearest"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      )}

      {/* Help Text */}
      {!selectedBranchId && (
        <Alert className="mt-4">
          <Navigation className="h-4 w-4" />
          <AlertDescription>
            {lang === "ar"
              ? "💡 اختر فرعاً من الخريطة أو اضغط «اختيار أقرب فرع»"
              : "💡 Pick a branch on the map or tap “Select Nearest Branch”"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
