# خطة العمل التنفيذية لتأمين نظام المصادقة

# Authentication Security Action Plan

## 📋 نظرة عامة

هذه خطة عمل تفصيلية لتطبيق الإصلاحات الأمنية على نظام المصادقة. الخطة مقسمة إلى 3 مراحل حسب الأولوية.

---

## 🔴 المرحلة 1: الإصلاحات العاجلة (أسبوع 1-2)

### ⏰ الوقت المقدر: 5-7 أيام عمل

### 🎯 الهدف: سد الثغرات الحرجة قبل الإنتاج

---

### اليوم 1-2: إصلاح Cookies Security

#### ✅ المهام:

1. **تحديث supabase.ts لإضافة Secure و HttpOnly**

   - [ ] فتح ملف `app/services/supabase.ts`
   - [ ] تعديل دالة `set` لإضافة الـ flags
   - [ ] إضافة فحص للبيئة (production/development)
   - [ ] تغيير SameSite من Lax إلى Strict
   - [ ] تقليل maxAge من سنة إلى أسبوع

   ```typescript
   // التغييرات المطلوبة:
   const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
   const sameSite = "; SameSite=Strict";
   const maxAge = options.maxAge || 604800; // 7 days
   ```

2. **اختبار التغييرات**
   - [ ] اختبار تسجيل الدخول في development
   - [ ] اختبار تسجيل الدخول في production simulation
   - [ ] التحقق من الـ cookies في Developer Tools
   - [ ] اختبار الـ logout

#### 📝 الملفات المطلوب تعديلها:

- `app/services/supabase.ts`

#### ⚠️ نقاط مهمة:

- احفظ نسخة احتياطية قبل التعديل
- اختبر في بيئة staging أولاً
- تأكد من عدم كسر الجلسات الحالية

---

### اليوم 2-3: إضافة Rate Limiting

#### ✅ المهام:

1. **إنشاء Rate Limiter**

   - [ ] إنشاء ملف `app/lib/rate-limiter.ts`
   - [ ] نسخ الكود من `AUTHENTICATION_FIXES_EXAMPLES.md`
   - [ ] تعديل الإعدادات حسب الحاجة

2. **دمج Rate Limiter في Middleware**

   - [ ] فتح `app/middleware.ts`
   - [ ] إضافة import للـ rate limiter
   - [ ] إضافة فحص للـ auth routes
   - [ ] إضافة response للـ 429 status

3. **إضافة Rate Limiting للـ API Routes** (إن وجد)
   - [ ] فحص جميع API routes للمصادقة
   - [ ] إضافة rate limiting لكل endpoint

#### 📝 الملفات المطلوب إنشاؤها/تعديلها:

- `app/lib/rate-limiter.ts` (جديد)
- `app/middleware.ts` (تعديل)

#### 🔧 الإعدادات الموصى بها:

```typescript
{
  signin: { interval: 60000, maxRequests: 5 },      // 5 attempts/minute
  signup: { interval: 300000, maxRequests: 3 },     // 3 attempts/5 minutes
  forgotPassword: { interval: 600000, maxRequests: 2 } // 2 attempts/10 minutes
}
```

---

### اليوم 3-4: Backend Password Validation

#### ✅ المهام:

1. **إنشاء Password Validator**

   - [ ] إنشاء ملف `app/lib/password-validator.ts`
   - [ ] نسخ الكود من الأمثلة
   - [ ] تخصيص قواعد التحقق
   - [ ] إضافة قائمة بكلمات المرور الشائعة

2. **إنشاء API Route للـ Signup**

   - [ ] إنشاء `app/api/auth/signup/route.ts`
   - [ ] إضافة validation قبل التسجيل
   - [ ] إضافة error handling

3. **تحديث Frontend للاستخدام الـ API**
   - [ ] تعديل `signup-form.tsx` لاستدعاء الـ API
   - [ ] التعامل مع الأخطاء الجديدة

#### 📝 الملفات المطلوب إنشاؤها/تعديلها:

- `app/lib/password-validator.ts` (جديد)
- `app/api/auth/signup/route.ts` (جديد)
- `app/components/auth/signup-form.tsx` (تعديل)

#### 🎨 معايير كلمة المرور:

- ✅ 8 أحرف كحد أدنى
- ✅ 128 حرف كحد أقصى (منع DoS)
- ✅ حرف كبير واحد على الأقل
- ✅ حرف صغير واحد على الأقل
- ✅ رقم واحد على الأقل
- ✅ حرف خاص واحد على الأقل
- ✅ ليست من كلمات المرور الشائعة

