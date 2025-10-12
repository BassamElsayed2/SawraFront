import { getDictionary } from "@/app/[lang]/dictionaries";
import { SignUpForm } from "@/components/auth/signup-form";
import Image from "next/image";

interface SignUpPageProps {
  params: { lang: "en" | "ar" };
}

export default async function SignUpPage({ params }: SignUpPageProps) {
  const { lang } = await params;
  const t = await getDictionary(lang);

  return (
    <main className="min-h-screen flex">
      {/* Image Section - Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary/90 to-primary">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white space-y-6">
            <Image
              src="/LogoElSawra.png"
              alt="Restaurant Logo"
              width={200}
              height={200}
              className="mx-auto mb-8"
            />
            <h1 className="text-5xl font-bold mb-4">
              {t.auth.joinUs || "Join Our Family!"}
            </h1>
            <p className="text-xl text-white/90">
              {t.auth.signUpDescription ||
                "Create an account to start ordering your favorite meals"}
            </p>
          </div>
        </div>
        {/* Decorative Image Overlay */}
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/grilled-lamb-kabab.png"
            alt="Food Background"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Form Section - Right Side */}
      <div className="flex-1 flex items-center justify-center p-8 lg:w-1/2 bg-gray-50">
        <div className="w-full max-w-md">
          <SignUpForm lang={lang} t={t} />
        </div>
      </div>
    </main>
  );
}
