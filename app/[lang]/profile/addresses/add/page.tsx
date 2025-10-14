import { getDictionary } from "@/app/[lang]/dictionaries";
import { AddAddressClient } from "./add-address-client";

interface AddAddressPageProps {
  params: { lang: "en" | "ar" };
}

export default async function AddAddressPage({ params }: AddAddressPageProps) {
  const { lang } = await params;
  const t = await getDictionary(lang);

  return <AddAddressClient lang={lang} dict={t} />;
}
