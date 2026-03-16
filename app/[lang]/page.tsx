import { getDictionary } from "./dictionaries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getLatestProducts,
  getComboOffers,
  getBestsellers,
} from "@/lib/api-actions";

import HeroSection from "@/components/hero-section";
import BestsellersSlider from "@/components/bestsellers-slider";
import HomeProductsSection from "@/components/home-products-section";
import Footer from "@/components/footer";
import NavbarOne from "@/components/navbarOne";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: "en" | "ar" }>;
}) {
  const { lang } = await params;
  const cookieStore = await cookies();
  const selectedBranchId = cookieStore.get("selected_branch_id")?.value;

  // Redirect early before any expensive data fetching
  if (!selectedBranchId) {
    redirect(`/${lang}/menu`);
  }

  // Validate language parameter
  if (!["en", "ar"].includes(lang)) {
    throw new Error(`Invalid language: ${lang}`);
  }

  let dict;
  try {
    dict = await getDictionary(lang);
  } catch (error) {
    // Dictionary loading failed - fallback to English
    dict = await getDictionary("en");
  }

  const [latestRes, offers, bestsellersRes] = await Promise.all([
    getLatestProducts(10, selectedBranchId),
    getComboOffers(),
    getBestsellers(10, selectedBranchId),
  ]);

  const latestProducts = latestRes.products ?? [];
  const bestsellersProducts = (bestsellersRes.products ?? []).slice(0, 10);
  const showBestsellersSection = bestsellersProducts.length >= 10;

  return (
    <main className="min-h-screen">
      <NavbarOne lang={lang} dict={dict} />
      <HeroSection lang={lang} dict={dict} />

      {/* آخر 10 منتجات - Latest 10 products */}
      <HomeProductsSection
        lang={lang}
        title={lang === "ar" ? "أحدث المنتجات" : "Latest Products"}
        products={latestProducts}
        viewAllHref={`/${lang}/menu`}
        viewAllLabel={lang === "ar" ? "عرض القائمة" : "View Menu"}
      />

      {/* عروض - Only when there are offers */}
      {offers.length > 0 && (
        <BestsellersSlider lang={lang} dict={dict} initialOffers={offers} />
      )}

      {/* أكثر 10 منتجات طلباً - Only when we have at least 10 */}
      {showBestsellersSection && (
        <HomeProductsSection
          lang={lang}
          title={lang === "ar" ? "الأكثر طلباً" : "Most Ordered"}
          products={bestsellersProducts}
          viewAllHref={`/${lang}/menu`}
          viewAllLabel={lang === "ar" ? "عرض القائمة" : "View Menu"}
        />
      )}

      <Footer lang={lang} dict={dict} />
    </main>
  );
}
