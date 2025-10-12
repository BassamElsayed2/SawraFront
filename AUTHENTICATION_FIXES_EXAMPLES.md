# أمثلة كود لإصلاح ثغرات المصادقة

# Authentication Security Fixes - Code Examples

هذا الملف يحتوي على أمثلة كود جاهزة لإصلاح الثغرات الأمنية المذكورة في تقرير الفحص.

---

## 1. إصلاح Secure و HttpOnly Cookies

### ❌ الكود الحالي (غير آمن):

```typescript
// app/services/supabase.ts
set(name: string, value: string, options: any) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=${
    options.path || "/"
  }; max-age=${options.maxAge || 31536000}; SameSite=${
    options.sameSite || "Lax"
  }`;
}
```

### ✅ الكود المُصلح (آمن):

```typescript
// app/services/supabase.ts
set(name: string, value: string, options: any) {
  if (typeof document === "undefined") return;

  const isProduction = process.env.NODE_ENV === "production";
  const secure = isProduction ? "; Secure" : "";
  const httpOnly = "; HttpOnly";
  const sameSite = "; SameSite=Strict"; // Changed from Lax to Strict
  const maxAge = options.maxAge || 604800; // 7 days instead of 1 year

  document.cookie = `${name}=${value}; path=${
    options.path || "/"
  }; max-age=${maxAge}${sameSite}${secure}${httpOnly}`;
}
```

---

## 2. إضافة Rate Limiting Middleware

### إنشاء ملف جديد:

```typescript
// app/lib/rate-limiter.ts
import { NextRequest } from "next/server";

interface RateLimitConfig {
  interval: number; // milliseconds
  maxRequests: number;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = { interval: 60000, maxRequests: 5 }
): { success: boolean; remaining: number; resetTime: number } {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const key = `${ip}-${request.nextUrl.pathname}`;

  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Clean up old entries
  if (record && now > record.resetTime) {
    rateLimitStore.delete(key);
  }

  // Get or create record
  const currentRecord = rateLimitStore.get(key) || {
    count: 0,
    resetTime: now + config.interval,
  };

  // Check if limit exceeded
  if (currentRecord.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: currentRecord.resetTime,
    };
  }

  // Increment counter
  currentRecord.count++;
  rateLimitStore.set(key, currentRecord);

  return {
    success: true,
    remaining: config.maxRequests - currentRecord.count,
    resetTime: currentRecord.resetTime,
  };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 300000);
