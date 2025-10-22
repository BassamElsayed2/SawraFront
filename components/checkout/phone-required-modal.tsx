"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProfile } from "@/hooks/use-api";

interface PhoneRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lang: string;
}

export function PhoneRequiredModal({
  isOpen,
  onClose,
  onSuccess,
  lang,
}: PhoneRequiredModalProps) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const updateProfileMutation = useUpdateProfile();
  const router = useRouter();

  const validatePhone = (phoneNumber: string) => {
    // Egyptian phone number regex
    const phoneRegex = /^(\+?20)?[0-9]{10,11}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone.trim()) {
      setError(lang === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required");
      return;
    }

    if (!validatePhone(phone)) {
      setError(
        lang === "ar"
          ? "رقم الهاتف غير صحيح (مثال: 01234567890)"
          : "Invalid phone number (e.g., 01234567890)"
      );
      return;
    }

    setIsLoading(true);

    try {
      await updateProfileMutation.mutateAsync({ phone });

      toast({
        title: lang === "ar" ? "تم بنجاح" : "Success",
        description:
          lang === "ar"
            ? "تم إضافة رقم الهاتف بنجاح"
            : "Phone number added successfully",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      setError(
        error?.message ||
          (lang === "ar"
            ? "حدث خطأ أثناء حفظ رقم الهاتف"
            : "Error saving phone number")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {lang === "ar" ? "رقم الهاتف مطلوب" : "Phone Number Required"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {lang === "ar"
              ? "نحتاج رقم هاتفك لإتمام الطلب والتواصل معك عند التوصيل"
              : "We need your phone number to complete the order and contact you during delivery"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              {lang === "ar" ? "رقم الهاتف" : "Phone Number"}
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder={lang === "ar" ? "01234567890" : "01234567890"}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`h-11 ${error ? "border-red-500" : ""}`}
              disabled={isLoading}
              autoFocus
              dir="ltr"
            />
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span>⚠</span> {error}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {lang === "ar"
                ? "مثال: 01234567890 أو +201234567890"
                : "Example: 01234567890 or +201234567890"}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading
                ? lang === "ar"
                  ? "جاري الحفظ..."
                  : "Saving..."
                : lang === "ar"
                ? "حفظ ومتابعة"
                : "Save & Continue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
