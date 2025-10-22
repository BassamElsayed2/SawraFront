import { Suspense } from "react";
import { getDictionary } from "../dictionaries";
import CheckoutClient from "./checkout-client";
import NavbarOne from "@/components/navbarOne";
import Navbar from "@/components/navBarTwo";
import Footer from "@/components/footer";

export default async function CheckoutPage({
  params,
}: {
  params: { lang: "en" | "ar" };
}) {
  const dict = await getDictionary(params.lang);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navbar - NavbarOne on hero, Navbar on other pages */}
      <div className="sticky top-0 z-50 shadow-sm">
        <Navbar lang={params.lang} dict={dict} />
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-20">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-red-600"></div>
            </div>
          }
        >
          <CheckoutClient lang={params.lang} dict={dict} />
        </Suspense>
      </main>

      {/* Footer */}
      <Footer lang={params.lang} dict={dict} />
    </div>
  );
}