---

### اليوم 4-5: Session Timeout & Account Lockout

#### ✅ المهام:

1. **تقليل Session Timeout**

   - [ ] تحديث maxAge في جميع الأماكن
   - [ ] تطبيق timeout = 7 أيام
   - [ ] اختبار انتهاء الصلاحية

2. **إنشاء Account Lockout System**

   - [ ] إنشاء `app/lib/account-lockout.ts`
   - [ ] دمجه في signin-form
   - [ ] إضافة رسائل واضحة للمستخدم

3. **إنشاء Session Monitor Hook**
   - [ ] إنشاء `app/hooks/use-session-timeout.ts`
   - [ ] دمجه في Layout
   - [ ] اختبار idle timeout

#### 📝 الملفات المطلوب إنشاؤها/تعديلها:

- `app/lib/account-lockout.ts` (جديد)
- `app/hooks/use-session-timeout.ts` (جديد)
- `app/components/auth/signin-form.tsx` (تعديل)
- `app/app/[lang]/layout.tsx` (تعديل)

#### ⚙️ الإعدادات:

```typescript
SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days
IDLE_TIMEOUT: 30 * 60 * 1000,              // 30 minutes
MAX_FAILED_ATTEMPTS: 5,                     // 5 attempts
LOCKOUT_DURATION: 15 * 60 * 1000,          // 15 minutes
```

---

### اليوم 5-7: CSRF Enhancement & Testing

#### ✅ المهام:

1. **تحسين CSRF Protection**

   - [ ] تغيير SameSite إلى Strict في جميع الأماكن
   - [ ] التحقق من التوافق مع OAuth (إن وجد)
   - [ ] اختبار cross-origin requests

2. **اختبار شامل**

   - [ ] اختبار جميع سيناريوهات التسجيل
   - [ ] اختبار Rate Limiting
   - [ ] اختبار Account Lockout
   - [ ] اختبار Session Timeout
   - [ ] اختبار Cookies Security

3. **مراجعة الكود**
   - [ ] مراجعة جميع التغييرات
   - [ ] التأكد من عدم وجود regression
   - [ ] فحص Performance

#### 📋 Checklist النهائي للمرحلة 1:

- [ ] جميع الـ cookies تحتوي على Secure في production
- [ ] جميع الـ cookies تحتوي على HttpOnly
- [ ] SameSite = Strict في كل مكان
- [ ] Rate limiting يعمل على جميع auth routes
- [ ] Backend password validation فعّال
- [ ] Account lockout يعمل بشكل صحيح
- [ ] Session timeout محدد بـ 7 أيام
- [ ] Idle timeout يعمل (30 دقيقة)
- [ ] جميع الاختبارات تمر بنجاح

---

## 🟡 المرحلة 2: التحسينات المهمة (أسبوع 3-4)

### ⏰ الوقت المقدر: 8-10 أيام عمل

### 🎯 الهدف: تعزيز الأمان وتحسين تجربة المستخدم

---

### اليوم 8-10: Security Logging System

#### ✅ المهام:

1. **إنشاء Security Logger**

   - [ ] إنشاء `app/lib/security-logger.ts`
   - [ ] تحديد أنواع الأحداث المطلوب تسجيلها
   - [ ] إضافة دوال helper

2. **إنشاء جدول Security Logs**

   - [ ] كتابة SQL schema
   - [ ] إنشاء الجدول في Supabase
   - [ ] إضافة RLS policies
   - [ ] إنشاء indexes

3. **دمج Logger في النظام**
   - [ ] إضافة logging لـ signin
   - [ ] إضافة logging لـ signup
   - [ ] إضافة logging لـ logout
   - [ ] إضافة logging لـ password reset
   - [ ] إضافة logging لـ failed attempts

#### 📝 الملفات المطلوب إنشاؤها:

- `app/lib/security-logger.ts`
- `app/database/security_logs.sql`

#### 📊 الأحداث المطلوب تسجيلها:

```typescript
enum SecurityEvent {
  LOGIN_SUCCESS,
  LOGIN_FAILED,
  LOGOUT,
  SIGNUP_SUCCESS,
  SIGNUP_FAILED,
  PASSWORD_RESET_REQUEST,
  PASSWORD_RESET_SUCCESS,
  PASSWORD_RESET_FAILED,
  ACCOUNT_LOCKED,
  SUSPICIOUS_ACTIVITY,
  SESSION_EXPIRED,
}
```

---

### اليوم 10-12: Input Sanitization

#### ✅ المهام:

