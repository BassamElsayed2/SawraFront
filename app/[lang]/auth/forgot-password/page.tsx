import { getDictionary } from "@/app/[lang]/dictionaries";
import { ForgotPasswordClient } from "./forgot-password-client";

interface ForgotPasswordPageProps {
  params: Promise<{ lang: "en" | "ar" }>;
  searchParams: Promise<{ redirect?: string | string[] }>;
}

export default async function ForgotPasswordPage({
  params,
  searchParams,
}: ForgotPasswordPageProps) {
  const { lang } = await params;
  const sp = await searchParams;
  const raw = sp?.redirect;
  const redirectParam = Array.isArray(raw) ? raw[0] : raw;
  const t = await getDictionary(lang);

  return <ForgotPasswordClient lang={lang} t={t} redirectParam={redirectParam} />;
}
