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
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

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

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        // التحقق من رسالة الخطأ الخاصة بحسابات الإدارة
        const isAdminAccount =
          error.message?.includes("مخصص للإدارة") ||
          error.message?.includes("admin");

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
        return;
      }

      toast({
        title: lang === "ar" ? "نجح" : "Success",
        description: t.auth.signInSuccess,
      });

      router.push(`/${lang}/profile`);
    } catch (error) {
      const errorMsg =
        lang === "ar" ? "حدث خطأ غير متوقع" : "An unexpected error occurred";

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

        <div className="flex items-center justify-end">
          <Link
            href={`/${lang}/auth/forgot-password`}
            className="text-sm text-primary hover:underline font-medium"
          >
            {t.auth.forgotPassword}
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base font-semibold"
          disabled={isLoading}
        >
          {isLoading ? t.common.loading : t.auth.signIn}
        </Button>

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
