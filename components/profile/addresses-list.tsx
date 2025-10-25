"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressesApi } from "@/services/apiAddresses";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Edit, Trash2, Star, StarOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { Address } from "@/services/apiAddresses";

interface AddressesListProps {
  lang: string;
  t: any;
}

export function AddressesList({ lang, t }: AddressesListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: () => addressesApi.getAddresses().then((res) => res.data || []),
    enabled: !!user,
  });

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
      // Check if the error is due to linked orders
      const errorMessage = error.message || "";
      const isLinkedToOrders =
        errorMessage.includes("linked to existing orders") ||
        errorMessage.includes("ADDRESS_HAS_ORDERS");

      const description = isLinkedToOrders
        ? lang === "ar"
          ? "لا يمكن حذف هذا العنوان لأنه مرتبط بطلبات موجودة. يمكنك تعديل العنوان بدلاً من حذفه."
          : "Cannot delete this address because it is linked to existing orders. You can edit the address instead of deleting it."
        : error.message || t.addresses.failedToDelete;

      toast({
        title: t.addresses.error,
        description,
        variant: "destructive",
        duration: 5000, // Show for 5 seconds for important message
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
    const confirmMessage =
      lang === "ar"
        ? "هل أنت متأكد من حذف هذا العنوان؟\n\nملاحظة: لا يمكن حذف العنوان إذا كان مرتبطاً بطلبات موجودة."
        : "Are you sure you want to delete this address?\n\nNote: Address cannot be deleted if it is linked to existing orders.";

    if (window.confirm(confirmMessage)) {
      deleteAddressMutation.mutate(addressId);
    }
  };

  const handleSetDefault = (addressId: string) => {
    setDefaultMutation.mutate(addressId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">{t.addresses.noAddresses}</p>
        <Link href={`/${lang}/profile/addresses/add`}>
          <Button>{t.addresses.addFirstAddress}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address: Address) => (
        <Card key={address.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{address.title}</CardTitle>
                {address.is_default && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>{t.addresses.default}</span>
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!address.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                    disabled={setDefaultMutation.isPending}
                  >
                    <StarOff className="h-4 w-4 me-2" />
                    {t.addresses.setDefault}
                  </Button>
                )}
                <Link href={`/${lang}/profile/addresses/edit/${address.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 me-2" />
                    {t.addresses.edit}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(address.id)}
                  disabled={deleteAddressMutation.isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 me-2" />
                  {t.addresses.delete}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {address.street}
                    {address.building && `, ${address.building}`}
                    {address.floor &&
                      `, ${t.addresses.floorLabel} ${address.floor}`}
                    {address.apartment &&
                      `, ${t.addresses.aptLabel} ${address.apartment}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {address.area}, {address.city}
                  </p>
                  {address.notes && (
                    <p className="text-sm text-gray-500 mt-1">
                      <strong>{t.addresses.notesLabel}:</strong> {address.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
