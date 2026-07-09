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
import { useCart } from "@/hooks/use-cart";
import { addressesApi } from "@/services/apiAddresses";
import { useAppDispatch } from "@/store/hooks";
import { fetchMe } from "@/store/slices/auth-slice";
import { trySafeAuthRedirectPath } from "@/lib/auth-redirect";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  LogIn,
  X,
} from "lucide-react";

const ERROR_ALERT_DURATION_MS = 6000;

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
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const googleSignInMutation = useGoogleSignIn();
  const facebookSignInMutation = useFacebookSignIn();
  const { getTotalItems } = useCart();
  const isAr = lang === "ar";
  const isAnyLoading = isLoading || isGoogleLoading || isFacebookLoading;

  const clearError = () => setErrorMessage("");

  useEffect(() => {
    if (!errorMessage) return;

    const timer = setTimeout(clearError, ERROR_ALERT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "admin-account") {
      const msg = isAr
        ? "هذا الحساب مخصص للإدارة. يرجى استخدام لوحة التحكم للدخول."
        : "This account is for admin use. Please use the dashboard to sign in.";
      setErrorMessage(msg);
      toast({
        title: isAr ? "خطأ" : "Error",
        description: msg,
        variant: "destructive",
      });
    }
  }, [searchParams, isAr, toast]);

  const signInSchema = z.object({
    email: z
      .string()
      .min(1, isAr ? "البريد الإلكتروني مطلوب" : "Email is required")
      .email(isAr ? "البريد الإلكتروني غير صحيح" : "Invalid email address"),
    password: z
      .string()
      .min(1, isAr ? "كلمة المرور مطلوبة" : "Password is required"),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  useEffect(() => {
    const subscription = watch((_, { name, type }) => {
      if (
        errorMessage &&
        type === "change" &&
        (name === "email" || name === "password")
      ) {
        clearError();
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, errorMessage]);

  const getRedirectPath = async () => {
    try {
      const { data: addresses, error } = await addressesApi.getAddresses();

      if (error || !addresses || addresses.length === 0) {
        return `/${lang}/profile/addresses/add`;
      }

      const cartItemsCount = getTotalItems();

      if (cartItemsCount === 0) {
        return `/${lang}/menu`;
      }

      return `/${lang}/checkout`;
    } catch {
      return `/${lang}/profile`;
    }
  };

  const resolvePostAuthPath = async () => {
    const fromQuery = trySafeAuthRedirectPath(searchParams.get("redirect"));
    if (fromQuery) return fromQuery;
    return getRedirectPath();
  };

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      await signIn(data.email, data.password);

      toast({
        title: isAr ? "نجح" : "Success",
        description: t.auth.signInSuccess,
      });

      const redirectPath = await resolvePostAuthPath();
      router.push(redirectPath);
    } catch (error: any) {
      const isAdminAccount =
        error?.message?.includes("مخصص للإدارة") ||
        error?.message?.includes("admin");

      const errorMsg = isAdminAccount
        ? isAr
          ? "هذا الحساب مخصص للإدارة. يرجى استخدام لوحة التحكم للدخول."
          : "This account is for admin use. Please use the dashboard to sign in."
        : isAr
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
          : "Invalid email or password";

      setErrorMessage(errorMsg);
      toast({
        title: isAr ? "خطأ" : "Error",
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
      await googleSignInMutation.mutateAsync({ idToken });
      await dispatch(fetchMe()).unwrap();

      toast({
        title: isAr ? "تم بنجاح" : "Success",
        description: isAr ? "تم تسجيل الدخول بنجاح" : "Successfully signed in",
      });

      const redirectPath = await resolvePostAuthPath();
      router.push(redirectPath);
    } catch (error: any) {
      const errorMsg = isAr
        ? "فشل تسجيل الدخول بحساب جوجل"
        : "Failed to sign in with Google";

      setErrorMessage(errorMsg);
      toast({
        title: isAr ? "خطأ" : "Error",
        description: error?.message || errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    const errorMsg = isAr
      ? "فشل تسجيل الدخول بحساب جوجل"
      : "Failed to sign in with Google";

    setErrorMessage(errorMsg);
    toast({
      title: isAr ? "خطأ" : "Error",
      description: errorMsg,
      variant: "destructive",
    });
  };

  const handleFacebookSuccess = async (accessToken: string) => {
    setIsFacebookLoading(true);
    setErrorMessage("");

    try {
      await facebookSignInMutation.mutateAsync({ accessToken });
      await dispatch(fetchMe()).unwrap();

      toast({
        title: isAr ? "تم بنجاح" : "Success",
        description: isAr ? "تم تسجيل الدخول بنجاح" : "Successfully signed in",
      });

      const redirectPath = await resolvePostAuthPath();
      router.push(redirectPath);
    } catch (error: any) {
      const errorMsg = isAr
        ? "فشل تسجيل الدخول بحساب فيسبوك"
        : "Failed to sign in with Facebook";

      setErrorMessage(errorMsg);
      toast({
        title: isAr ? "خطأ" : "Error",
        description: error?.message || errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsFacebookLoading(false);
    }
  };

  const handleFacebookError = () => {
    const errorMsg = isAr
      ? "فشل تسجيل الدخول بحساب فيسبوك"
      : "Failed to sign in with Facebook";

    setErrorMessage(errorMsg);
    toast({
      title: isAr ? "خطأ" : "Error",
      description: errorMsg,
      variant: "destructive",
    });
  };

  return (
    <div className="w-full">
      <div className="mb-8 hidden lg:block">
        <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
          {t.auth.signIn}
        </h2>
        <p className="mt-2 text-gray-500">
          {isAr
            ? "أدخل بياناتك للوصول إلى حسابك"
            : "Enter your credentials to access your account"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {errorMessage && (
          <div
            role="alert"
            className="relative flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 pe-10 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="flex-1 text-sm text-red-800">{errorMessage}</p>
            <button
              type="button"
              onClick={clearError}
              aria-label={isAr ? "إغلاق التنبيه" : "Dismiss alert"}
              className="absolute end-3 top-3 rounded-md p-0.5 text-red-400 transition-colors hover:bg-red-100 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            {t.auth.email}
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              dir="ltr"
              placeholder={isAr ? "name@example.com" : "Enter your email"}
              className={`h-12 ps-10 text-start ${
                errors.email
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "focus-visible:ring-red-500/30"
              }`}
              {...register("email")}
              disabled={isAnyLoading}
            />
          </div>
          {errors.email && (
            <p className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              {t.auth.password}
            </Label>
            {/* <Link
              href={`/${lang}/auth/forgot-password`}
              className="text-xs font-medium text-red-600 transition-colors hover:text-red-500 hover:underline"
            >
              {t.auth.forgotPassword}
            </Link> */}
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={isAr ? "أدخل كلمة المرور" : "Enter your password"}
              className={`h-12 ps-10 pe-10 ${
                errors.password
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "focus-visible:ring-red-500/30"
              }`}
              {...register("password")}
              disabled={isAnyLoading}
            />
            <button
              type="button"
              aria-label={
                showPassword
                  ? isAr
                    ? "إخفاء كلمة المرور"
                    : "Hide password"
                  : isAr
                    ? "إظهار كلمة المرور"
                    : "Show password"
              }
              className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-12 w-full bg-red-600 text-base font-semibold hover:bg-red-500"
          disabled={isAnyLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.common.loading}
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              {t.auth.signIn}
            </>
          )}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400">
              {isAr ? "أو" : "Or"}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            lang={lang}
            isLoading={isAnyLoading}
            mode="signin"
          />

          <FacebookSignInButton
            onSuccess={handleFacebookSuccess}
            onError={handleFacebookError}
            lang={lang}
            isLoading={isAnyLoading}
            mode="signin"
          />
        </div>

        <div className="border-t border-gray-100 pt-5 text-center text-sm">
          <span className="text-gray-600">
            {isAr ? "ليس لديك حساب؟ " : "Don't have an account? "}
          </span>
          <Link
            href={`/${lang}/auth/signup`}
            className="font-semibold text-red-600 transition-colors hover:text-red-500 hover:underline"
          >
            {t.auth.signUp}
          </Link>
        </div>
      </form>
    </div>
  );
}
