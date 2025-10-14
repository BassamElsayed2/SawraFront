"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { addressesApi } from "@/services/apiAddresses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, User, History } from "lucide-react";
import Link from "next/link";
import { ProfileInfo } from "@/components/profile/profile-info";
import { OrdersList } from "@/components/profile/orders-list";
import { AddressesList } from "@/components/profile/addresses-list";

interface ProfileTabsProps {
  user: any;
  profile: any;
  lang: "en" | "ar";
  t: any;
}

export function ProfileTabs({
  user: serverUser,
  profile,
  lang,
  t,
}: ProfileTabsProps) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "personal";

  // Use client-side auth for React Query
  const { user: clientUser } = useAuth();
  const user = clientUser || serverUser;

  // Fetch addresses
  const {
    data: addressesData,
    isLoading: isLoadingAddresses,
    error: addressesError,
    isFetching,
  } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }
      const result = await addressesApi.getAddresses(user.id);
      if (result.error) {
        // Error is logged internally by the API service
        throw new Error(result.error.message || "Failed to fetch addresses");
      }
      return result.data || [];
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 0,
  });

  const addresses = addressesData || [];

  return (
    <Tabs defaultValue={defaultTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="personal" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{t.profile.personalInfo}</span>
        </TabsTrigger>
        <TabsTrigger value="addresses" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{t.profile.addresses}</span>
        </TabsTrigger>
        <TabsTrigger value="orders" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          <span>{t.profile.orderHistory}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="personal" className="space-y-6">
        <ProfileInfo user={user} profile={profile} lang={lang} t={t} />
      </TabsContent>

      <TabsContent value="addresses" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t.profile.addresses}</span>
              <Link href={`/${lang}/profile/addresses`}>
                <Button>{t.addresses.addAddress}</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAddresses || isFetching ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-500">
                  {t.common?.loading ||
                    (lang === "ar" ? "جاري التحميل..." : "Loading...")}
                </p>
              </div>
            ) : addressesError ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-2">
                  {lang === "ar"
                    ? "حدث خطأ أثناء تحميل العناوين"
                    : "Error loading addresses"}
                </p>
                <p className="text-sm text-gray-500">
                  {addressesError instanceof Error
                    ? addressesError.message
                    : "Unknown error"}
                </p>
              </div>
            ) : (
              <AddressesList addresses={addresses} lang={lang} t={t} />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="orders" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5" />
                <span>{t.profile.orderHistory}</span>
              </div>
              <Link href={`/${lang}/profile/orders`}>
                <Button variant="outline">
                  {lang === "ar" ? "عرض الكل" : "View All"}
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersList lang={lang} t={t} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
