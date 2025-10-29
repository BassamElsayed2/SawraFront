import type { Metadata } from "next";
import { Inter, Noto_Kufi_Arabic } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  title: "مطعم الثورة",
  description: "استمتع بأفضل تجربة طعام مع مأكولاتنا الأصيلة",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
