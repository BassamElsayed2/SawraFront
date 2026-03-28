import { getDictionary } from "@/app/[lang]/dictionaries";
import { OrdersClient } from "./orders-client";

interface OrdersPageProps {
  params: Promise<{ lang: "en" | "ar" }>;
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { lang } = await params;
  const t = await getDictionary(lang);

  return <OrdersClient lang={lang} dict={t} />;
}
