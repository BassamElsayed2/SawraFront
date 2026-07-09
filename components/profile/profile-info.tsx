"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  Edit,
  Save,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

function createProfileSchema(lang: string) {
  const isAr = lang === "ar";
  return z.object({
    full_name: z
      .string()
      .min(
        2,
        isAr
          ? "الاسم يجب أن يكون حرفين على الأقل"
          : "Full name must be at least 2 characters",
      ),
    phone: z
      .string()
      .min(
        10,
        isAr
          ? "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"
          : "Phone number must be at least 10 characters",
      ),
  });
}

type ProfileFormData = z.infer<ReturnType<typeof createProfileSchema>>;

interface ProfileInfoProps {
  user: any;
  profile: any;
  lang: string;
  t: any;
}

function InfoRow({
  icon: Icon,
  label,
  value,
  dir,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-red-500 shadow-sm">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-gray-900" dir={dir}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function ProfileInfo({ user, profile, lang, t }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string>("");
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const { updateProfile, checkPhoneExists } = useAuth();
  const { toast } = useToast();
  const isAr = lang === "ar";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(createProfileSchema(lang)),
    defaultValues: {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
    },
  });

  const handlePhoneBlur = async (phone: string) => {
    if (!phone || phone === profile?.phone || phone.length < 10) {
      setPhoneError("");
      return;
    }

    setIsCheckingPhone(true);
    setPhoneError("");

    try {
      const { exists, error } = await checkPhoneExists(phone);
      if (error) return;
      if (exists) {
        setPhoneError(
          isAr ? "رقم الهاتف مسجل بالفعل" : "Phone number is already registered",
        );
      }
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setPhoneError("");

    if (data.phone !== profile?.phone) {
      try {
        const { exists, error: checkError } = await checkPhoneExists(
          data.phone,
        );

        if (checkError) {
          toast({
            title: isAr ? "خطأ" : "Error",
            description: isAr ? "حدث خطأ أثناء التحقق" : "Error during verification",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (exists) {
          setPhoneError(
            isAr
              ? "رقم الهاتف مسجل بالفعل"
              : "Phone number is already registered",
          );
          setIsLoading(false);
          return;
        }
      } catch {
        setIsLoading(false);
        return;
      }
    }

    try {
      await updateProfile(data);
      toast({
        title: isAr ? "نجح" : "Success",
        description: isAr
          ? "تم تحديث الملف الشخصي بنجاح"
          : "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: isAr ? "خطأ" : "Error",
        description:
          error?.message ||
          (isAr ? "فشل تحديث الملف الشخصي" : "Failed to update profile"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setPhoneError("");
    setIsEditing(false);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-lg backdrop-blur-sm sm:rounded-3xl">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-red-600" />
          <h2 className="text-base font-bold text-gray-900 sm:text-lg">
            {t.profile.personalInfo}
          </h2>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 transition-all hover:border-red-200 hover:text-red-600 active:scale-[0.98] sm:text-sm"
          >
            <Edit className="h-4 w-4" />
            {t.profile.editProfile}
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t.auth.email}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  dir="ltr"
                  className="h-11 bg-gray-50 ps-10 text-start"
                />
              </div>
              <p className="text-xs text-gray-500">
                {isAr ? "لا يمكن تغيير البريد الإلكتروني" : "Email cannot be changed"}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="full_name">{t.auth.fullName}</Label>
              <div className="relative">
                <User className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="full_name"
                  type="text"
                  placeholder={isAr ? "الاسم الكامل" : "Full name"}
                  className={`h-11 ps-10 ${errors.full_name ? "border-red-500" : ""}`}
                  {...register("full_name")}
                  disabled={isLoading}
                />
              </div>
              {errors.full_name && (
                <p className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">{t.auth.phone}</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  dir="ltr"
                  placeholder={isAr ? "01xxxxxxxxx" : "Phone number"}
                  className={`h-11 ps-10 text-start ${phoneError || errors.phone ? "border-red-500" : ""}`}
                  {...register("phone", {
                    onBlur: (e) => handlePhoneBlur(e.target.value),
                  })}
                  disabled={isLoading}
                />
                {isCheckingPhone && (
                  <Loader2 className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-red-600" />
                )}
              </div>
              {(errors.phone || phoneError) && (
                <p className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.phone?.message || phoneError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition-all hover:bg-red-500 active:scale-[0.98] disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isLoading ? t.common.loading : t.profile.saveChanges}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 active:scale-[0.98] sm:w-auto"
              >
                <X className="h-4 w-4" />
                {t.profile.cancel}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <InfoRow
              icon={Mail}
              label={t.auth.email}
              value={user.email}
              dir="ltr"
            />
            <InfoRow
              icon={User}
              label={t.auth.fullName}
              value={profile?.full_name || (isAr ? "غير محدد" : "Not set")}
            />
            <InfoRow
              icon={Phone}
              label={t.auth.phone}
              value={profile?.phone || (isAr ? "غير محدد" : "Not set")}
              dir="ltr"
            />
          </div>
        )}
      </div>
    </div>
  );
}
