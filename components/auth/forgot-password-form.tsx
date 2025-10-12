"use client";

import { useState } from "react";
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

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  lang: string;
  t: any;
}

export function ForgotPasswordForm({ lang, t }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await resetPassword(data.email);

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to send reset email",
          variant: "destructive",
        });
        return;
      }

      setIsSuccess(true);
      toast({
        title: "Success",
        description: t.auth.resetPasswordSent,
      });
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

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-8">
          <CardTitle className="text-3xl text-center font-bold text-green-600">
            {lang === "ar"
              ? "تم ارسال رابط استعادة كلمة المرور"
              : "Check Your Email"}
          </CardTitle>
          <CardDescription className="text-center">
            {lang === "ar"
              ? "لقد ارسلنا لك رابط استعادة كلمة المرور"
              : "We've sent you a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>{t.auth.resetPasswordSent}</AlertDescription>
          </Alert>

          <div className="text-center">
            <Link
              href={`/${lang}/auth/signin`}
              className="text-primary hover:underline"
            >
              {lang === "ar" ? "العودة إلى تسجيل الدخول" : "Back to Sign In"}
            </Link>
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
            ? "أدخل بريدك الإلكتروني للحصول على رابط استعادة كلمة المرور"
            : "Enter your email to receive a password reset link"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <Alert variant="destructive">
                <AlertDescription>{errors.email.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? lang === "ar"
                ? "جاري الارسال"
                : "Sending..."
              : lang === "ar"
              ? "ارسل رابط استعادة كلمة المرور"
              : "Send Reset Link"}
          </Button>

          <div className="text-center text-sm">
            {lang === "ar"
              ? "هل تتذكر كلمة المرور؟"
              : "Remember your password?"}
            <Link
              href={`/${lang}/auth/signin`}
              className="text-primary hover:underline"
            >
              {t.auth.signIn}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
