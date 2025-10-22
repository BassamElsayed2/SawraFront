import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Deletion Request | طلب حذف البيانات",
  description: "Request deletion of your data from El Sawra Restaurant App",
};

const translations = {
  ar: {
    title: "طلب حذف البيانات",
    intro:
      "نحترم حقك في التحكم في بياناتك الشخصية. يمكنك طلب حذف جميع بياناتك المرتبطة بحسابك في أي وقت.",
    methods: {
      title: "طرق حذف بياناتك",
      method1: {
        title: "1. من داخل التطبيق",
        steps: [
          "قم بتسجيل الدخول إلى حسابك",
          "اذهب إلى الإعدادات → حسابي",
          'اضغط على "حذف الحساب"',
          "أكد طلب الحذف",
        ],
      },
      method2: {
        title: "2. عبر البريد الإلكتروني",
        description: "أرسل بريداً إلكترونياً إلى:",
        email: "privacy@elsawra.com",
        subject: "الموضوع: طلب حذف البيانات",
        body: "في البريد، يرجى تضمين:",
        requirements: [
          "عنوان البريد الإلكتروني المرتبط بحسابك",
          "رقم هاتفك (إن وجد)",
          "سبب طلب الحذف (اختياري)",
        ],
      },
      method3: {
        title: "3. لمستخدمي Facebook",
        description:
          "إذا سجلت الدخول عبر Facebook، يمكنك إلغاء ربط التطبيق من:",
        link: "إعدادات Facebook → التطبيقات والمواقع الإلكترونية → El Sawra",
        note: "ملاحظة: هذا سيلغي ربط التطبيق فقط، ولن يحذف بياناتك من خوادمنا. لحذف البيانات بالكامل، استخدم الطريقة 1 أو 2.",
      },
    },
    whatDeleted: {
      title: "ما الذي سيتم حذفه؟",
      items: [
        "معلومات حسابك (الاسم، البريد الإلكتروني، رقم الهاتف)",
        "عناوينك المحفوظة",
        "سجل طلباتك",
        "تفضيلاتك وإعداداتك",
        "نقاطك والعروض المرتبطة بحسابك",
        "أي بيانات أخرى مرتبطة بحسابك",
      ],
    },
    whatKept: {
      title: "ما الذي سيتم الاحتفاظ به؟",
      description:
        "قد نحتفظ ببعض المعلومات المحدودة للأغراض القانونية والمحاسبية:",
      items: [
        "سجلات المعاملات المالية (مطلوبة بموجب القانون)",
        "البيانات المجهولة للتحليلات",
        "البيانات المطلوبة لحل النزاعات القانونية المعلقة",
      ],
    },
    timeline: {
      title: "الجدول الزمني",
      steps: [
        "سنؤكد استلام طلبك خلال 24 ساعة",
        "سيتم معالجة الطلب خلال 30 يوماً كحد أقصى",
        "ستتلقى تأكيداً عند اكتمال عملية الحذف",
        "بعد الحذف، لن تتمكن من استرداد حسابك أو بياناتك",
      ],
    },
    warning: {
      title: "⚠️ تحذير مهم",
      message:
        "حذف البيانات نهائي ولا يمكن التراجع عنه. ستفقد جميع طلباتك السابقة، النقاط، والعروض الخاصة. تأكد من أنك تريد المتابعة قبل تأكيد الحذف.",
    },
    alternatives: {
      title: "بدائل أخرى",
      description: "إذا كنت غير متأكد من حذف حسابك بالكامل، يمكنك:",
      items: [
        "تعطيل الإشعارات من إعدادات التطبيق",
        "إلغاء الاشتراك من رسائل التسويق",
        "تحديث معلوماتك الشخصية",
        "تعليق حسابك مؤقتاً (اتصل بخدمة العملاء)",
      ],
    },
    contact: {
      title: "تحتاج مساعدة؟",
      description: "إذا كان لديك أي أسئلة حول حذف البيانات:",
      email: "البريد الإلكتروني: privacy@elsawra.com",
      phone: "الهاتف: +20 123 456 7890",
      hours: "ساعات العمل: 9:00 ص - 11:00 م يومياً",
    },
  },
  en: {
    title: "Data Deletion Request",
    intro:
      "We respect your right to control your personal data. You can request deletion of all your data associated with your account at any time.",
    methods: {
      title: "How to Delete Your Data",
      method1: {
        title: "1. From Within the App",
        steps: [
          "Log in to your account",
          "Go to Settings → My Account",
          'Click on "Delete Account"',
          "Confirm the deletion request",
        ],
      },
      method2: {
        title: "2. Via Email",
        description: "Send an email to:",
        email: "privacy@elsawra.com",
        subject: "Subject: Data Deletion Request",
        body: "In your email, please include:",
        requirements: [
          "The email address associated with your account",
          "Your phone number (if applicable)",
          "Reason for deletion request (optional)",
        ],
      },
      method3: {
        title: "3. For Facebook Users",
        description:
          "If you logged in via Facebook, you can unlink the app from:",
        link: "Facebook Settings → Apps and Websites → El Sawra",
        note: "Note: This will only unlink the app and will not delete your data from our servers. To completely delete your data, use Method 1 or 2.",
      },
    },
    whatDeleted: {
      title: "What Will Be Deleted?",
      items: [
        "Your account information (name, email, phone number)",
        "Your saved addresses",
        "Your order history",
        "Your preferences and settings",
        "Your points and associated offers",
        "Any other data linked to your account",
      ],
    },
    whatKept: {
      title: "What Will Be Kept?",
      description:
        "We may retain some limited information for legal and accounting purposes:",
      items: [
        "Financial transaction records (required by law)",
        "Anonymized data for analytics",
        "Data required to resolve pending legal disputes",
      ],
    },
    timeline: {
      title: "Timeline",
      steps: [
        "We will confirm receipt of your request within 24 hours",
        "The request will be processed within a maximum of 30 days",
        "You will receive confirmation when the deletion is complete",
        "After deletion, you will not be able to recover your account or data",
      ],
    },
    warning: {
      title: "⚠️ Important Warning",
      message:
        "Data deletion is permanent and irreversible. You will lose all your previous orders, points, and special offers. Make sure you want to proceed before confirming deletion.",
    },
    alternatives: {
      title: "Other Alternatives",
      description:
        "If you're unsure about deleting your account completely, you can:",
      items: [
        "Disable notifications from app settings",
        "Unsubscribe from marketing emails",
        "Update your personal information",
        "Temporarily suspend your account (contact customer service)",
      ],
    },
    contact: {
      title: "Need Help?",
      description: "If you have any questions about data deletion:",
      email: "Email: privacy@elsawra.com",
      phone: "Phone: +20 123 456 7890",
      hours: "Business Hours: 9:00 AM - 11:00 PM Daily",
    },
  },
};

