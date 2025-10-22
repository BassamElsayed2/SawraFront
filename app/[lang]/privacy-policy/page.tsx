import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | سياسة الخصوصية",
  description: "Privacy Policy for El Sawra Restaurant App",
};

const translations = {
  ar: {
    title: "سياسة الخصوصية",
    lastUpdated: "آخر تحديث",
    intro: {
      title: "مقدمة",
      content:
        "نحن في مطعم الصورة نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك عند استخدام تطبيقنا.",
    },
    sections: [
      {
        title: "المعلومات التي نجمعها",
        content: [
          "معلومات الحساب: الاسم، البريد الإلكتروني، رقم الهاتف",
          "معلومات الطلبات: تاريخ الطلبات، العناوين، تفضيلات الطعام",
          "معلومات الدفع: نستخدم بوابات دفع آمنة ولا نخزن معلومات البطاقات الائتمانية",
          "معلومات الموقع: لتحديد أقرب فرع وتقدير وقت التوصيل",
        ],
      },
      {
        title: "كيف نستخدم معلوماتك",
        content: [
          "معالجة وتوصيل طلباتك",
          "التواصل معك بخصوص طلباتك",
          "تحسين خدماتنا وتجربة المستخدم",
          "إرسال العروض والتحديثات (يمكنك إلغاء الاشتراك في أي وقت)",
          "ضمان أمان وحماية التطبيق",
        ],
      },
      {
        title: "تسجيل الدخول عبر الوسائط الاجتماعية",
        content: [
          "نقدم خيار تسجيل الدخول عبر Google و Facebook",
          "عند استخدام هذه الخدمات، نحصل فقط على: الاسم، البريد الإلكتروني، والصورة الشخصية",
          "لا نحصل على كلمة المرور الخاصة بك",
          "يمكنك إلغاء ربط حسابك في أي وقت من إعدادات حسابك",
        ],
      },
      {
        title: "مشاركة المعلومات",
        content: [
          "لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة",
          "قد نشارك المعلومات مع مزودي الخدمات الموثوقين (مثل خدمات التوصيل والدفع)",
          "قد نفصح عن المعلومات إذا كان ذلك مطلوباً قانونياً",
        ],
      },
      {
        title: "أمان البيانات",
        content: [
          "نستخدم تقنيات تشفير SSL/TLS لحماية نقل البيانات",
          "نحتفظ ببياناتك على خوادم آمنة",
          "نحد من الوصول إلى معلوماتك للموظفين المصرح لهم فقط",
          "نراجع إجراءاتنا الأمنية بانتظام",
        ],
      },
      {
        title: "حقوقك",
        content: [
          "الوصول إلى بياناتك الشخصية ومراجعتها",
          "تحديث أو تصحيح معلوماتك",
          "حذف حسابك وبياناتك",
          "الاعتراض على معالجة بياناتك",
          "طلب نسخة من بياناتك",
        ],
      },
      {
        title: "ملفات تعريف الارتباط (Cookies)",
        content: [
          "نستخدم ملفات تعريف الارتباط لتحسين تجربتك",
          "تساعدنا في تذكر تفضيلاتك وإعدادات اللغة",
          "يمكنك تعطيل ملفات تعريف الارتباط من إعدادات المتصفح",
        ],
      },
      {
        title: "خصوصية الأطفال",
        content: [
          "خدماتنا غير موجهة للأطفال دون سن 13 عاماً",
          "لا نجمع عن قصد معلومات من الأطفال",
          "إذا علمنا بجمع بيانات طفل، سنحذفها فوراً",
        ],
      },
      {
        title: "التغييرات على سياسة الخصوصية",
        content: [
          "قد نحدث هذه السياسة من وقت لآخر",
          "سننشر أي تغييرات على هذه الصفحة",
          "سنخطرك بالتغييرات المهمة عبر البريد الإلكتروني",
        ],
      },
    ],
    contact: {
      title: "اتصل بنا",
      content:
        "إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا:",
      email: "البريد الإلكتروني: privacy@elsawra.com",
      phone: "الهاتف: +20 123 456 7890",
    },
  },
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last Updated",
    intro: {
      title: "Introduction",
      content:
        "At El Sawra Restaurant, we respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information when you use our application.",
    },
    sections: [
      {
        title: "Information We Collect",
        content: [
          "Account Information: Name, email address, phone number",
          "Order Information: Order history, addresses, food preferences",
          "Payment Information: We use secure payment gateways and do not store credit card details",
          "Location Information: To determine the nearest branch and estimate delivery time",
        ],
      },
      {
        title: "How We Use Your Information",
        content: [
          "Process and deliver your orders",
          "Communicate with you about your orders",
          "Improve our services and user experience",
          "Send offers and updates (you can unsubscribe at any time)",
          "Ensure security and protect the application",
        ],
      },
      {
        title: "Social Media Login",
        content: [
          "We offer login options via Google and Facebook",
          "When using these services, we only receive: Name, email, and profile picture",
          "We do not receive your password",
          "You can unlink your account at any time from your account settings",
        ],
      },
      {
        title: "Information Sharing",
        content: [
          "We do not sell or rent your personal information to third parties",
          "We may share information with trusted service providers (such as delivery and payment services)",
          "We may disclose information if legally required",
        ],
      },
      {
        title: "Data Security",
        content: [
          "We use SSL/TLS encryption to protect data transmission",
          "We store your data on secure servers",
          "We limit access to your information to authorized personnel only",
          "We regularly review our security procedures",
        ],
      },
      {
        title: "Your Rights",
        content: [
          "Access and review your personal data",
          "Update or correct your information",
          "Delete your account and data",
          "Object to data processing",
          "Request a copy of your data",
        ],
      },
      {
        title: "Cookies",
        content: [
          "We use cookies to enhance your experience",
          "They help us remember your preferences and language settings",
          "You can disable cookies from your browser settings",
        ],
      },
      {
        title: "Children's Privacy",
        content: [
          "Our services are not directed to children under 13 years of age",
          "We do not knowingly collect information from children",
          "If we learn of collecting a child's data, we will delete it immediately",
        ],
      },
      {
        title: "Changes to Privacy Policy",
        content: [
          "We may update this policy from time to time",
          "We will post any changes on this page",
          "We will notify you of significant changes via email",
        ],
      },
    ],
    contact: {
      title: "Contact Us",
      content:
        "If you have any questions about this privacy policy, please contact us:",
      email: "Email: privacy@elsawra.com",
      phone: "Phone: +20 123 456 7890",
    },
  },
};

