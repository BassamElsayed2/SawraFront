import "bootstrap/dist/css/bootstrap.css";
import "../styles/style.scss";
import "../styles/elements/_language-switcher.css";
import ColorSwitcher from "../common/elements/color-switcher/ColorSwitcher";
import { useRouter } from "next/router";
import { appWithTranslation } from "next-i18next";
import { IntlProvider } from "next-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import PageTransition from "../common/PageTransition";
import { CartProvider } from "../context/CartContext";

function MyApp({ Component, pageProps }) {
  const { locale } = useRouter();
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    document.documentElement.dir = "rtl";
  }, [locale]);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale={locale} messages={pageProps.messages}>
          <CartProvider>
            <Component {...pageProps} />
            <PageTransition />
          </CartProvider>
        </IntlProvider>
      </QueryClientProvider>
    </>
  );
}

export default appWithTranslation(MyApp);
