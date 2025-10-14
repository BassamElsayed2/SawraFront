"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addressesApi, CreateAddressData } from "@/services/apiAddresses";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { AddressMapPicker } from "./address-map-picker";
import { Save, X } from "lucide-react";

const addressSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  street: z.string().min(5, "Street must be at least 5 characters"),
  building: z.string().optional(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  area: z.string().min(2, "Area must be at least 2 characters"),
  notes: z.string().optional(),
  is_default: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  initialData?: CreateAddressData & { id?: string };
  lang: string;
  t: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddressForm({
  initialData,
  lang,
  t,
  onSuccess,
  onCancel,
}: AddressFormProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(
    initialData
      ? { lat: initialData.latitude, lng: initialData.longitude }
      : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      title: initialData?.title || "",
      street: initialData?.street || "",
      building: initialData?.building || "",
      floor: initialData?.floor || "",
      apartment: initialData?.apartment || "",
      city: initialData?.city || "",
      area: initialData?.area || "",
      notes: initialData?.notes || "",
      is_default: initialData?.is_default || false,
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: (data: CreateAddressData) => addressesApi.addAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
      toast({
        title: "Success",
        description: t.addresses.addressAdded,
      });
      if (onSuccess) {
        onSuccess();
      } else {
        // Auto-redirect to addresses page
        setTimeout(() => {
          router.push(`/${lang}/profile/addresses`);
        }, 1000);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add address",
        variant: "destructive",
      });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateAddressData>;
    }) => addressesApi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
      toast({
        title: "Success",
        description: t.addresses.addressUpdated,
      });
      if (onSuccess) {
        onSuccess();
      } else {
        // Auto-redirect to addresses page
        setTimeout(() => {
          router.push(`/${lang}/profile/addresses`);
        }, 1000);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update address",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: AddressFormData) => {
    if (!selectedLocation) {
      toast({
        title: "Error",
        description: "Please select a location on the map",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const addressData: CreateAddressData = {
        ...data,
        latitude: Number(selectedLocation.lat),
        longitude: Number(selectedLocation.lng),
      };

      if (isEditing && initialData?.id) {
        updateAddressMutation.mutate({
          id: initialData.id,
          data: addressData,
        });
      } else {
        addAddressMutation.mutate(addressData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const handleAddressFill = (addressData: {
    street: string;
    city: string;
    area: string;
  }) => {
    setValue("street", addressData.street);
    setValue("city", addressData.city);
    setValue("area", addressData.area);
  };

  const isDefault = watch("is_default");

  return (
    <div className="space-y-6">
      <AddressMapPicker
        onLocationSelect={handleLocationSelect}
        onAddressFill={handleAddressFill}
        initialLat={initialData?.latitude}
        initialLng={initialData?.longitude}
        lang={lang}
        t={t}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? t.addresses.editAddress : t.addresses.addAddress}
          </CardTitle>
          <CardDescription>Fill in the address details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t.addresses.addressTitle}</Label>
                <Input
                  id="title"
                  placeholder="e.g., Home, Work"
                  {...register("title")}
                  disabled={isLoading}
                />
                {errors.title && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.title.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">{t.addresses.street}</Label>
                <Input
                  id="street"
                  placeholder="Street name and number"
                  {...register("street")}
                  disabled={isLoading}
                />
                {errors.street && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.street.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="building">{t.addresses.building}</Label>
                <Input
                  id="building"
                  placeholder="Building number"
                  {...register("building")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">{t.addresses.floor}</Label>
                <Input
                  id="floor"
                  placeholder="Floor number"
                  {...register("floor")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apartment">{t.addresses.apartment}</Label>
                <Input
                  id="apartment"
                  placeholder="Apartment number"
                  {...register("apartment")}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t.addresses.city}</Label>
                <Input
                  id="city"
                  placeholder="City name"
                  {...register("city")}
                  disabled={isLoading}
                />
                {errors.city && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.city.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">{t.addresses.area}</Label>
                <Input
                  id="area"
                  placeholder="Area or district"
                  {...register("area")}
                  disabled={isLoading}
                />
                {errors.area && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.area.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t.addresses.notes}</Label>
              <Textarea
                id="notes"
                placeholder="Additional delivery instructions"
                {...register("notes")}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="is_default"
                checked={isDefault}
                onCheckedChange={(checked) => setValue("is_default", checked)}
                disabled={isLoading}
              />
              <label
                htmlFor="is_default"
                className="text-sm font-medium leading-none cursor-pointer select-none"
              >
                {lang === "ar"
                  ? "تعيين كعنوان افتراضي"
                  : "Set as default address"}
              </label>
            </div>

            {!selectedLocation && (
              <Alert variant="destructive">
                <AlertDescription>
                  {lang === "ar"
                    ? "يرجى اختيار موقع على الخريطة أعلاه"
                    : "Please select a location on the map above"}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading || !selectedLocation}>
                <Save className="h-4 w-4 me-2" />
                {isLoading
                  ? t.common.loading
                  : isEditing
                  ? "Update Address"
                  : "Add Address"}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 me-2" />
                  {t.profile.cancel}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
