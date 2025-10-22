"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void;
  onError: () => void;
  lang: string;
  isLoading?: boolean;
  mode?: "signin" | "signup";
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  lang,
  isLoading = false,
  mode = "signin",
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // تحميل Google Identity Services SDK
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !buttonRef.current) return;

    // @ts-ignore
    if (window.google) {
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            onError();
          }
        },
        ux_mode: "popup",
        context: mode === "signin" ? "signin" : "signup",
      });

      // @ts-ignore
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: mode === "signin" ? "signin_with" : "signup_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: buttonRef.current.offsetWidth,
        locale: lang === "ar" ? "ar" : "en",
      });
    }
  }, [isScriptLoaded, onSuccess, onError, lang, mode]);

  const buttonText =
    mode === "signin"
      ? lang === "ar"
        ? "تسجيل الدخول بحساب جوجل"
        : "Sign in with Google"
      : lang === "ar"
      ? "إنشاء حساب بواسطة جوجل"
      : "Sign up with Google";

  // زر مخصص احتياطي أثناء التحميل
  if (!isScriptLoaded) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 text-base font-medium border-2"
        disabled={true}
      >
        <Loader2 className="h-5 w-5 animate-spin mr-2 rtl:mr-0 rtl:ml-2" />
        <span>{lang === "ar" ? "جاري التحميل..." : "Loading..."}</span>
      </Button>
    );
  }

  // Custom styled wrapper for Google button
  return (
    <div className="w-full">
      <div
        ref={buttonRef}
        className="google-signin-button w-full flex items-center justify-center min-h-[48px]"
      />
      {/* Fallback custom button if Google button doesn't render */}
      <style jsx global>{`
        .google-signin-button > div {
          width: 100% !important;
        }
        .google-signin-button iframe {
          width: 100% !important;
        }
      `}</style>
    </div>
  );
}
