import { getDictionary } from "@/app/[lang]/dictionaries";
import { SignUpClient } from "./signup-client";

interface SignUpPageProps {
  params: { lang: "en" | "ar" };
}

export default async function SignUpPage({ params }: SignUpPageProps) {
  const { lang } = await params;
  const t = await getDictionary(lang);

  return <SignUpClient lang={lang} t={t} />;
}
