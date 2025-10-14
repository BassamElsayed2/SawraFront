import { getDictionary } from "@/app/[lang]/dictionaries";
import { AddressesClient } from "./addresses-client";

interface AddressesPageProps {
  params: { lang: "en" | "ar" };
}

export default async function AddressesPage({ params }: AddressesPageProps) {
  const { lang } = await params;
  const t = await getDictionary(lang);

  return <AddressesClient lang={lang} dict={t} />;
}
