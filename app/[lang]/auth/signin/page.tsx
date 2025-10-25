import { getDictionary } from "@/app/[lang]/dictionaries";
import { SignInClient } from "./signin-client";

interface SignInPageProps {
  params: { lang: "en" | "ar" };
}

export default async function SignInPage({ params }: SignInPageProps) {
  const { lang } = await params;
  const t = await getDictionary(lang);

  return <SignInClient lang={lang} t={t} />;
}
