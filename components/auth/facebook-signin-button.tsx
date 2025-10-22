"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface FacebookSignInButtonProps {
  onSuccess: (accessToken: string) => void;
  onError: () => void;
  lang: string;
  isLoading?: boolean;
  mode?: "signin" | "signup";
}

export function FacebookSignInButton({
  onSuccess,
  onError,
  lang,
  isLoading = false,
  mode = "signin",
}: FacebookSignInButtonProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [initError, setInitError] = useState<string>("");
  const sdkInitializedRef = useRef(false);

  useEffect(() => {
    // Check if running on HTTPS (required for Facebook Login)
    const isSecure =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!isSecure && process.env.NODE_ENV === "production") {
      setInitError(
        lang === "ar"
          ? "تسجيل الدخول بفيسبوك يتطلب اتصال آمن (HTTPS)"
          : "Facebook login requires a secure connection (HTTPS)"
      );
      return;
    }

    // Check if Facebook App ID is configured
    if (!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID) {
      setInitError(
        lang === "ar"
          ? "معرف تطبيق فيسبوك غير مكوّن"
          : "Facebook App ID is not configured"
      );
      return;
    }

    // Prevent duplicate initialization
    if (sdkInitializedRef.current) {
      return;
    }

    // تحميل Facebook SDK
    if (!document.getElementById("facebook-jssdk")) {
      // Initialize Facebook SDK
      window.fbAsyncInit = function () {
        try {
          window.FB.init({
            appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
            cookie: true,
            xfbml: true,
            version: "v18.0",
          });

          sdkInitializedRef.current = true;
          setIsSdkReady(true);
          setIsScriptLoaded(true);
        } catch (error) {
          console.error("Facebook SDK initialization error:", error);
          setInitError(
            lang === "ar"
              ? "فشل تهيئة Facebook SDK"
              : "Failed to initialize Facebook SDK"
          );
        }
      };

      // Load Facebook SDK script
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onerror = () => {
        setInitError(
          lang === "ar"
            ? "فشل تحميل Facebook SDK"
            : "Failed to load Facebook SDK"
        );
      };

      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(script, firstScriptTag);
    } else if (window.FB && !sdkInitializedRef.current) {
      // SDK already loaded
      sdkInitializedRef.current = true;
      setIsSdkReady(true);
      setIsScriptLoaded(true);
    }
  }, [lang]);

  const handleFacebookLogin = () => {
    // Check if SDK is ready
    if (!window.FB || !isSdkReady || !sdkInitializedRef.current) {
      console.error("Facebook SDK not initialized");
      onError();
      return;
    }

    try {
      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            // User successfully logged in
            const accessToken = response.authResponse.accessToken;
            onSuccess(accessToken);
          } else {
            // User cancelled login or did not fully authorize
            console.log("User cancelled login or did not fully authorize");
            onError();
          }
        },
        {
          scope: "public_profile,email",
        }
      );
    } catch (error) {
      console.error("Facebook login error:", error);
      onError();
    }
  };

  const buttonText =
    mode === "signin"
      ? lang === "ar"
        ? "تسجيل الدخول بحساب فيسبوك"
        : "Sign in with Facebook"
      : lang === "ar"
      ? "إنشاء حساب بواسطة فيسبوك"
      : "Sign up with Facebook";

  // Show error if initialization failed
  if (initError) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 text-base font-medium border-2 border-red-300 text-red-700 cursor-not-allowed"
        disabled={true}
      >
        <AlertCircle className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
        <span className="text-sm">{initError}</span>
      </Button>
    );
  }

  // زر مخصص احتياطي أثناء التحميل
  if (!isScriptLoaded || !isSdkReady || !sdkInitializedRef.current) {
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

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-12 text-base font-medium border-2 hover:bg-gray-50 transition-colors"
      onClick={handleFacebookLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin mr-2 rtl:mr-0 rtl:ml-2" />
      ) : (
        <svg
          className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2"
          viewBox="0 0 24 24"
          fill="#1877F2"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )}
      <span className="text-gray-700">{buttonText}</span>
    </Button>
  );
}
