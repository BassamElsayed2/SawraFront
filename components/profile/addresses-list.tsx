"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressesApi } from "@/services/apiAddresses";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Edit,
  Trash2,
  Star,
  Loader2,
  Plus,
  Building2,
  StickyNote,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import { Address } from "@/services/apiAddresses";

interface AddressesListProps {
  lang: string;
  t: any;
}

function formatAddressLine(address: Address, t: any) {
  const parts = [
    address.street,
    address.building,
    address.floor && `${t.addresses.floorLabel} ${address.floor}`,
    address.apartment && `${t.addresses.aptLabel} ${address.apartment}`,
  ].filter(Boolean);

  return parts.join("، ");
}

function AddressCard({
  address,
  lang,
  t,
  onSetDefault,
  onDelete,
  isSettingDefault,
  isDeleting,
}: {
  address: Address;
  lang: string;
  t: any;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
  isSettingDefault: boolean;
  isDeleting: boolean;
}) {
  const isAr = lang === "ar";
  const isDefault = address.is_default;

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white/95 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md sm:rounded-3xl ${
        isDefault
          ? "border-red-200 ring-1 ring-red-100"
          : "border-white/70"
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Header row */}
        <div className="mb-3 flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${
              isDefault ? "bg-red-600 text-white" : "bg-red-50 text-red-600"
            }`}
          >
            <MapPin className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-bold text-gray-900 sm:text-lg">
                {address.title || address.street}
              </h3>
              {isDefault && (
                <Badge className="flex items-center gap-1 border-0 bg-amber-100 text-amber-800 hover:bg-amber-100">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {t.addresses.default}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              {address.area}، {address.city}
            </p>
          </div>
        </div>

        {/* Address details */}
        <div className="space-y-2 rounded-xl bg-gray-50/80 px-3 py-3 sm:px-4">
          <p className="flex items-start gap-2 text-sm text-gray-700">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <span>{formatAddressLine(address, t)}</span>
          </p>

          {address.notes && (
            <p className="flex items-start gap-2 text-sm text-gray-500">
              <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <span>{address.notes}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div
          className={`mt-4 grid gap-2 border-t border-gray-100 pt-4 ${
            isDefault ? "grid-cols-2" : "grid-cols-3"
          }`}
        >
          {!isDefault && (
            <button
              type="button"
              onClick={() => onSetDefault(address.id)}
              disabled={isSettingDefault || isDeleting}
              className="group flex flex-col items-center gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50/80 px-2 py-3 transition-all hover:border-amber-300 hover:bg-amber-100 hover:shadow-sm active:scale-[0.98] disabled:opacity-50 sm:flex-row sm:justify-center sm:gap-2 sm:px-4 sm:py-2.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-200 sm:h-8 sm:w-8">
                {isSettingDefault ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Star className="h-4 w-4" />
                )}
              </span>
              <span className="text-[11px] font-semibold text-amber-800 sm:text-sm">
                {t.addresses.setDefault}
              </span>
            </button>
          )}

          <Link
            href={`/${lang}/profile/addresses/edit/${address.id}`}
            className="group flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50/80 px-2 py-3 transition-all hover:border-gray-300 hover:bg-white hover:shadow-sm active:scale-[0.98] sm:flex-row sm:justify-center sm:gap-2 sm:px-4 sm:py-2.5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition-colors group-hover:text-red-600 sm:h-8 sm:w-8">
              <Edit className="h-4 w-4" />
            </span>
            <span className="text-[11px] font-semibold text-gray-700 sm:text-sm">
              {t.addresses.edit}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => onDelete(address.id)}
            disabled={isDeleting || isSettingDefault}
            className="group flex flex-col items-center gap-1.5 rounded-xl border border-red-200/80 bg-red-50/80 px-2 py-3 transition-all hover:border-red-300 hover:bg-red-100 hover:shadow-sm active:scale-[0.98] disabled:opacity-50 sm:flex-row sm:justify-center sm:gap-2 sm:px-4 sm:py-2.5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors group-hover:bg-red-200 sm:h-8 sm:w-8">
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </span>
            <span className="text-[11px] font-semibold text-red-700 sm:text-sm">
              {t.addresses.delete}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

export function AddressesList({ lang, t }: AddressesListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAr = lang === "ar";

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: () => addressesApi.getAddresses().then((res) => res.data || []),
    enabled: !!user,
  });

  const sortedAddresses = useMemo(
    () =>
      [...addresses].sort((a, b) => {
        if (a.is_default && !b.is_default) return -1;
        if (!a.is_default && b.is_default) return 1;
        return 0;
      }),
    [addresses],
  );

  const deleteAddressMutation = useMutation({
    mutationFn: (addressId: string) => addressesApi.deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
      toast({
        title: t.addresses.success,
        description: t.addresses.addressDeleted,
      });
    },
    onError: (error: any) => {
      toast({
        title: t.addresses.error,
        description: error.message || t.addresses.failedToDelete,
        variant: "destructive",
      });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (addressId: string) =>
      addressesApi.setDefaultAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
      toast({
        title: t.addresses.success,
        description: t.addresses.defaultSet,
      });
    },
    onError: (error: any) => {
      toast({
        title: t.addresses.error,
        description: error.message || t.addresses.failedToSetDefault,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (addressId: string) => {
    const confirmMessage = isAr
      ? "هل أنت متأكد من حذف هذا العنوان؟\n\nالطلبات السابقة ستبقى محفوظة."
      : "Are you sure you want to delete this address?\n\nPast orders will remain on file.";

    if (window.confirm(confirmMessage)) {
      deleteAddressMutation.mutate(addressId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/70 bg-white/90 py-16 shadow-sm sm:rounded-3xl">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <p className="text-sm text-gray-500">
          {isAr ? "جاري تحميل العناوين..." : "Loading addresses..."}
        </p>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="rounded-2xl border border-white/70 bg-white/95 p-8 text-center shadow-lg backdrop-blur-sm sm:rounded-3xl sm:p-12">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 sm:h-20 sm:w-20">
          <Navigation className="h-8 w-8 text-red-500 sm:h-10 sm:w-10" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
          {t.addresses.noAddresses}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
          {isAr
            ? "أضف عنوان توصيل لتسريع عملية الطلب والتوصيل"
            : "Add a delivery address to speed up ordering and checkout"}
        </p>
        <Link href={`/${lang}/profile/addresses/add`} className="mt-6 inline-block">
          <span className="inline-flex h-12 items-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-semibold text-white shadow-md shadow-red-200 transition-all hover:bg-red-500 hover:shadow-lg active:scale-[0.98]">
            <Plus className="h-4 w-4" />
            {t.addresses.addFirstAddress}
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Count badge */}
      <div className="flex items-center justify-between rounded-xl border border-white/60 bg-white/80 px-4 py-2.5 backdrop-blur-sm">
        <p className="text-sm text-gray-600">
          {isAr
            ? `${addresses.length} ${addresses.length === 1 ? "عنوان محفوظ" : "عناوين محفوظة"}`
            : `${addresses.length} saved address${addresses.length === 1 ? "" : "es"}`}
        </p>
        <Link href={`/${lang}/profile/addresses/add`} className="sm:hidden">
          <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 text-xs font-semibold text-red-600 transition-all hover:border-red-300 hover:bg-red-100 active:scale-[0.98]">
            <Plus className="h-3.5 w-3.5" />
            {isAr ? "إضافة" : "Add"}
          </span>
        </Link>
      </div>

      {sortedAddresses.map((address: Address) => (
        <AddressCard
          key={address.id}
          address={address}
          lang={lang}
          t={t}
          onSetDefault={(id) => setDefaultMutation.mutate(id)}
          onDelete={handleDelete}
          isSettingDefault={setDefaultMutation.isPending}
          isDeleting={deleteAddressMutation.isPending}
        />
      ))}
    </div>
  );
}
