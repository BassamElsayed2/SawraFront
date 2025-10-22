"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useGoogleSignIn } from "@/hooks/use-api";
import { GoogleSignInButton } from "./google-signin-button";

type SignUpFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
};

interface SignUpFormProps {
  lang: string;
  t: any;
}

export function SignUpForm({ lang, t }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [passwordValue, setPasswordValue] = useState("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const { signUp, checkPhoneExists } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const googleSignInMutation = useGoogleSignIn();

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

  const signUpSchema = z
    .object({
      fullName: z
        .string()
        .min(1, lang === "ar" ? "الاسم الكامل مطلوب" : "Full name is required")
        .min(
          2,
          lang === "ar"
            ? "الاسم يجب أن يكون حرفين على الأقل"
            : "Name must be at least 2 characters"
        ),
      phone: z
        .string()
        .min(1, lang === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required")
        .regex(
          /^(\+?20)?[0-9]{10,11}$/,
          lang === "ar"
            ? "رقم الهاتف المصري غير صحيح (مثال: 01234567890 أو +201234567890)"
            : "Invalid Egyptian phone number (e.g., 01234567890 or +201234567890)"
        ),
      email: z
        .string()
        .min(1, lang === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required")
        .email(
          lang === "ar" ? "البريد الإلكتروني غير صحيح" : "Invalid email address"
        ),
      password: z
        .string()
        .min(1, lang === "ar" ? "كلمة المرور مطلوبة" : "Password is required")
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
      confirmPassword: z
        .string()
        .min(
          1,
          lang === "ar"
            ? "تأكيد كلمة المرور مطلوب"
            : "Confirm password is required"
        ),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message:
        lang === "ar" ? "كلمات المرور غير متطابقة" : "Passwords don't match",
      path: ["confirmPassword"],
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const handlePhoneBlur = async (phone: string) => {
    if (!phone || phone.length < 10) return;

    setIsCheckingPhone(true);
    setPhoneError("");

    try {
      const { exists, error } = await checkPhoneExists(phone);

      if (error) {
        // Error is logged internally by the API service
        return;
      }

      if (exists) {
        setPhoneError(
          lang === "ar"
            ? "رقم الهاتف مسجل بالفعل"
            : "Phone number is already registered"
        );
      }
    } catch (error) {
      // Error is logged internally by the API service
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    setPhoneError("");

    // التحقق النهائي من رقم الهاتف قبل التسجيل
    try {
      const { exists, error: checkError } = await checkPhoneExists(data.phone);

      if (checkError) {
        const errorMsg =
          lang === "ar" ? "حدث خطأ أثناء التحقق" : "Error during verification";
        setErrorMessage(errorMsg);
        toast({
          title: lang === "ar" ? "خطأ" : "Error",
          description: errorMsg,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (exists) {
        const errorMsg =
          lang === "ar"
            ? "رقم الهاتف مسجل بالفعل"
            : "Phone number is already registered";
        setPhoneError(errorMsg);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      // Error is logged internally by the API service
      setIsLoading(false);
      return;
    }

    try {
      await signUp({
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        phone: data.phone,
      });

      toast({
        title: lang === "ar" ? "نجح" : "Success",
        description: t.auth.signUpSuccess,
      });

      router.push(`/${lang}/profile`);
    } catch (error: any) {
      let errorMsg =
        lang === "ar" ? "فشل إنشاء الحساب" : "Failed to create account";

      if (error?.message) {
        if (error.message.includes("already registered")) {
          errorMsg =
            lang === "ar"
              ? "البريد الإلكتروني مستخدم بالفعل"
              : "Email is already registered";
        } else if (error.message.includes("Phone number already registered")) {
          errorMsg =
            lang === "ar"
              ? "رقم الهاتف مسجل بالفعل"
              : "Phone number is already registered";
        } else {
          errorMsg = lang === "ar" ? "حدث خطأ غير متوقع" : error.message;
        }
      }

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
      const result = await googleSignInMutation.mutateAsync({
        idToken: idToken,
      });

      // Check if it's a new user from the response
      const isNewUser = result?.data?.isNewUser;

      toast({
        title: lang === "ar" ? "تم بنجاح" : "Success",
        description: isNewUser
          ? lang === "ar"
            ? "تم إنشاء حسابك بنجاح"
            : "Account created successfully"
          : lang === "ar"
          ? "تم تسجيل الدخول بنجاح"
          : "Successfully signed in",
      });

      router.push(`/${lang}/profile`);
    } catch (error: any) {
      const errorMsg =
        lang === "ar"
          ? "فشل إنشاء الحساب بواسطة جوجل"
          : "Failed to sign up with Google";

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
        ? "فشل إنشاء الحساب بواسطة جوجل"
        : "Failed to sign up with Google";

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
          {t.auth.signUp}
        </h2>
        <p className="text-gray-600">
          {lang === "ar"
            ? "أنشئ حساباً جديداً للبدء"
            : "Create a new account to get started"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-800 text-center">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="fullName"
            className="text-sm font-medium text-gray-700"
          >
            {t.auth.fullName}
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder={
              lang === "ar" ? "أدخل اسمك الكامل" : "Enter your full name"
            }
            className={`h-11 ${
              errors.fullName ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            {...register("fullName")}
            disabled={isLoading}
          />
          {errors.fullName && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span>⚠</span> {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            {t.auth.phone}
          </Label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              placeholder={
                lang === "ar" ? "أدخل رقم هاتفك" : "Enter your phone number"
              }
              className={`h-11 ${
                errors.phone || phoneError
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
              {...register("phone", {
                onBlur: (e) => handlePhoneBlur(e.target.value),
              })}
              disabled={isLoading}
            />
            {isCheckingPhone && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span>⚠</span> {errors.phone.message}
            </p>
          )}
          {phoneError && !errors.phone && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span>⚠</span> {phoneError}
            </p>
          )}
          {!errors.phone && !phoneError && !isCheckingPhone && (
            <p className="text-xs text-gray-500">
              {lang === "ar"
                ? "سيتم التحقق من رقم الهاتف تلقائياً"
                : "Phone number will be verified automatically"}
            </p>
          )}
        </div>

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
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span>⚠</span> {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700"
          >
            {t.auth.confirmPassword}
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder={
              lang === "ar" ? "أعد إدخال كلمة المرور" : "Confirm your password"
            }
            className={`h-11 ${
              errors.confirmPassword
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
            {...register("confirmPassword")}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span>⚠</span> {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base font-semibold mt-6"
          disabled={isLoading || isGoogleLoading}
        >
          {isLoading ? t.common.loading : t.auth.signUp}
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

        <GoogleSignInButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          lang={lang}
          isLoading={isLoading || isGoogleLoading}
          mode="signup"
        />

        <div className="text-center text-sm pt-4 border-t">
          <span className="text-gray-600">
            {lang === "ar" ? "لديك حساب بالفعل؟ " : "Already have an account? "}
          </span>
          <Link
            href={`/${lang}/auth/signin`}
            className="text-primary hover:underline font-semibold"
          >
            {t.auth.signIn}
          </Link>
        </div>
      </form>
    </div>
  );
}
