# تحديث أمان التطبيق - فصل صلاحيات المستخدمين والإداريين

## المشكلة

كان من الممكن للمستخدمين الإداريين (من لوحة التحكم) تسجيل الدخول في التطبيق العادي باستخدام نفس بيانات الاعتماد، مما يشكل ثغرة أمنية.

## الحل

تم إضافة آلية للتحقق من نوع المستخدم ومنع المستخدمين الإداريين من الوصول إلى التطبيق العادي.

## التغييرات التي تم إجراؤها

### 1. تحديث `app/contexts/auth-context.tsx`

- إضافة فحص في دالة `signIn` للتحقق من أن المستخدم ليس موجوداً في جدول `admin_profiles`
- إذا كان المستخدم admin، يتم تسجيل خروجه فوراً وإرجاع رسالة خطأ واضحة

```typescript
// ✅ التحقق من أن المستخدم ليس admin
if (data.user) {
  const { data: adminProfile } = await supabase
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  // ❌ إذا المستخدم موجود في admin_profiles، منعه من الدخول
  if (adminProfile) {
    await supabase.auth.signOut();
    return {
      error: {
        message: "هذا الحساب مخصص للإدارة. يرجى استخدام لوحة التحكم للدخول.",
      },
    };
  }
}
```

### 2. تحديث `app/middleware.ts`

- إضافة فحص في middleware لصفحات الملف الشخصي (profile)
- التحقق من أن المستخدم المسجل حالياً ليس admin
- إعادة توجيه المستخدمين الإداريين إلى صفحة تسجيل الدخول مع رسالة خطأ

```typescript
// التحقق من أن المستخدم ليس admin
const supabase = createMiddlewareClient({ req: request, res: response });
const {
  data: { session },
} = await supabase.auth.getSession();

if (session?.user) {
  const { data: adminProfile } = await supabase
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  // إذا المستخدم admin، قم بتسجيل خروجه وإعادة توجيهه
  if (adminProfile) {
    await supabase.auth.signOut();
    const locale = pathname.split("/")[1] || defaultLocale;
    return NextResponse.redirect(
      new URL(`/${locale}/auth/signin?error=admin-account`, request.url)
    );
  }
}
```

### 3. تحديث `app/components/auth/signin-form.tsx`

- إضافة معالجة خاصة لرسائل الخطأ الخاصة بحسابات الإدارة
- عرض رسالة واضحة باللغتين العربية والإنجليزية
- معالجة معامل الخطأ من URL (`?error=admin-account`)

```typescript
// التحقق من رسالة الخطأ الخاصة بحسابات الإدارة
const isAdminAccount =
  error.message?.includes("مخصص للإدارة") || error.message?.includes("admin");

const errorMsg = isAdminAccount
  ? lang === "ar"
    ? "هذا الحساب مخصص للإدارة. يرجى استخدام لوحة التحكم للدخول."
    : "This account is for admin use. Please use the dashboard to sign in."
  : lang === "ar"
  ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
  : "Invalid email or password";
```

## النتيجة

الآن:

- ✅ المستخدمون العاديون يمكنهم فقط الدخول إلى التطبيق العادي
- ✅ المستخدمون الإداريون يمكنهم فقط الدخول إلى لوحة التحكم (dashboard)
- ✅ رسائل خطأ واضحة ومفهومة باللغتين
- ✅ حماية على مستوى:
  - Context (auth-context.tsx)
  - Middleware (middleware.ts)
  - UI (signin-form.tsx)

## متطلبات قاعدة البيانات

تأكد من وجود جدول `admin_profiles` في قاعدة البيانات مع الحقول التالية:

- `user_id` (UUID, Primary Key, Foreign Key إلى auth.users)
- حقول أخرى حسب الحاجة

## الاختبار

1. جرب تسجيل الدخول بحساب admin في التطبيق العادي - يجب أن يتم رفض الدخول
2. جرب تسجيل الدخول بحساب مستخدم عادي في التطبيق - يجب أن ينجح
3. جرب تسجيل الدخول بحساب admin في لوحة التحكم - يجب أن ينجح
4. جرب تسجيل الدخول بحساب مستخدم عادي في لوحة التحكم - يجب أن يتم رفض الدخول
