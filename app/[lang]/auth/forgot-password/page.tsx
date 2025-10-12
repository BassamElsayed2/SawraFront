import { getDictionary } from "@/app/[lang]/dictionaries";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import Navbar from "@/components/navBarTwo";
import Footer from "@/components/footer";

interface ForgotPasswordPageProps {
  params: { lang: "en" | "ar" };
}

export default async function ForgotPasswordPage({
  params,
}: ForgotPasswordPageProps) {
  const { lang } = await params;
  const t = await getDictionary(lang);

  return (
    <main className="min-h-screen bg-background">
      <Navbar lang={lang} dict={t} />
      <div className="relative min-h-screen flex items-center justify-center py-32 px-4 sm:px-6 lg:px-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 -z-10" />

        <div className="max-w-md w-full space-y-8">
          <ForgotPasswordForm lang={lang} t={t} />
        </div>
      </div>
      <Footer lang={lang} dict={t} />
    </main>
  );
}
