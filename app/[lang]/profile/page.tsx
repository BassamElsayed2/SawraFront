import { getDictionary } from "@/app/[lang]/dictionaries";
import { createClient } from "@/services/supabase-server";
import { redirect } from "next/navigation";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import Navbar from "@/components/navBarTwo";
import Footer from "@/components/footer";

interface ProfilePageProps {
  params: { lang: "en" | "ar" };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { lang } = await params;
  const t = await getDictionary(lang);

  const supabase = createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${lang}/auth/signin`);
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar lang={lang} dict={t} />
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t.profile.title}
            </h1>
          </div>

          <ProfileTabs user={user} profile={profile} lang={lang} t={t} />
        </div>
      </div>
      <Footer lang={lang} dict={t} />
    </main>
  );
}
