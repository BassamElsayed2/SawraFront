import { getDictionary } from "@/app/[lang]/dictionaries";
import { ProfilePageClient } from "./profile-client";

interface ProfilePageProps {
  params: { lang: "en" | "ar" };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { lang } = await params;
  const t = await getDictionary(lang);

  return <ProfilePageClient lang={lang} dict={t} />;
}
