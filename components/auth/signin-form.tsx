"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useGoogleSignIn, useFacebookSignIn } from "@/hooks/use-api";
import { GoogleSignInButton } from "./google-signin-button";
import { FacebookSignInButton } from "./facebook-signin-button";
import { useCart } from "@/contexts/cart-context";
import { addressesApi } from "@/services/apiAddresses";

type SignInFormData = {
  email: string;
  password: string;
};

interface SignInFormProps {
  lang: string;
  t: any;
}

export function SignInForm({ lang, t }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const googleSignInMutation = useGoogleSignIn();
  const facebookSignInMutation = useFacebookSignIn();
  const { getTotalItems } = useCart();

  // التحقق من معامل الخطأ في URL
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "admin-account") {
      const msg =
        lang === "ar"
          ? "هذا الحساب مخصص للإدارة. يرجى استخدام لوحة التحكم للدخول."
          : "This account is for admin use. Please use the dashboard to sign in.";
      setErrorMessage(msg);
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: msg,
        variant: "destructive",
      });
    }
  }, [searchParams, lang, toast]);

  const signInSchema = z.object({
    email: z
      .string()
      .min(1, lang === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required")
      .email(
        lang === "ar" ? "البريد الإلكتروني غير صحيح" : "Invalid email address"
      ),
    password: z
      .string()
      .min(1, lang === "ar" ? "كلمة المرور مطلوبة" : "Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  // Helper function to determine redirect path after sign in
  const getRedirectPath = async () => {
    try {
      // Check if user has addresses
      const { data: addresses, error } = await addressesApi.getAddresses();

      if (error || !addresses || addresses.length === 0) {
        // No addresses - redirect to add address page
        return `/${lang}/profile/addresses/add`;
      }

      // User has addresses - check cart
      const cartItemsCount = getTotalItems();

      if (cartItemsCount === 0) {
        // Cart is empty - redirect to menu
        return `/${lang}/menu`;
      }

      // Has address and cart items - redirect to checkout
      return `/${lang}/checkout`;
    } catch (error) {
      // On error, redirect to profile as fallback
      return `/${lang}/profile`;
    }
  };

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      await signIn(data.email, data.password);

      // If we reach here, sign in was successful
      toast({
        title: lang === "ar" ? "نجح" : "Success",
        description: t.auth.signInSuccess,
      });

      // Determine redirect path based on user state
      const redirectPath = await getRedirectPath();
      router.push(redirectPath);
    } catch (error: any) {
      // التحقق من رسالة الخطأ الخاصة بحسابات الإدارة
      const isAdminAccount =
        error?.message?.includes("مخصص للإدارة") ||
        error?.message?.includes("admin");

      const errorMsg = isAdminAccount
        ? lang === "ar"
          ? "هذا الحساب مخصص للإدارة. يرجى استخدام لوحة التحكم للدخول."
          : "This account is for admin use. Please use the dashboard to sign in."
        : lang === "ar"
        ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
        : "Invalid email or password";

      setErrorMessage(errorMsg);
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    setIsGoogleLoading(true);
    setErrorMessage("");

    try {
      await googleSignInMutation.mutateAsync({
        idToken: idToken,
      });

      toast({
        title: lang === "ar" ? "تم بنجاح" : "Success",
        description:
          lang === "ar" ? "تم تسجيل الدخول بنجاح" : "Successfully signed in",
      });

      // Determine redirect path based on user state
      const redirectPath = await getRedirectPath();
      router.push(redirectPath);
    } catch (error: any) {
      const errorMsg =
        lang === "ar"
          ? "فشل تسجيل الدخول بحساب جوجل"
          : "Failed to sign in with Google";

      setErrorMessage(errorMsg);
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: error?.message || errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    const errorMsg =
      lang === "ar"
        ? "فشل تسجيل الدخول بحساب جوجل"
        : "Failed to sign in with Google";

    setErrorMessage(errorMsg);
    toast({
      title: lang === "ar" ? "خطأ" : "Error",
      description: errorMsg,
      variant: "destructive",
    });
  };

  const handleFacebookSuccess = async (accessToken: string) => {
    setIsFacebookLoading(true);
    setErrorMessage("");

    try {
      await facebookSignInMutation.mutateAsync({
        accessToken: accessToken,
      });

      toast({
        title: lang === "ar" ? "تم بنجاح" : "Success",
        description:
          lang === "ar" ? "تم تسجيل الدخول بنجاح" : "Successfully signed in",
      });

      // Determine redirect path based on user state
      const redirectPath = await getRedirectPath();
      router.push(redirectPath);
    } catch (error: any) {
      const errorMsg =
        lang === "ar"
          ? "فشل تسجيل الدخول بحساب فيسبوك"
          : "Failed to sign in with Facebook";

      setErrorMessage(errorMsg);
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: error?.message || errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsFacebookLoading(false);
    }
  };

  const handleFacebookError = () => {
    const errorMsg =
      lang === "ar"
        ? "فشل تسجيل الدخول بحساب فيسبوك"
        : "Failed to sign in with Facebook";

    setErrorMessage(errorMsg);
    toast({
      title: lang === "ar" ? "خطأ" : "Error",
      description: errorMsg,
      variant: "destructive",
    });
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {t.auth.signIn}
        </h2>
        <p className="text-gray-600">
          {lang === "ar"
            ? "أدخل بياناتك للوصول إلى حسابك"
            : "Enter your credentials to access your account"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {errorMessage && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-800 text-center">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            {t.auth.email}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={
              lang === "ar" ? "أدخل بريدك الإلكتروني" : "Enter your email"
            }
            className={`h-11 ${
              errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            {...register("email")}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span>⚠</span> {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            {t.auth.password}
          </Label>
          <Input
            id="password"
            type="password"
            placeholder={
              lang === "ar" ? "أدخل كلمة المرور" : "Enter your password"
            }
            className={`h-11 ${
              errors.password ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            {...register("password")}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span>⚠</span> {errors.password.message}
            </p>
          )}
        </div>

        {/* <div className="flex items-center justify-end">
          <Link
            href={`/${lang}/auth/forgot-password`}
            className="text-sm text-primary hover:underline font-medium"
          >
            {t.auth.forgotPassword}
          </Link>
        </div> */}

        <Button
          type="submit"
          className="w-full h-11 text-base font-semibold"
          disabled={isLoading || isGoogleLoading || isFacebookLoading}
        >
          {isLoading ? t.common.loading : t.auth.signIn}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              {lang === "ar" ? "أو" : "Or"}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            lang={lang}
            isLoading={isLoading || isGoogleLoading || isFacebookLoading}
            mode="signin"
          />

          <FacebookSignInButton
            onSuccess={handleFacebookSuccess}
            onError={handleFacebookError}
            lang={lang}
            isLoading={isLoading || isGoogleLoading || isFacebookLoading}
            mode="signin"
          />
        </div>

        <div className="text-center text-sm pt-4 border-t">
          <span className="text-gray-600">
            {lang === "ar" ? "ليس لديك حساب؟ " : "Don't have an account? "}
          </span>
          <Link
            href={`/${lang}/auth/signup`}
            className="text-primary hover:underline font-semibold"
          >
            {t.auth.signUp}
          </Link>
        </div>
      </form>
    </div>
  );
}
