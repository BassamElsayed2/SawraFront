import Link from "next/link";
import { useRouter } from "next/router";

const LanguageSwitcher = () => {
  const router = useRouter();
  const { locale, locales, asPath } = router;

  const otherLocale = locale === 'en' ? 'ar' : 'en';

  return (
    <Link href={asPath} locale={otherLocale}>
      <button className="langSwitcher">
        {otherLocale === 'ar' ? 'العربية' : 'English'}
      </button>
    </Link>
  );
};

export default LanguageSwitcher;
