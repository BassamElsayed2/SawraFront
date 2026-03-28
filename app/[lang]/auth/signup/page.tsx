import { getDictionary } from "@/app/[lang]/dictionaries";
import { SignUpClient } from "./signup-client";

interface SignUpPageProps {
  params: Promise<{ lang: "en" | "ar" }>;
  searchParams: Promise<{ redirect?: string | string[] }>;
}

export default async function SignUpPage({ params, searchParams }: SignUpPageProps) {
  const { lang } = await params;
  const sp = await searchParams;
  const raw = sp?.redirect;
  const redirectParam = Array.isArray(raw) ? raw[0] : raw;
  const t = await getDictionary(lang);

  return <SignUpClient lang={lang} t={t} redirectParam={redirectParam} />;
}
