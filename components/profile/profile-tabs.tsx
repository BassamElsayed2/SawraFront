"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { addressesApi } from "@/services/apiAddresses";
import { ordersApi } from "@/services/apiOrders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  User,
  History,
  Plus,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { ProfileInfo } from "@/components/profile/profile-info";
import { OrdersList } from "@/components/profile/orders-list";
import { AddressesList } from "@/components/profile/addresses-list";
import { cn } from "@/lib/utils";

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
  const isAr = lang === "ar";

  const { user: clientUser } = useAuth();
  const user = clientUser || serverUser;

  const { data: addressesData, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const result = await addressesApi.getAddresses();
      if (result.error) {
        throw new Error(result.error.message || "Failed to fetch addresses");
      }
      return result.data || [];
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 0,
  });

  const { data: ordersData } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: () =>
      user ? ordersApi.getOrders().then((res) => res.data?.orders || []) : [],
    enabled: !!user?.id,
  });

  const addresses = addressesData || [];
  const ordersCount = ordersData?.length ?? 0;

  const tabItems = [
    {
      value: "personal",
      label: t.profile.personalInfo,
      short: isAr ? "شخصي" : "Info",
      icon: User,
      count: null,
    },
    {
      value: "addresses",
      label: t.profile.addresses,
      short: isAr ? "عناوين" : "Addresses",
      icon: MapPin,
      count: addresses.length,
    },
    {
      value: "orders",
      label: t.profile.orderHistory,
      short: isAr ? "طلبات" : "Orders",
      icon: History,
      count: ordersCount,
    },
  ];

  return (
    <Tabs key={defaultTab} defaultValue={defaultTab} className="space-y-5 sm:space-y-6">
      <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-2xl border border-white/70 bg-white/90 p-1.5 shadow-sm backdrop-blur-sm">
        {tabItems.map(({ value, label, short, icon: Icon, count }) => (
          <TabsTrigger
            key={value}
            value={value}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-semibold transition-all sm:flex-row sm:gap-2 sm:px-4 sm:py-3 sm:text-sm",
              "data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:shadow-red-200",
              "data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-red-50 data-[state=inactive]:hover:text-red-600",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{short}</span>
            {count !== null && count > 0 && (
              <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-bold leading-none">
                {count}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="personal" className="mt-0 focus-visible:outline-none">
        <ProfileInfo user={user} profile={profile} lang={lang} t={t} />
      </TabsContent>

      <TabsContent value="addresses" className="mt-0 space-y-4 focus-visible:outline-none">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/60 bg-white/80 px-4 py-3 backdrop-blur-sm">
          <div>
            <h2 className="text-sm font-bold text-gray-900 sm:text-base">
              {t.profile.addresses}
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              {isAr ? "إدارة عناوين التوصيل" : "Manage delivery addresses"}
            </p>
          </div>
          <Link href={`/${lang}/profile/addresses/add`}>
            <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-red-600 px-3.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-red-500 active:scale-[0.98] sm:text-sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t.addresses.addAddress}</span>
              <span className="sm:hidden">{isAr ? "إضافة" : "Add"}</span>
            </span>
          </Link>
        </div>

        {isLoadingAddresses ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/70 bg-white/90 py-16 shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <p className="text-sm text-gray-500">{t.common?.loading}</p>
          </div>
        ) : (
          <AddressesList lang={lang} t={t} />
        )}

        <Link
          href={`/${lang}/profile/addresses`}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white/80 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-red-200 hover:text-red-600"
        >
          {isAr ? "صفحة إدارة العناوين" : "Full addresses page"}
          <ExternalLink className="h-4 w-4" />
        </Link>
      </TabsContent>

      <TabsContent value="orders" className="mt-0 space-y-4 focus-visible:outline-none">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/60 bg-white/80 px-4 py-3 backdrop-blur-sm">
          <div>
            <h2 className="text-sm font-bold text-gray-900 sm:text-base">
              {t.profile.orderHistory}
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              {isAr ? "تتبع طلباتك السابقة" : "Track your past orders"}
            </p>
          </div>
          <Link href={`/${lang}/profile/orders`}>
            <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 transition-all hover:border-red-200 hover:text-red-600 active:scale-[0.98] sm:text-sm">
              {isAr ? "عرض الكل" : "View all"}
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-sm sm:rounded-3xl">
          <div className="p-4 sm:p-5">
            <OrdersList lang={lang} t={t} />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
