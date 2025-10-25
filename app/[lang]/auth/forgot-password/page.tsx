import { getDictionary } from "@/app/[lang]/dictionaries";
import { ForgotPasswordClient } from "./forgot-password-client";

interface ForgotPasswordPageProps {
  params: { lang: "en" | "ar" };
}

export default async function ForgotPasswordPage({
  params,
}: ForgotPasswordPageProps) {
  const { lang } = await params;
  const t = await getDictionary(lang);

  return <ForgotPasswordClient lang={lang} t={t} />;
}
