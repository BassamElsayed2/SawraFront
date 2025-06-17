import "bootstrap/dist/css/bootstrap.css";
import "../styles/style.scss";
import "../styles/elements/_language-switcher.css";
import ColorSwitcher from "../common/elements/color-switcher/ColorSwitcher";
import { useRouter } from "next/router";
import { appWithTranslation } from "next-i18next";
import { IntlProvider } from "next-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";

function MyApp({ Component, pageProps }) {
  const { locale } = useRouter();
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    // ضبط الاتجاه بناءً على اللغة
    if (locale === "ar") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  }, [locale]);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale={locale} messages={pageProps.messages}>
          <Component {...pageProps} />
        </IntlProvider>
      </QueryClientProvider>
    </>
  );
}

export default appWithTranslation(MyApp);
