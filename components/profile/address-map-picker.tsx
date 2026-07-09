"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Navigation,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

function MapCenterPin() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full"
      aria-hidden
    >
      <svg
        width="40"
        height="52"
        viewBox="0 0 40 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <path
          d="M20 0C9.507 0 1 8.507 1 19c0 13.25 19 33 19 33s19-19.75 19-33C39 8.507 30.493 0 20 0z"
          fill="#DC2626"
        />
        <circle cx="20" cy="19" r="8" fill="white" />
        <circle cx="20" cy="19" r="4" fill="#DC2626" />
      </svg>
      <span className="absolute -bottom-1 left-1/2 h-2 w-6 -translate-x-1/2 rounded-full bg-black/20 blur-sm" />
    </div>
  );
}

interface AddressMapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  onAddressFill: (addressData: {
    street: string;
    city: string;
    area: string;
  }) => void;
  initialLat?: number;
  initialLng?: number;
  lang: string;
  t: any;
  isNewAddress?: boolean;
}

export function AddressMapPicker({
  onLocationSelect,
  onAddressFill,
  initialLat,
  initialLng,
  lang,
  t,
  isNewAddress = false,
}: AddressMapPickerProps) {
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingMapCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  const isAr = lang === "ar";

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    setMounted(true);
  }, []);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey || "",
    libraries,
    language: lang,
  });

  const defaultCenter = {
    lat: initialLat || 31.2001,
    lng: initialLng || 29.9187,
  };

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance;
    const pending = pendingMapCenterRef.current;
    if (pending) {
      pendingMapCenterRef.current = null;
      mapInstance.setCenter(pending);
      mapInstance.setZoom(15);
    }
  }, []);

  const updateLocationFromMapCenter = useCallback(() => {
    const mapInstance = mapRef.current;
    if (!mapInstance) return;

    const center = mapInstance.getCenter();
    if (!center) return;

    const lat = center.lat();
    const lng = center.lng();

    setSelectedLocation({ lat, lng });
    onLocationSelect(lat, lng);
    setError(null);
  }, [onLocationSelect]);

  const handleMapIdle = useCallback(() => {
    updateLocationFromMapCenter();
  }, [updateLocationFromMapCenter]);

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      const mapInstance = mapRef.current;
      if (event.latLng && mapInstance) {
        mapInstance.panTo(event.latLng);
      }
    },
    [],
  );

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const geocodeAndFill = useCallback(
    async (lat: number, lng: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({
          location: { lat, lng },
        });

        if (result.results && result.results.length > 0) {
          const addressComponents = result.results[0].address_components;
          const formattedAddress = result.results[0].formatted_address;

          let street = "";
          let city = "";
          let area = "";

          addressComponents.forEach((component) => {
            const types = component.types;

            if (types.includes("route") || types.includes("street_address")) {
              street = component.long_name;
            } else if (
              types.includes("locality") ||
              types.includes("administrative_area_level_2")
            ) {
              city = component.long_name;
            } else if (
              types.includes("sublocality") ||
              types.includes("neighborhood")
            ) {
              area = component.long_name;
            }
          });

          if (!street && !city && !area) {
            const parts = formattedAddress.split(",");
            street = parts[0] || "";
            city = parts[1] || "";
            area = parts[2] || "";
          }

          onAddressFill({
            street: street || formattedAddress,
            city: city || "",
            area: area || "",
          });
        }
      } catch {
        setError(
          isAr
            ? "فشل في تحديد العنوان تلقائياً."
            : "Failed to auto-fill address.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isAr, onAddressFill],
  );

  const handleAutoFill = async () => {
    if (!selectedLocation) return;
    await geocodeAndFill(selectedLocation.lat, selectedLocation.lng);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(
        isAr
          ? "المتصفح لا يدعم خدمات الموقع."
          : "Browser doesn't support geolocation.",
      );
      return;
    }

    setError(null);
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setSelectedLocation({ lat, lng });
        onLocationSelect(lat, lng);

        if (mapRef.current) {
          mapRef.current.setCenter({ lat, lng });
          mapRef.current.setZoom(15);
        } else {
          pendingMapCenterRef.current = { lat, lng };
        }

        await geocodeAndFill(lat, lng);
      },
      () => {
        setIsLoading(false);
        setError(
          isAr
            ? "فشل الحصول على الموقع. اسمح بالوصول للموقع."
            : "Failed to get location. Allow location access.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );
  };

  useEffect(() => {
    if (isNewAddress && !initialLat && !initialLng && navigator.geolocation) {
      getCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewAddress, initialLat, initialLng]);

  if (!apiKey) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-800">
              {isAr ? "Google Maps غير مضبوط" : "Google Maps not configured"}
            </p>
            <p className="mt-1 text-xs text-red-700 sm:text-sm">
              {isAr
                ? "يمكنك إدخال العنوان يدوياً."
                : "You can enter the address manually."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!mounted || !isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 sm:py-20">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <span className="text-sm text-gray-500">
          {isAr ? "جاري تحميل الخريطة..." : "Loading map..."}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4 lg:rounded-t-2xl lg:border lg:border-b-0 lg:border-white/70 lg:bg-white/95 lg:px-6 lg:shadow-xl lg:backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-red-600 sm:h-5 sm:w-5" />
          <h3 className="text-sm font-bold text-gray-900 sm:text-base">
            {t.addresses.selectLocation}
          </h3>
        </div>
        <p className="mt-0.5 text-xs text-gray-500 sm:mt-1 sm:text-sm">
          {isAr
            ? "حرّك الخريطة لوضع الدبوس على موقع التوصيل"
            : "Move the map to place the pin on your delivery location"}
        </p>
      </div>

      <div className="space-y-3 p-3 sm:space-y-4 sm:p-4 lg:p-5">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Button
            onClick={getCurrentLocation}
            variant="outline"
            disabled={isLoading}
            className="h-11 flex-col gap-0.5 border-red-200 px-2 text-red-700 hover:border-red-300 hover:bg-red-50 sm:h-10 sm:flex-row sm:gap-2 sm:px-3"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate text-[11px] leading-tight sm:text-sm">
              <span className="sm:hidden">
                {isAr ? "موقعي" : "My location"}
              </span>
              <span className="hidden sm:inline">
                {t.addresses.useCurrentLocation}
              </span>
            </span>
          </Button>

          <Button
            onClick={handleAutoFill}
            disabled={!selectedLocation || isLoading}
            className="h-11 flex-col gap-0.5 bg-red-600 px-2 hover:bg-red-500 sm:h-10 sm:flex-row sm:gap-2 sm:px-3"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate text-[11px] leading-tight sm:text-sm">
              <span className="sm:hidden">
                {isAr ? "ملء تلقائي" : "Auto-fill"}
              </span>
              <span className="hidden sm:inline">
                {t.addresses.autoFillFromMap}
              </span>
            </span>
          </Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 sm:px-4 sm:py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="text-xs text-red-800 sm:text-sm">{error}</p>
          </div>
        )}

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-gray-200 shadow-inner sm:aspect-[16/10] lg:aspect-auto lg:h-[min(480px,55vh)] xl:h-[min(520px,60vh)]">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            defaultCenter={defaultCenter}
            defaultZoom={initialLat && initialLng ? 15 : 12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
            onIdle={handleMapIdle}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
              gestureHandling: "greedy",
            }}
          />
          <MapCenterPin />
          {!selectedLocation && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 to-transparent px-3 py-4 sm:px-4 sm:py-5">
              <p className="text-center text-xs font-medium text-white sm:text-sm">
                {isAr
                  ? "حرّك الخريطة لتحديد موقعك"
                  : "Move the map to set your location"}
              </p>
            </div>
          )}
        </div>

        {selectedLocation && (
          <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 sm:px-4 sm:py-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
            <p className="text-xs text-green-800 sm:text-sm">
              {isAr ? "تم تحديد الموقع بنجاح" : "Location pinned successfully"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
