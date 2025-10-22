import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | شروط الخدمة",
  description: "Terms of Service for El Sawra Restaurant App",
};

const translations = {
  ar: {
    title: "شروط الخدمة",
    lastUpdated: "آخر تحديث",
    intro: {
      title: "مقدمة",
      content:
        "مرحباً بك في مطعم الصورة. باستخدامك لتطبيقنا، فإنك توافق على الالتزام بشروط الخدمة هذه. يرجى قراءتها بعناية.",
    },
    sections: [
      {
        title: "استخدام الخدمة",
        content: [
          "يجب أن تكون بعمر 13 عاماً على الأقل لاستخدام خدماتنا",
          "يجب تقديم معلومات دقيقة وصحيحة عند التسجيل",
          "أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور",
          "يجب استخدام التطبيق للأغراض القانونية فقط",
        ],
      },
      {
        title: "الطلبات والدفع",
        content: [
          "جميع الأسعار معروضة بالجنيه المصري",
          "نحتفظ بالحق في تغيير الأسعار في أي وقت",
          "يجب دفع ثمن الطلب بالكامل قبل التوصيل أو عند الاستلام",
          "نقبل الدفع النقدي والبطاقات الائتمانية والمحافظ الإلكترونية",
        ],
      },
      {
        title: "التوصيل",
        content: [
          "نقدم خدمة التوصيل ضمن نطاق محدد حول فروعنا",
          "أوقات التوصيل المقدرة هي تقريبية وقد تختلف",
          "رسوم التوصيل تختلف حسب المسافة",
          "يجب توفر شخص لاستلام الطلب في العنوان المحدد",
        ],
      },
      {
        title: "الإلغاء والاسترجاع",
        content: [
          "يمكنك إلغاء طلبك قبل بدء التحضير",
          "بعد بدء التحضير، لا يمكن إلغاء الطلب",
          "في حالة وجود مشكلة في الطلب، يرجى الاتصال بخدمة العملاء فوراً",
          "سيتم تقييم طلبات الاسترجاع على أساس كل حالة على حدة",
        ],
      },
      {
        title: "حقوق الملكية الفكرية",
        content: [
          "جميع المحتويات في التطبيق محمية بحقوق الطبع والنشر",
          "لا يجوز نسخ أو توزيع أي محتوى دون إذن خطي",
          "الشعارات والعلامات التجارية مملوكة لمطعم الصورة",
        ],
      },
      {
        title: "سلوك المستخدم",
        content: [
          "يُحظر استخدام التطبيق لأي نشاط غير قانوني",
          "يُحظر التحرش أو إساءة معاملة موظفينا",
          "يُحظر محاولة اختراق أو إلحاق الضرر بالتطبيق",
          "يُحظر إساءة استخدام العروض أو نظام النقاط",
        ],
      },
      {
        title: "إنهاء الخدمة",
        content: [
          "نحتفظ بالحق في تعليق أو إنهاء حسابك في حالة انتهاك الشروط",
          "يمكنك إغلاق حسابك في أي وقت من إعدادات التطبيق",
          "عند إنهاء الحساب، ستفقد جميع النقاط والعروض غير المستخدمة",
        ],
      },
      {
        title: "إخلاء المسؤولية",
        content: [
          "نبذل قصارى جهدنا لتقديم خدمة عالية الجودة، لكن لا نضمن عدم انقطاع الخدمة",
          "لسنا مسؤولين عن أي أضرار ناتجة عن استخدام التطبيق",
          "المعلومات الغذائية المقدمة هي للإرشاد فقط",
        ],
      },
      {
        title: "تعديل الشروط",
        content: [
          "قد نقوم بتحديث هذه الشروط من وقت لآخر",
          "سيتم إخطارك بأي تغييرات جوهرية",
          "استمرارك في استخدام الخدمة يعني موافقتك على الشروط المحدثة",
        ],
      },
    ],
    contact: {
      title: "اتصل بنا",
      content: "إذا كان لديك أي أسئلة حول شروط الخدمة هذه، يرجى الاتصال بنا:",
      email: "البريد الإلكتروني: support@elsawra.com",
      phone: "الهاتف: +20 123 456 7890",
    },
  },
  en: {
    title: "Terms of Service",
    lastUpdated: "Last Updated",
    intro: {
      title: "Introduction",
      content:
        "Welcome to El Sawra Restaurant. By using our application, you agree to comply with these Terms of Service. Please read them carefully.",
    },
    sections: [
      {
        title: "Use of Service",
        content: [
          "You must be at least 13 years old to use our services",
          "You must provide accurate and truthful information when registering",
          "You are responsible for maintaining the confidentiality of your account and password",
          "You must use the application for legal purposes only",
        ],
      },
      {
        title: "Orders and Payment",
        content: [
          "All prices are displayed in Egyptian Pounds",
          "We reserve the right to change prices at any time",
          "Payment must be made in full before delivery or upon pickup",
          "We accept cash, credit cards, and electronic wallets",
        ],
      },
      {
        title: "Delivery",
        content: [
          "We provide delivery service within a specific range around our branches",
          "Estimated delivery times are approximate and may vary",
          "Delivery fees vary based on distance",
          "Someone must be available to receive the order at the specified address",
        ],
      },
      {
        title: "Cancellation and Refund",
        content: [
          "You can cancel your order before preparation begins",
          "After preparation starts, the order cannot be cancelled",
          "If there is an issue with your order, please contact customer service immediately",
          "Refund requests will be evaluated on a case-by-case basis",
        ],
      },
      {
        title: "Intellectual Property Rights",
        content: [
          "All content in the application is protected by copyright",
          "No content may be copied or distributed without written permission",
          "Logos and trademarks are owned by El Sawra Restaurant",
        ],
      },
      {
        title: "User Conduct",
        content: [
          "Using the application for any illegal activity is prohibited",
          "Harassment or mistreatment of our staff is prohibited",
          "Attempting to hack or damage the application is prohibited",
          "Misuse of offers or the points system is prohibited",
        ],
      },
      {
        title: "Service Termination",
        content: [
          "We reserve the right to suspend or terminate your account in case of terms violation",
          "You can close your account at any time from the app settings",
          "Upon account termination, you will lose all unused points and offers",
        ],
      },
      {
        title: "Disclaimer",
        content: [
          "We do our best to provide high-quality service, but do not guarantee uninterrupted service",
          "We are not responsible for any damages resulting from the use of the application",
          "Nutritional information provided is for guidance only",
        ],
      },
      {
        title: "Modification of Terms",
        content: [
          "We may update these terms from time to time",
          "You will be notified of any material changes",
          "Your continued use of the service means you agree to the updated terms",
        ],
      },
    ],
    contact: {
      title: "Contact Us",
      content:
        "If you have any questions about these Terms of Service, please contact us:",
      email: "Email: support@elsawra.com",
      phone: "Phone: +20 123 456 7890",
    },
  },
};

export default function TermsOfServicePage({
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
