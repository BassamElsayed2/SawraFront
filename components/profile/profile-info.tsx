"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
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
import { User, Mail, Phone, Edit, Save, X } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileInfoProps {
  user: any;
  profile: any;
  lang: string;
  t: any;
}

export function ProfileInfo({ user, profile, lang, t }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string>("");
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const { updateProfile, checkPhoneExists } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
    },
  });

  const handlePhoneBlur = async (phone: string) => {
    // إذا كان نفس رقم الهاتف القديم، لا داعي للتحقق
    if (!phone || phone === profile?.phone || phone.length < 10) {
      setPhoneError("");
      return;
    }

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

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setPhoneError("");

    // التحقق من رقم الهاتف إذا تم تغييره
    if (data.phone !== profile?.phone) {
      try {
        const { exists, error: checkError } = await checkPhoneExists(
          data.phone
        );

        if (checkError) {
          toast({
            title: lang === "ar" ? "خطأ" : "Error",
            description:
              lang === "ar"
                ? "حدث خطأ أثناء التحقق"
                : "Error during verification",
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
    }

    try {
      await updateProfile(data);

      toast({
        title: lang === "ar" ? "نجح" : "Success",
        description:
          lang === "ar"
            ? "تم تحديث الملف الشخصي بنجاح"
            : "Profile updated successfully",
      });

      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description:
          error?.message ||
          (lang === "ar"
            ? "فشل تحديث الملف الشخصي"
            : "Failed to update profile"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>{t.profile.personalInfo}</span>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 me-2" />
              {t.profile.editProfile}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">{t.auth.fullName}</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Enter your full name"
                {...register("full_name")}
                disabled={isLoading}
              />
              {errors.full_name && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {errors.full_name.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t.auth.phone}</Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  {...register("phone", {
                    onBlur: (e) => handlePhoneBlur(e.target.value),
                  })}
                  disabled={isLoading}
                  className={phoneError ? "border-red-500" : ""}
                />
                {isCheckingPhone && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              {errors.phone && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.phone.message}</AlertDescription>
                </Alert>
              )}
              {phoneError && !errors.phone && (
                <Alert variant="destructive">
                  <AlertDescription>{phoneError}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 me-2" />
                {isLoading ? t.common.loading : t.profile.saveChanges}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="h-4 w-4 me-2" />
                {t.profile.cancel}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t.auth.fullName}
                </p>
                <p className="text-sm text-gray-500">
                  {profile?.full_name || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t.auth.phone}
                </p>
                <p className="text-sm text-gray-500">
                  {profile?.phone || "Not set"}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
