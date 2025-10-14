import { getDictionary } from "@/app/[lang]/dictionaries";
import EditAddressClient from "./edit-address-client";

interface EditAddressPageProps {
  params: { lang: "en" | "ar"; id: string };
}

export default async function EditAddressPage({
  params,
}: EditAddressPageProps) {
  const { lang, id } = await params;
  const t = await getDictionary(lang);

  return <EditAddressClient lang={lang} dict={t} addressId={id} />;
}
