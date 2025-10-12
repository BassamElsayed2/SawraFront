"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { createClient } from "@/services/supabase";

const resetPasswordSchema = (lang: string) =>
  z
    .object({
      password: z
        .string()
        .min(
          8,
          lang === "ar"
            ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
            : "Password must be at least 8 characters"
        )
        .regex(
          /[a-z]/,
          lang === "ar"
            ? "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل"
            : "Password must contain at least one lowercase letter"
        )
        .regex(
          /[A-Z]/,
          lang === "ar"
            ? "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل"
            : "Password must contain at least one uppercase letter"
        )
        .regex(
          /[0-9]/,
          lang === "ar"
            ? "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل"
            : "Password must contain at least one number"
        )
        .regex(
          /[^a-zA-Z0-9]/,
          lang === "ar"
            ? "كلمة المرور يجب أن تحتوي على حرف خاص واحد على الأقل (!@#$%^&*)"
            : "Password must contain at least one special character (!@#$%^&*)"
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message:
        lang === "ar" ? "كلمات المرور غير متطابقة" : "Passwords don't match",
      path: ["confirmPassword"],
    });

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

interface ResetPasswordFormProps {
  lang: string;
  t: any;
}

export function ResetPasswordForm({ lang, t }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  // تحليل قوة كلمة المرور
  const passwordStrength = useMemo(() => {
    const checks = {
      length: passwordValue.length >= 8,
      lowercase: /[a-z]/.test(passwordValue),
      uppercase: /[A-Z]/.test(passwordValue),
      number: /[0-9]/.test(passwordValue),
      special: /[^a-zA-Z0-9]/.test(passwordValue),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const strength =
      passedChecks === 5 ? "strong" : passedChecks >= 3 ? "medium" : "weak";

    return { checks, strength, passedChecks };
  }, [passwordValue]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema(lang)),
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if there's a valid session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          toast({
            title: lang === "ar" ? "خطأ" : "Error",
            description:
              lang === "ar"
                ? "حدث خطأ أثناء التحقق من الجلسة"
                : "An error occurred while verifying the session",
            variant: "destructive",
          });
          router.push(`/${lang}/auth/forgot-password`);
          return;
        }

        if (!session) {
          toast({
            title: lang === "ar" ? "خطأ" : "Error",
            description:
              lang === "ar"
                ? "رابط غير صالح أو منتهي الصلاحية"
                : "Invalid or expired reset link",
            variant: "destructive",
          });
          router.push(`/${lang}/auth/forgot-password`);
          return;
        }

        // Valid session found - user can now reset password
        setIsValidToken(true);
      } catch (error) {
        console.error("Error checking session:", error);
        toast({
          title: lang === "ar" ? "خطأ" : "Error",
          description:
            lang === "ar"
              ? "حدث خطأ أثناء التحقق من الرابط"
              : "An error occurred while verifying the link",
          variant: "destructive",
        });
        router.push(`/${lang}/auth/forgot-password`);
      }
    };

    checkSession();
  }, [router, lang, toast, supabase.auth]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update password",
          variant: "destructive",
        });
        return;
      }

      setIsSuccess(true);
      toast({
        title: "Success",
        description: t.auth.passwordUpdated,
      });

      setTimeout(() => {
        router.push(`/${lang}/auth/signin`);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>
              {lang === "ar"
                ? "جاري التحقق من رابط استعادة كلمة المرور..."
                : "Verifying reset token..."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-8">
          <CardTitle className="text-3xl text-center font-bold text-green-600">
            {lang === "ar" ? "تم تحديث كلمة المرور بنجاح" : "Password Updated"}
          </CardTitle>
          <CardDescription className="text-center">
            {lang === "ar"
              ? "تم تحديث كلمة المرور بنجاح"
              : "Your password has been successfully updated"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>{t.auth.passwordUpdated}</AlertDescription>
          </Alert>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {lang === "ar"
                ? "جاري التحويل إلى صفحة التسجيل..."
                : "Redirecting to sign in page..."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-8">
        <CardTitle className="text-3xl text-center font-bold text-gray-900">
          {t.auth.resetPassword}
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          {lang === "ar"
            ? "أدخل كلمة المرور الجديدة"
            : "Enter your new password"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t.auth.newPassword}</Label>
            <Input
              id="password"
              type="password"
              placeholder={
                lang === "ar"
                  ? "أدخل كلمة المرور الجديدة"
                  : "Enter your new password"
              }
              {...register("password", {
                onChange: (e) => setPasswordValue(e.target.value),
              })}
              disabled={isLoading}
            />

            {/* مؤشر قوة كلمة المرور */}
            {passwordValue && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        level <= passwordStrength.passedChecks
                          ? passwordStrength.strength === "strong"
                            ? "bg-green-500"
                            : passwordStrength.strength === "medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                <div className="space-y-1">
                  {[
                    {
                      key: "length",
                      label:
                        lang === "ar"
                          ? "8 أحرف على الأقل"
                          : "At least 8 characters",
                    },
                    {
                      key: "uppercase",
                      label:
                        lang === "ar"
                          ? "حرف كبير (A-Z)"
                          : "Uppercase letter (A-Z)",
                    },
                    {
                      key: "lowercase",
                      label:
                        lang === "ar"
                          ? "حرف صغير (a-z)"
                          : "Lowercase letter (a-z)",
                    },
                    {
                      key: "number",
                      label: lang === "ar" ? "رقم (0-9)" : "Number (0-9)",
                    },
                    {
                      key: "special",
                      label:
                        lang === "ar"
                          ? "حرف خاص (!@#$%^&*)"
                          : "Special character (!@#$%^&*)",
                    },
                  ].map((requirement) => (
                    <div
                      key={requirement.key}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className={`${
                          passwordStrength.checks[
                            requirement.key as keyof typeof passwordStrength.checks
                          ]
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {passwordStrength.checks[
                          requirement.key as keyof typeof passwordStrength.checks
                        ]
                          ? "✓"
                          : "○"}
                      </span>
                      <span
                        className={`${
                          passwordStrength.checks[
                            requirement.key as keyof typeof passwordStrength.checks
                          ]
                            ? "text-green-700"
                            : "text-gray-500"
                        }`}
                      >
                        {requirement.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.password && (
              <Alert variant="destructive">
                <AlertDescription>{errors.password.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.auth.confirmNewPassword}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={
                lang === "ar"
                  ? "أدخل كلمة المرور الجديدة مرة أخرى"
                  : "Confirm your new password"
              }
              {...register("confirmPassword")}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <Alert variant="destructive">
                <AlertDescription>
                  {errors.confirmPassword.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? lang === "ar"
                ? "جاري التحديث"
                : "Updating..."
              : lang === "ar"
              ? "تحديث كلمة المرور"
              : "Update Password"}
          </Button>

          <div className="text-center text-sm">
            <Link
              href={`/${lang}/auth/signin`}
              className="text-primary hover:underline"
            >
              {lang === "ar" ? "العودة إلى تسجيل الدخول" : "Back to Sign In"}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
