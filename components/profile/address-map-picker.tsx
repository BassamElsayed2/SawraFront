"use client";

import { useState, useCallback, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Navigation, AlertCircle } from "lucide-react";

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

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
}

export function AddressMapPicker({
  onLocationSelect,
  onAddressFill,
  initialLat,
  initialLng,
  lang,
  t,
}: AddressMapPickerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey || "",
    libraries,
  });

  const defaultCenter = {
    lat: initialLat || 31.2001, // Cairo coordinates
    lng: initialLng || 29.9187,
  };

  // Show warning if API key is missing
  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.selectLocationOnMap || "Select Location"}</CardTitle>
          <CardDescription className="text-red-500">
            {lang === "ar"
              ? "⚠️ Google Maps API Key غير مضبوط. يرجى إضافة NEXT_PUBLIC_GOOGLE_MAPS_API_KEY في ملف .env.local"
              : "⚠️ Google Maps API Key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local file"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {lang === "ar"
              ? "يمكنك متابعة إضافة العنوان يدوياً بدون تحديد الموقع على الخريطة."
              : "You can continue adding the address manually without selecting location on the map."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        setSelectedLocation({ lat, lng });
        onLocationSelect(lat, lng);
      }
    },
    [onLocationSelect]
  );

  const handleAutoFill = async () => {
    if (!selectedLocation || !map) return;

    setIsLoading(true);
    setError(null);
    try {
      const geocoder = new google.maps.Geocoder();

      const result = await geocoder.geocode({
        location: selectedLocation,
      });

      if (result.results && result.results.length > 0) {
        const addressComponents = result.results[0].address_components;
        const formattedAddress = result.results[0].formatted_address;

        // Extract address components
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

        // If we couldn't extract specific components, use the formatted address
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

        // Show success message
        console.log("Address auto-filled successfully");
      }
    } catch (error: any) {
      console.error("Error geocoding address:", error);
      const errorMessage =
        lang === "ar"
          ? "⚠️ فشل في تحديد العنوان تلقائياً. يرجى التأكد من تفعيل Geocoding API في Google Cloud Console."
          : "⚠️ Failed to auto-fill address. Please ensure the Geocoding API is enabled in Google Cloud Console.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setSelectedLocation({ lat, lng });
          onLocationSelect(lat, lng);

          if (map) {
            map.setCenter({ lat, lng });
            map.setZoom(15);
          }
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    }
  };

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ms-2">Loading map...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <span>{t.addresses.selectLocation}</span>
        </CardTitle>
        <CardDescription>
          Click on the map to select your location, then use the auto-fill
          button to populate address fields
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={getCurrentLocation}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            <span>
              {lang === "ar" ? "استخدم الموقع الحالي" : "Use Current Location"}
            </span>
          </Button>

          <Button
            onClick={handleAutoFill}
            disabled={!selectedLocation || isLoading}
            size="sm"
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            <span>
              {isLoading ? "Loading..." : t.addresses.autoFillFromMap}
            </span>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="h-96 w-full rounded-lg overflow-hidden border">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={selectedLocation || defaultCenter}
            zoom={selectedLocation ? 15 : 10}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            {selectedLocation && (
              <Marker
                position={selectedLocation}
                draggable={true}
                onDragEnd={(event) => {
                  if (event.latLng) {
                    const lat = event.latLng.lat();
                    const lng = event.latLng.lng();
                    setSelectedLocation({ lat, lng });
                    onLocationSelect(lat, lng);
                  }
                }}
              />
            )}
          </GoogleMap>
        </div>

        {selectedLocation && (
          <div className="text-sm text-gray-600">
            <p>
              <strong>Selected Location:</strong>
            </p>
            <p>Latitude: {selectedLocation.lat.toFixed(6)}</p>
            <p>Longitude: {selectedLocation.lng.toFixed(6)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