```

### استخدام Rate Limiter في Middleware:

```typescript
// app/middleware.ts
import { rateLimit } from "@/lib/rate-limiter";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Apply rate limiting to auth routes
  if (
    pathname.includes("/auth/signin") ||
    pathname.includes("/auth/signup") ||
    pathname.includes("/auth/forgot-password")
  ) {
    const rateLimitResult = rateLimit(request, {
      interval: 60000, // 1 minute
      maxRequests: 5, // 5 requests per minute
    });

    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          message: "Please try again later",
          retryAfter: Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
          },
        }
      );
    }
  }

  // ... rest of middleware logic
}
```

---

## 3. Backend Password Validation

### إنشاء Password Validator:

```typescript
// app/lib/password-validator.ts
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePassword(
  password: string,
  lang: "ar" | "en" = "ar"
): PasswordValidationResult {
  const errors: string[] = [];

  // Minimum length
  if (password.length < 8) {
    errors.push(
      lang === "ar"
        ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
        : "Password must be at least 8 characters"
    );
  }

  // Maximum length (prevent DoS)
  if (password.length > 128) {
    errors.push(
      lang === "ar" ? "كلمة المرور طويلة جداً" : "Password is too long"
    );
  }

  // Lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push(
      lang === "ar"
        ? "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل"
        : "Password must contain at least one lowercase letter"
    );
  }

  // Uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push(
      lang === "ar"
        ? "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل"
        : "Password must contain at least one uppercase letter"
    );
  }

  // Number
  if (!/[0-9]/.test(password)) {
    errors.push(
      lang === "ar"
        ? "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل"
        : "Password must contain at least one number"
    );
  }

  // Special character
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push(
      lang === "ar"
        ? "كلمة المرور يجب أن تحتوي على حرف خاص واحد على الأقل"
        : "Password must contain at least one special character"
    );
  }

  // Check for common passwords
  const commonPasswords = [
    "password",
    "12345678",
    "qwerty123",
    "admin123",
    "password123",
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push(
      lang === "ar" ? "كلمة المرور شائعة جداً" : "Password is too common"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### استخدامه في API Route:

```typescript
// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validatePassword } from "@/lib/password-validator";
import { createClient } from "@/services/supabase-server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, full_name, phone } = body;

  // Validate password on backend
  const validation = validatePassword(password, "ar");
  if (!validation.valid) {
    return NextResponse.json(
      {
        error: "Invalid password",
        details: validation.errors,
      },
      { status: 400 }
    );
  }

  const supabase = createClient();

  // Continue with signup
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  // ... rest of signup logic
}
```

---

## 4. Account Lockout Mechanism

### إنشاء Account Lockout Manager:

```typescript
// app/lib/account-lockout.ts
interface LockoutRecord {
  failedAttempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

const lockoutStore = new Map<string, LockoutRecord>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 10 * 60 * 1000; // 10 minutes

export function checkAccountLockout(identifier: string): {
  locked: boolean;
  remainingTime?: number;
  attemptsLeft?: number;
} {
  const record = lockoutStore.get(identifier);

  if (!record) {
    return { locked: false, attemptsLeft: MAX_ATTEMPTS };
  }

  const now = Date.now();

  // Check if account is locked
  if (record.lockedUntil && now < record.lockedUntil) {
    return {
      locked: true,
      remainingTime: record.lockedUntil - now,
    };
  }

  // Reset if attempt window has passed
  if (now - record.lastAttempt > ATTEMPT_WINDOW) {
    lockoutStore.delete(identifier);
    return { locked: false, attemptsLeft: MAX_ATTEMPTS };
  }

  return {
    locked: false,
    attemptsLeft: MAX_ATTEMPTS - record.failedAttempts,
  };
}

export function recordFailedAttempt(identifier: string): {
  locked: boolean;
  attemptsLeft: number;
  lockedUntil?: number;
} {
  const now = Date.now();
  const record = lockoutStore.get(identifier) || {
    failedAttempts: 0,
    lockedUntil: null,
    lastAttempt: now,
  };

  record.failedAttempts++;
  record.lastAttempt = now;

  // Lock account if max attempts reached
  if (record.failedAttempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION;
    lockoutStore.set(identifier, record);

    return {
      locked: true,
      attemptsLeft: 0,
      lockedUntil: record.lockedUntil,
    };
  }

  lockoutStore.set(identifier, record);

  return {
    locked: false,
    attemptsLeft: MAX_ATTEMPTS - record.failedAttempts,
  };
}

export function clearFailedAttempts(identifier: string): void {
  lockoutStore.delete(identifier);
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of lockoutStore.entries()) {
    if (record.lockedUntil && now > record.lockedUntil + ATTEMPT_WINDOW) {
      lockoutStore.delete(key);
    }
  }
}, 300000);
```

### استخدامه في SignIn:

```typescript
// app/components/auth/signin-form.tsx
import {
  checkAccountLockout,
  recordFailedAttempt,
  clearFailedAttempts,
} from "@/lib/account-lockout";

const onSubmit = async (data: SignInFormData) => {
  setIsLoading(true);
  setErrorMessage("");

  // Check if account is locked
  const lockoutStatus = checkAccountLockout(data.email);
  if (lockoutStatus.locked) {
    const minutes = Math.ceil(lockoutStatus.remainingTime! / 60000);
    setErrorMessage(
      lang === "ar"
        ? `الحساب مقفل. حاول مرة أخرى بعد ${minutes} دقيقة`
        : `Account locked. Try again in ${minutes} minutes`
    );
    setIsLoading(false);
    return;
  }

  try {
    const { error } = await signIn(data.email, data.password);

    if (error) {
      // Record failed attempt
      const result = recordFailedAttempt(data.email);

      if (result.locked) {
        setErrorMessage(
          lang === "ar"
            ? "تم قفل الحساب بعد محاولات فاشلة متعددة"
            : "Account locked after multiple failed attempts"
        );
      } else {
        setErrorMessage(
          `${
            lang === "ar"
              ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
              : "Invalid email or password"
          }. ${lang === "ar" ? "المحاولات المتبقية" : "Attempts left"}: ${
            result.attemptsLeft
          }`
        );
      }
      return;
    }

    // Clear failed attempts on success
    clearFailedAttempts(data.email);

    toast({
      title: lang === "ar" ? "نجح" : "Success",
      description: t.auth.signInSuccess,
    });

    router.push(`/${lang}/profile`);
  } catch (error) {
    // ... error handling
  } finally {
    setIsLoading(false);
  }
};
```

---

## 5. Input Sanitization

### إنشاء Input Sanitizer:

```typescript
// app/lib/input-sanitizer.ts
export function sanitizeInput(input: string): string {
  if (!input) return "";

  // Remove null bytes
  let sanitized = input.replace(/\0/g, "");

  // Trim whitespace
  sanitized = sanitized.trim();

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");

  return sanitized;
}

export function sanitizeEmail(email: string): string {
  let sanitized = sanitizeInput(email);

  // Remove any characters that aren't valid in emails
  sanitized = sanitized.replace(/[^\w@.\-+]/g, "");

  // Lowercase
  sanitized = sanitized.toLowerCase();

  return sanitized;
}

export function sanitizePhone(phone: string): string {
  // Remove everything except digits, +, -, (, ), and spaces
  return phone.replace(/[^\d+\-() ]/g, "");
}

export function sanitizeName(name: string): string {
  let sanitized = sanitizeInput(name);

  // Allow only letters, spaces, and common name characters
  sanitized = sanitized.replace(/[^a-zA-Z\u0600-\u06FF\s\-']/g, "");

  // Limit length
  return sanitized.slice(0, 100);
}

export function sanitizeForHTML(input: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}
```

### استخدامه في النماذج:

```typescript
// app/components/auth/signup-form.tsx
import {
  sanitizeEmail,
  sanitizeName,
  sanitizePhone,
} from "@/lib/input-sanitizer";

const onSubmit = async (data: SignUpFormData) => {
  // Sanitize inputs before processing
  const sanitizedData = {
    email: sanitizeEmail(data.email),
    fullName: sanitizeName(data.fullName),
    phone: sanitizePhone(data.phone),
    password: data.password, // Don't sanitize password
  };

  // ... rest of submission logic
};
```

---

## 6. Security Logging

### إنشاء Security Logger:

```typescript
// app/lib/security-logger.ts
type SecurityEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "SIGNUP_SUCCESS"
  | "SIGNUP_FAILED"
  | "PASSWORD_RESET_REQUEST"
  | "PASSWORD_RESET_SUCCESS"
  | "ACCOUNT_LOCKED"
  | "SUSPICIOUS_ACTIVITY";

interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  email?: string;
  ip: string;
  userAgent: string;
  timestamp: number;
  details?: any;
}

export async function logSecurityEvent(event: SecurityEvent) {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("🔐 Security Event:", event);
  }

  // In production, send to your logging service
  try {
    // Example: Send to Supabase logs table
    const { createClient } = await import("@/services/supabase-server");
    const supabase = createClient();

    await supabase.from("security_logs").insert({
      event_type: event.type,
      user_id: event.userId,
      email: event.email,
      ip_address: event.ip,
      user_agent: event.userAgent,
      details: event.details,
      created_at: new Date(event.timestamp).toISOString(),
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}

// Helper to get IP from request
export function getIpFromRequest(request: any): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Helper to get user agent
export function getUserAgent(request: any): string {
  return request.headers.get("user-agent") || "unknown";
}
```

### SQL لإنشاء جدول الـ logs:

```sql
-- Create security_logs table
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX security_logs_event_type_idx ON security_logs(event_type);
CREATE INDEX security_logs_user_id_idx ON security_logs(user_id);
CREATE INDEX security_logs_created_at_idx ON security_logs(created_at DESC);

-- Enable RLS
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Only admins can view security logs" ON security_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );
```

### استخدامه في SignIn:

```typescript
// app/components/auth/signin-form.tsx
import { logSecurityEvent } from "@/lib/security-logger";

const onSubmit = async (data: SignInFormData) => {
  try {
    const { error } = await signIn(data.email, data.password);

    if (error) {
      // Log failed attempt
      await logSecurityEvent({
        type: "LOGIN_FAILED",
        email: data.email,
        ip: "client-side", // Will be captured in API route
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        details: { reason: error.message },
      });
      return;
    }

    // Log successful login
    await logSecurityEvent({
      type: "LOGIN_SUCCESS",
      email: data.email,
      ip: "client-side",
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });

    router.push(`/${lang}/profile`);
  } catch (error) {
    // ...
  }
};
```

---

## 7. Session Timeout Handling

### إنشاء Session Monitor:

```typescript
// app/hooks/use-session-timeout.ts
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export function useSessionTimeout(lang: string = "ar") {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();

  const resetTimer = () => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    if (!user) return;

    // Set warning timer
    warningRef.current = setTimeout(() => {
      toast({
        title: lang === "ar" ? "تنبيه" : "Warning",
        description:
          lang === "ar"
            ? "سيتم تسجيل خروجك بعد 5 دقائق من عدم النشاط"
            : "You will be logged out in 5 minutes due to inactivity",
        variant: "destructive",
      });
    }, IDLE_TIMEOUT - WARNING_TIME);

    // Set timeout timer
    timeoutRef.current = setTimeout(async () => {
      toast({
        title: lang === "ar" ? "انتهت الجلسة" : "Session Expired",
        description:
          lang === "ar"
            ? "تم تسجيل خروجك بسبب عدم النشاط"
            : "You have been logged out due to inactivity",
      });

      await signOut();
      router.push(`/${lang}/auth/signin?reason=timeout`);
    }, IDLE_TIMEOUT);
  };

  useEffect(() => {
    if (!user) return;

    // Events to track user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Reset timer on any activity
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [user]);
}
```

### استخدامه في Layout:

```typescript
// app/app/[lang]/layout.tsx
"use client";

import { useSessionTimeout } from "@/hooks/use-session-timeout";

export default function Layout({ children, params }: LayoutProps) {
  const { lang } = params;

  // Enable session timeout monitoring
  useSessionTimeout(lang);

  return <>{children}</>;
}
```

---

## 8. CSRF Protection Enhancement

### تحديث SameSite إلى Strict:

```typescript
// app/services/supabase.ts
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === "undefined") return undefined;
          const cookies = document.cookie.split("; ");
          const cookie = cookies.find((c) => c.startsWith(`${name}=`));
          return cookie?.split("=")[1];
        },
        set(name: string, value: string, options: any) {
          if (typeof document === "undefined") return;

          const isProduction = process.env.NODE_ENV === "production";
          const secure = isProduction ? "; Secure" : "";
          const sameSite = "; SameSite=Strict"; // Changed to Strict

          document.cookie = `${name}=${value}; path=${
            options.path || "/"
          }; max-age=${options.maxAge || 604800}${sameSite}${secure}`;
        },
        remove(name: string, options: any) {
          if (typeof document === "undefined") return;
          document.cookie = `${name}=; path=${
            options.path || "/"
          }; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        },
      },
    }
  );
}
```

---

## 9. Environment Variables Validation

### إنشاء Env Validator:

```typescript
// app/lib/env-validator.ts
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  // Validate format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  if (!supabaseUrl.startsWith("https://")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must start with https://");
  }

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (supabaseKey.length < 50) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid (too short)"
    );
  }

  console.log("✅ Environment variables validated successfully");
}
```

### استخدامه عند بدء التطبيق:

```typescript
// app/app/layout.tsx
import { validateEnv } from "@/lib/env-validator";

