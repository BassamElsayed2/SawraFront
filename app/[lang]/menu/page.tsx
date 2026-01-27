import { getDictionary } from "../dictionaries";

import MenuGrid from "@/components/menu-grid";
import Footer from "@/components/footer";
import Navbar from "@/components/navBarTwo";
import CartFooterButton from "@/components/cart-footer-button";
import { getCategories, getBranches, getProducts } from "@/lib/api-actions";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ lang: "en" | "ar" }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  // Fetch initial data from server
  const [categoriesData, branchesData, productsData] = await Promise.all([
    getCategories(),
    getBranches(),
    getProducts({ page: 1, limit: 9 }),
  ]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar lang={lang} dict={dict} />
      <div className="pt-5">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{dict.menu.title}</h1>
            <p className="text-xl text-gray-600">{dict.menu.subtitle}</p>
          </div>
          <MenuGrid 
            lang={lang} 
            dict={dict} 
            initialCategories={categoriesData || []}
            initialBranches={branchesData || []}
            initialProducts={productsData}
          />
        </div>
      </div>
      <Footer lang={lang} dict={dict} />
      <CartFooterButton lang={lang} />
    </main>
  );
}