export default function PrivacyPolicyPage({
  params,
}: {
  params: { lang: string };
}) {
  const isArabic = params.lang === "ar";
  const t = isArabic ? translations.ar : translations.en;
  const currentDate = new Date().toLocaleDateString(
    isArabic ? "ar-EG" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

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
          <p className="text-sm text-gray-600">
            {t.lastUpdated}: {currentDate}
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t.intro.title}
          </h2>
          <p className="text-gray-700 leading-relaxed">{t.intro.content}</p>
        </section>

        {/* Sections */}
        {t.sections.map((section, index) => (
          <section key={index} className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {section.title}
            </h2>
            <ul className="space-y-3">
              {section.content.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start">
                  <span className="text-primary mr-2 mt-1 flex-shrink-0">
                    •
                  </span>
                  <span className="text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Contact */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t.contact.title}
          </h2>
          <p className="text-gray-700 mb-4">{t.contact.content}</p>
          <div className="space-y-2 text-gray-700">
            <p>{t.contact.email}</p>
            <p>{t.contact.phone}</p>
          </div>
        </section>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            {isArabic
              ? "© 2024 مطعم الصورة. جميع الحقوق محفوظة."
              : "© 2024 El Sawra Restaurant. All rights reserved."}
          </p>
        </div>
      </div>
    </div>
  );
}
