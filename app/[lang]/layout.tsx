import type { Metadata, Viewport } from "next";
import { Inter, Noto_Kufi_Arabic } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PwaProvider } from "@/components/pwa-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
});

const APP_NAME = "مطعم الثورة";
const APP_DESCRIPTION = "استمتع بأفضل تجربة طعام مع مأكولاتنا الأصيلة";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#DC2626",
};

export async function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: "en" | "ar" };
}) {
  const { lang } = await params;

  // Check for validity (اختياري)
  if (!["en", "ar"].includes(lang)) {
    throw new Error(`Invalid language: ${lang}`);
  }

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <head>
        <style suppressHydrationWarning>{`
            html {
              font-family: ${GeistSans.style.fontFamily};
              --font-sans: ${GeistSans.variable};
              --font-mono: ${GeistMono.variable};
            }
        `}</style>
      </head>
      <body
        className={`${inter.variable} ${notoKufiArabic.variable} ${
          lang === "ar" ? "font-arabic" : "font-inter"
        }`}
        suppressHydrationWarning
      >
        <PwaProvider>
          <Providers>{children}</Providers>
        </PwaProvider>
      </body>
    </html>
  );
}