1. **إنشاء Input Sanitizers**

   - [ ] إنشاء `app/lib/input-sanitizer.ts`
   - [ ] إضافة sanitizers لكل نوع input
   - [ ] إضافة XSS protection

2. **دمج Sanitization**

   - [ ] تطبيقه على signin form
   - [ ] تطبيقه على signup form
   - [ ] تطبيقه على forgot password form
   - [ ] تطبيقه على reset password form
   - [ ] تطبيقه على profile forms

3. **اختبار Sanitization**
   - [ ] اختبار مع XSS payloads
   - [ ] اختبار مع SQL injection patterns
   - [ ] اختبار مع control characters

#### 📝 الملفات المطلوب إنشاؤها/تعديلها:

- `app/lib/input-sanitizer.ts` (جديد)
- جميع form components (تعديل)

---

### اليوم 12-14: Phone Verification (Optional)

#### ✅ المهام:

1. **إعداد SMS Service**

   - [ ] اختيار خدمة SMS (Twilio, AWS SNS, etc.)
   - [ ] إعداد API keys
   - [ ] إنشاء templates للرسائل

2. **إنشاء OTP System**

   - [ ] إنشاء `app/lib/otp-manager.ts`
   - [ ] إنشاء جدول OTP codes
   - [ ] إضافة expiry mechanism

3. **دمج OTP في Signup**
   - [ ] إضافة خطوة OTP verification
   - [ ] إنشاء UI للـ OTP input
   - [ ] إضافة resend mechanism

#### 📝 الملفات المطلوب إنشاؤها:

- `app/lib/otp-manager.ts`
- `app/components/auth/otp-verification.tsx`
- `app/database/otp_codes.sql`

---

### اليوم 14-15: Error Messages Standardization

#### ✅ المهام:

1. **إنشاء Error Messages Manager**

   - [ ] إنشاء `app/lib/error-messages.ts`
   - [ ] تحديد رسائل موحدة
   - [ ] إضافة دعم للغات متعددة

2. **تطبيق Error Messages**
   - [ ] تحديث جميع auth forms
   - [ ] إزالة الرسائل التي تكشف معلومات
   - [ ] اختبار جميع حالات الخطأ

#### 📝 الملفات المطلوب إنشاؤها:

- `app/lib/error-messages.ts`

---

### اليوم 16-17: Environment Variables Validation

#### ✅ المهام:

1. **إنشاء Env Validator**

   - [ ] إنشاء `app/lib/env-validator.ts`
   - [ ] إضافة فحص لجميع المتغيرات المطلوبة
   - [ ] إضافة format validation

2. **دمج Validator**
   - [ ] إضافته في Layout
   - [ ] إضافة error handling
   - [ ] إضافة logs واضحة

#### 📝 الملفات المطلوب إنشاؤها:

- `app/lib/env-validator.ts`

---

## 🟢 المرحلة 3: المحسّنات (أسبوع 5-6)

### ⏰ الوقت المقدر: 5-7 أيام عمل

### 🎯 الهدف: تحسينات إضافية وتجربة مستخدم أفضل

---

### اليوم 18-20: Multi-Factor Authentication (MFA)

#### ✅ المهام:

1. **إعداد Supabase MFA**

   - [ ] تفعيل MFA في Supabase
   - [ ] قراءة documentation
   - [ ] إعداد الإعدادات

2. **إنشاء MFA UI**

   - [ ] صفحة إعداد MFA
   - [ ] QR code component
   - [ ] TOTP input component
   - [ ] صفحة إدارة recovery codes

3. **دمج MFA في Flow**
   - [ ] إضافة خطوة MFA في signin
   - [ ] إضافة optional MFA في signup
   - [ ] اختبار كامل الـ flow

#### 📝 الملفات المطلوب إنشاؤها:

- `app/app/[lang]/profile/security/page.tsx`
- `app/components/auth/mfa-setup.tsx`
- `app/components/auth/mfa-verify.tsx`

---

### اليوم 20-22: Session Monitoring Dashboard

#### ✅ المهام:

1. **إنشاء Sessions Table**

   - [ ] schema للجلسات النشطة
   - [ ] إضافة device info
   - [ ] إضافة location info (optional)

2. **إنشاء Sessions UI**

   - [ ] صفحة عرض الجلسات
   - [ ] زر logout من جلسة معينة
   - [ ] زر logout من جميع الجلسات

3. **Session Notifications**
   - [ ] تنبيه عند دخول من جهاز جديد
   - [ ] email notification
   - [ ] in-app notification

#### 📝 الملفات المطلوب إنشاؤها:

