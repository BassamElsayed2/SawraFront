"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dynamic from "next/dynamic";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addressesApi, CreateAddressData } from "@/services/apiAddresses";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  X,
  Loader2,
  Home,
  Building2,
  MapPinned,
  StickyNote,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const AddressMapPicker = dynamic(
  () =>
    import("./address-map-picker").then((mod) => ({
      default: mod.AddressMapPicker,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center gap-3 py-16 sm:py-20">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <span className="text-sm text-gray-500">Loading map...</span>
      </div>
    ),
  },
);

function createAddressSchema(lang: string) {
  const isAr = lang === "ar";
  return z.object({
    street: z
      .string()
      .min(
        5,
        isAr
          ? "الشارع يجب أن يكون 5 أحرف على الأقل"
          : "Street must be at least 5 characters",
      ),
    building: z.string().optional(),
    floor: z.string().optional(),
    apartment: z.string().optional(),
    city: z
      .string()
      .min(2, isAr ? "المدينة مطلوبة" : "City must be at least 2 characters"),
    area: z
      .string()
      .min(2, isAr ? "المنطقة مطلوبة" : "Area must be at least 2 characters"),
    notes: z.string().optional(),
    is_default: z.boolean().optional(),
  });
}

type AddressFormData = z.infer<ReturnType<typeof createAddressSchema>>;

function buildAddressTitle(
  data: Pick<AddressFormData, "street" | "area" | "city">,
  isAr: boolean,
) {
  return (
    [data.street, data.area].filter(Boolean).join("، ") ||
    data.city ||
    (isAr ? "عنوان" : "Address")
  );
}

interface AddressFormProps {
  initialData?: CreateAddressData & { id?: string };
  lang: string;
  t: any;
  onSuccess?: () => void;
  onCancel?: () => void;
  /** Show fixed save bar on mobile/tablet */
  stickySubmit?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-600 sm:text-sm">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-2 text-sm font-semibold text-gray-800">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">
        <Icon className="h-3.5 w-3.5 text-red-600" />
      </span>
      {children}
    </p>
  );
}