// Validate environment variables on startup
if (typeof window === "undefined") {
  validateEnv();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <html>{children}</html>;
}
```

---

## 10. Error Messages Standardization

### إنشاء Error Messages Manager:

```typescript
// app/lib/error-messages.ts
export function getAuthErrorMessage(
  error: any,
  lang: "ar" | "en" = "ar"
): string {
  // Generic error message for all auth failures
  // Don't reveal if email exists or password is wrong
  const genericError =
    lang === "ar"
      ? "فشل تسجيل الدخول. يرجى التحقق من بياناتك والمحاولة مرة أخرى."
      : "Login failed. Please check your credentials and try again.";

  // Only show generic errors to users
  // Log actual errors for debugging
  console.error("Auth error details:", error);

  return genericError;
}

export function getSignupErrorMessage(
  error: any,
  lang: "ar" | "en" = "ar"
): string {
  // Check for specific known errors that are safe to show
  if (error?.code === "weak_password") {
    return lang === "ar" ? "كلمة المرور ضعيفة" : "Password is too weak";
  }

  // Generic error for everything else
  return lang === "ar"
    ? "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى."
    : "Failed to create account. Please try again.";
}
```

---

## خلاصة

هذه الأمثلة توفر حلول جاهزة للتطبيق لمعظم الثغرات الأمنية المذكورة في التقرير. يُنصح بتطبيقها بالترتيب حسب الأولوية المذكورة في التقرير الرئيسي.

### خطوات التطبيق الموصى بها:

1. ✅ نسخ الأمثلة المطلوبة
2. ✅ تعديلها حسب احتياجاتك
3. ✅ اختبارها في بيئة التطوير
4. ✅ مراجعة الكود
5. ✅ النشر تدريجياً
6. ✅ المراقبة والتحسين

**ملاحظة:** بعض الحلول (مثل Rate Limiting) تحتاج إلى حلول أفضل في الإنتاج مثل استخدام Redis أو خدمات مخصصة.
