import Head from "next/head";
import { useQuery } from "@tanstack/react-query";
import { getAboutUs } from "../../../../services/apiAboutUs";
import { useLocale } from "next-intl";

const HeadTitle = ({ pageTitle }) => {
  const locale = useLocale();

  const { data: siteSettings } = useQuery({
    queryKey: ["site_settings"],
    queryFn: getAboutUs,
  });

  const title = pageTitle
    ? pageTitle
    : locale === "ar"
    ? siteSettings?.site_name_ar
    : siteSettings?.site_name_en;

  return (
    <Head>
      <meta charSet="utf-8" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <title>{title}</title>
      <meta name="robots" content="noindex, follow" />
      <meta name="description" content="Personal Blog Next JS Template" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <link
        rel="icon"
        type="image/x-icon"
        href={`${
          process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_BASEPATH ?? ""
            : ""
        }/favicon.ico`}
      />
    </Head>
  );
};

export default HeadTitle;
