import { getDictionary } from "@/app/[lang]/dictionaries";
import { SignInClient } from "./signin-client";

interface SignInPageProps {
  params: Promise<{ lang: "en" | "ar" }>;
  searchParams: Promise<{ redirect?: string | string[] }>;
}

export default async function SignInPage({ params, searchParams }: SignInPageProps) {
  const { lang } = await params;
  const sp = await searchParams;
  const raw = sp?.redirect;
  const redirectParam = Array.isArray(raw) ? raw[0] : raw;
  const t = await getDictionary(lang);

  return <SignInClient lang={lang} t={t} redirectParam={redirectParam} />;
}