export default function DataDeletionPage({
  params,
}: {
  params: { lang: string };
}) {
  const isArabic = params.lang === "ar";
  const t = isArabic ? translations.ar : translations.en;

  return (
    <div
      className={`min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${
        isArabic ? "rtl" : "ltr"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
          <p className="text-lg text-gray-700 leading-relaxed">{t.intro}</p>
        </div>

        {/* Methods */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {t.methods.title}
          </h2>

          {/* Method 1 */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t.methods.method1.title}
            </h3>
            <ol className="space-y-2">
              {t.methods.method1.steps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 font-semibold mr-2">
                    {index + 1}.
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Method 2 */}
          <div className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t.methods.method2.title}
            </h3>
            <p className="text-gray-700 mb-2">
              {t.methods.method2.description}
            </p>
            <p className="text-lg font-semibold text-green-700 mb-4">
              {t.methods.method2.email}
            </p>
            <p className="text-gray-700 font-medium mb-2">
              {t.methods.method2.subject}
            </p>
            <p className="text-gray-700 mb-2">{t.methods.method2.body}</p>
            <ul className="space-y-2 mt-3">
              {t.methods.method2.requirements.map((req, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Method 3 */}
          <div className="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t.methods.method3.title}
            </h3>
            <p className="text-gray-700 mb-2">
              {t.methods.method3.description}
            </p>
            <p className="text-purple-700 font-medium mb-4">
              {t.methods.method3.link}
            </p>
            <div className="bg-yellow-50 border border-yellow-300 rounded p-4">
              <p className="text-sm text-gray-700">{t.methods.method3.note}</p>
            </div>
          </div>
        </section>

        {/* What Will Be Deleted */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t.whatDeleted.title}
          </h2>
          <ul className="space-y-3">
            {t.whatDeleted.items.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2 text-xl">✗</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* What Will Be Kept */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t.whatKept.title}
          </h2>
          <p className="text-gray-700 mb-4">{t.whatKept.description}</p>
          <ul className="space-y-3">
            {t.whatKept.items.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2 text-xl">ℹ</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Timeline */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t.timeline.title}
          </h2>
          <ol className="space-y-4">
            {t.timeline.steps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3 font-semibold">
                  {index + 1}
                </span>
                <span className="text-gray-700 mt-1">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Warning */}
        <section className="mb-12">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
            <h2 className="text-xl font-semibold text-red-800 mb-3">
              {t.warning.title}
            </h2>
            <p className="text-gray-700">{t.warning.message}</p>
          </div>
        </section>

        {/* Alternatives */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t.alternatives.title}
          </h2>
          <p className="text-gray-700 mb-4">{t.alternatives.description}</p>
          <ul className="space-y-3">
            {t.alternatives.items.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2 text-xl">✓</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Contact */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t.contact.title}
          </h2>
          <p className="text-gray-700 mb-4">{t.contact.description}</p>
          <div className="space-y-2 text-gray-700">
            <p>{t.contact.email}</p>
            <p>{t.contact.phone}</p>
            <p>{t.contact.hours}</p>
          </div>
        </section>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link
              href={`/${params.lang}/privacy-policy`}
              className="text-primary hover:underline"
            >
              {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              href={`/${params.lang}/terms-of-service`}
              className="text-primary hover:underline"
            >
              {isArabic ? "شروط الخدمة" : "Terms of Service"}
            </Link>
          </div>
          <p className="text-sm text-gray-600 text-center mt-6">
            {isArabic
              ? "© 2024 مطعم الصورة. جميع الحقوق محفوظة."
              : "© 2024 El Sawra Restaurant. All rights reserved."}
          </p>
        </div>
      </div>
    </div>
  );
}