export function AddressForm({
  initialData,
  lang,
  t,
  onSuccess,
  onCancel,
  stickySubmit = false,
}: AddressFormProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(
    initialData
      ? { lat: initialData.latitude, lng: initialData.longitude }
      : null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const isAr = lang === "ar";
  const isEditing = !!initialData?.id;
  const formId = "address-form";

  const submitLabel = isEditing
    ? isAr
      ? "تحديث العنوان"
      : "Update Address"
    : isAr
      ? "إضافة العنوان"
      : "Add Address";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AddressFormData>({
    resolver: zodResolver(createAddressSchema(lang)),
    defaultValues: {
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
        title: isAr ? "نجح" : "Success",
        description: t.addresses.addressAdded,
      });
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          router.push(`/${lang}/profile/addresses`);
        }, 1000);
      }
    },
    onError: (error: any) => {
      toast({
        title: isAr ? "خطأ" : "Error",
        description:
          error.message ||
          (isAr ? "فشل إضافة العنوان" : "Failed to add address"),
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
        title: isAr ? "نجح" : "Success",
        description: t.addresses.addressUpdated,
      });
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          router.push(`/${lang}/profile/addresses`);
        }, 1000);
      }
    },
    onError: (error: any) => {
      toast({
        title: isAr ? "خطأ" : "Error",
        description:
          error.message ||
          (isAr ? "فشل تحديث العنوان" : "Failed to update address"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: AddressFormData) => {
    if (!selectedLocation) {
      toast({
        title: isAr ? "خطأ" : "Error",
        description: isAr
          ? "يرجى اختيار موقع على الخريطة"
          : "Please select a location on the map",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const addressData: CreateAddressData = {
        ...data,
        title: buildAddressTitle(data, isAr),
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
    } catch {
      toast({
        title: isAr ? "خطأ" : "Error",
        description: isAr ? "حدث خطأ غير متوقع" : "An unexpected error occurred",
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
  const canSubmit = !isLoading && !!selectedLocation;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-lg backdrop-blur-sm sm:rounded-3xl sm:shadow-xl lg:overflow-visible lg:border-0 lg:bg-transparent lg:shadow-none lg:backdrop-blur-none">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-start lg:gap-6 xl:gap-8">
          {/* Map */}
          <section className="border-b border-gray-100 lg:border-b-0">
            <AddressMapPicker
              onLocationSelect={handleLocationSelect}
              onAddressFill={handleAddressFill}
              initialLat={initialData?.latitude}
              initialLng={initialData?.longitude}
              lang={lang}
              t={t}
              isNewAddress={!isEditing}
            />
          </section>

          {/* Form */}
          <section className="p-4 sm:p-6 lg:rounded-2xl lg:border lg:border-white/70 lg:bg-white/95 lg:p-6 lg:shadow-xl lg:backdrop-blur-sm xl:p-8">
            {isEditing && (
              <div className="mb-5 sm:mb-6">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                  {t.addresses.editAddress}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {isAr
                    ? "حدّث بيانات عنوان التوصيل"
                    : "Update your delivery address details"}
                </p>
              </div>
            )}

            <form
              id={formId}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 sm:space-y-6"
            >
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm ${
                  selectedLocation
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                {selectedLocation ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>
                  {selectedLocation
                    ? isAr
                      ? "تم تحديد الموقع — أكمل التفاصيل"
                      : "Location set — complete the details"
                    : isAr
                      ? "حدد موقعك على الخريطة أولاً"
                      : "Select your location on the map first"}
                </span>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <SectionTitle icon={Home}>
                  {isAr ? "معلومات العنوان" : "Address Info"}
                </SectionTitle>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="street" className="text-xs sm:text-sm">
                    {t.addresses.street}
                  </Label>
                  <Input
                    id="street"
                    placeholder={
                      isAr ? "اسم الشارع ورقمه" : "Street name and number"
                    }
                    className={`h-11 text-base sm:text-sm ${errors.street ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    {...register("street")}
                    disabled={isLoading}
                  />
                  <FieldError message={errors.street?.message} />
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <SectionTitle icon={Building2}>
                  {isAr ? "تفاصيل المبنى" : "Building Details"}
                </SectionTitle>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="building" className="text-xs sm:text-sm">
                      {t.addresses.building}
                    </Label>
                    <Input
                      id="building"
                      placeholder={isAr ? "المبنى" : "Building"}
                      className="h-11 text-base sm:text-sm"
                      {...register("building")}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="floor" className="text-xs sm:text-sm">
                      {t.addresses.floor}
                    </Label>
                    <Input
                      id="floor"
                      placeholder={isAr ? "الطابق" : "Floor"}
                      className="h-11 text-base sm:text-sm"
                      {...register("floor")}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5 sm:col-span-1 sm:space-y-2">
                    <Label htmlFor="apartment" className="text-xs sm:text-sm">
                      {t.addresses.apartment}
                    </Label>
                    <Input
                      id="apartment"
                      placeholder={isAr ? "الشقة" : "Apt"}
                      className="h-11 text-base sm:text-sm"
                      {...register("apartment")}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <SectionTitle icon={MapPinned}>
                  {isAr ? "المدينة والمنطقة" : "City & Area"}
                </SectionTitle>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="city" className="text-xs sm:text-sm">
                      {t.addresses.city}
                    </Label>
                    <Input
                      id="city"
                      placeholder={isAr ? "المدينة" : "City"}
                      className={`h-11 text-base sm:text-sm ${errors.city ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      {...register("city")}
                      disabled={isLoading}
                    />
                    <FieldError message={errors.city?.message} />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="area" className="text-xs sm:text-sm">
                      {t.addresses.area}
                    </Label>
                    <Input
                      id="area"
                      placeholder={isAr ? "المنطقة" : "Area"}
                      className={`h-11 text-base sm:text-sm ${errors.area ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      {...register("area")}
                      disabled={isLoading}
                    />
                    <FieldError message={errors.area?.message} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label
                  htmlFor="notes"
                  className="flex items-center gap-2 text-xs sm:text-sm"
                >
                  <StickyNote className="h-3.5 w-3.5 text-red-500" />
                  {t.addresses.notes}
                  <span className="font-normal text-gray-400">
                    ({isAr ? "اختياري" : "optional"})
                  </span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder={
                    isAr
                      ? "تعليمات إضافية للتوصيل"
                      : "Additional delivery instructions"
                  }
                  className="min-h-[80px] resize-none text-base sm:min-h-[88px] sm:text-sm"
                  {...register("notes")}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3 sm:px-4">
                <Checkbox
                  id="is_default"
                  checked={isDefault}
                  onCheckedChange={(checked) =>
                    setValue("is_default", checked === true)
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor="is_default"
                  className="cursor-pointer text-sm font-medium leading-snug text-gray-700"
                >
                  {isAr ? "تعيين كعنوان افتراضي" : "Set as default address"}
                </label>
              </div>

              {/* Desktop / tablet inline actions */}
              <div
                className={`flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row ${
                  stickySubmit ? "hidden lg:flex" : "flex"
                }`}
              >
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="h-12 flex-1 bg-red-600 text-base font-semibold hover:bg-red-500 sm:text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t.common.loading}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {submitLabel}
                    </>
                  )}
                </Button>

                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="h-12 sm:w-auto"
                  >
                    <X className="h-4 w-4" />
                    {t.profile.cancel}
                  </Button>
                )}
              </div>
            </form>
          </section>
        </div>
      </div>

      {/* Mobile sticky save bar */}
      {stickySubmit && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-3 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
          <Button
            type="submit"
            form={formId}
            disabled={!canSubmit}
            className="h-12 w-full bg-red-600 text-base font-semibold hover:bg-red-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.common.loading}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}