- `app/app/[lang]/profile/sessions/page.tsx`
- `app/components/profile/sessions-list.tsx`
- `app/database/user_sessions.sql`

---

### اليوم 22-24: Password History & Policy

#### ✅ المهام:

1. **إنشاء Password History**

   - [ ] schema لحفظ password hashes
   - [ ] إضافة check عند reset
   - [ ] حفظ آخر 5 كلمات مرور

2. **Password Expiry Policy** (optional)
   - [ ] إضافة password_expires_at
   - [ ] تنبيهات قبل الانتهاء
   - [ ] إجبار التغيير عند الانتهاء

#### 📝 الملفات المطلوب إنشاؤها:

- `app/database/password_history.sql`
- `app/lib/password-history.ts`

---

### اليوم 24-25: Performance Optimization

#### ✅ المهام:

1. **Caching Strategy**

   - [ ] إضافة React Query
   - [ ] cache للـ profile data
   - [ ] optimistic updates

2. **Error Boundaries**

   - [ ] إنشاء Auth Error Boundary
   - [ ] fallback UI
   - [ ] error reporting

3. **Loading States**
   - [ ] skeleton screens
   - [ ] unified loading components
   - [ ] better UX

#### 📝 الملفات المطلوب إنشاؤها:

- `app/components/error-boundary.tsx`
- `app/components/loading-skeleton.tsx`

---

## 📊 متابعة التقدم

### Checklist العام:

#### المرحلة 1 (عاجل):

- [ ] Cookies Security ✅
- [ ] Rate Limiting ✅
- [ ] Backend Password Validation ✅
- [ ] Session Timeout ✅
- [ ] Account Lockout ✅
- [ ] CSRF Enhancement ✅

#### المرحلة 2 (مهم):

- [ ] Security Logging ⏳
- [ ] Input Sanitization ⏳
- [ ] Phone Verification ⏳
- [ ] Error Messages ⏳
- [ ] Env Validation ⏳

#### المرحلة 3 (محسّنات):

- [ ] MFA ⏳
- [ ] Session Monitoring ⏳
- [ ] Password History ⏳
- [ ] Performance ⏳

---

## 🧪 خطة الاختبار

### اختبارات المرحلة 1:

```bash
# Security Tests
✓ Test XSS attacks prevention
✓ Test SQL injection prevention
✓ Test CSRF attacks prevention
✓ Test brute force attempts
✓ Test session hijacking prevention
✓ Test cookie security flags

# Functional Tests
✓ Test normal signin flow
✓ Test normal signup flow
✓ Test password reset flow
✓ Test logout functionality
✓ Test rate limiting
✓ Test account lockout
✓ Test session timeout
```

### اختبارات المرحلة 2:

```bash
# Security Tests
✓ Test security logging
✓ Test input sanitization
✓ Test phone verification
✓ Test OTP expiry

# Functional Tests
✓ Test error messages
✓ Test environment validation
```

### اختبارات المرحلة 3:

```bash
# Security Tests
✓ Test MFA setup
✓ Test MFA verification
✓ Test session monitoring
✓ Test password history

# Performance Tests
✓ Load testing
✓ Stress testing
✓ Cache effectiveness
```

---

## 📝 Documentation Requirements

### يجب توثيق:

- [ ] جميع الإعدادات الأمنية
- [ ] Rate limiting policies
- [ ] Session management
- [ ] Error handling
- [ ] API endpoints
- [ ] Database schema changes
- [ ] Environment variables

---

## 🚀 Deployment Checklist

### قبل النشر:

- [ ] جميع الاختبارات تمر بنجاح
- [ ] Code review مكتمل
- [ ] Documentation محدّث
- [ ] Environment variables محددة
- [ ] Backups جاهزة
- [ ] Rollback plan موجود
- [ ] Monitoring معدّ
- [ ] Alerts معدّة

### بعد النشر:

- [ ] مراقبة الـ logs
- [ ] مراقبة الأداء
- [ ] مراقبة الأخطاء
- [ ] جمع feedback من المستخدمين

---

## 📞 جهات الاتصال

### في حالة المشاكل:

- **Security Issues:** [security@yourcompany.com]
- **Technical Support:** [support@yourcompany.com]
- **Emergency:** [emergency@yourcompany.com]

---

## 📚 مراجع إضافية

1. [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
2. [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
3. [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/authentication)
4. [Web Security Academy](https://portswigger.net/web-security)

---

**آخر تحديث:** 12 أكتوبر 2025
**النسخة:** 1.0
**الحالة:** جاهز للتنفيذ ✅
