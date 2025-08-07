import Link from "next/link";
import {
  ChefHat,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import Image from "next/image";

interface FooterProps {
  lang: "en" | "ar";
  dict: any;
}

export default function Footer({ lang, dict }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Image
                src="/LogoElSawra.png"
                alt="Logo"
                width={100}
                height={100}
              />
            </div>
            <p className="text-gray-300 leading-relaxed text-[13px] mt-2">
              {lang === "en"
                ? "The restaurant is known for its variety of dishes such as pizza, crepes, waffles, pasta, and fast food (broasted chicken and sandwiches). It has specialties in several locations, including Minya Al Tabkh, in addition to Tenth of Ramadan and Zagazig."
                : "المطعم يُقدّم مجموعة متنوعة من الوجبات مثل البيتزا، الكريب، الوافل، المكرونة، والوجبات السريعة (بروست وسندوتشات) لديه فروع في عدة أماكن بما في ذلك منيا القمح تحديدًا، بالإضافة إلى العاشر من رمضان والزقازي"}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-red-500">
              {lang === "en" ? "Quick Links" : "روابط سريعة"}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${lang}`}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  {dict.nav.home}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/menu`}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  {dict.nav.menu}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/branches`}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  {dict.nav.branches}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-red-500">
              {lang === "en" ? "Contact Info" : "معلومات التواصل"}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 rtl:space-x-reverse">
                <Phone className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-gray-300">+17533</span>
              </li>
              <li className="flex items-center space-x-3 rtl:space-x-reverse">
                <Mail className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-gray-300">info@elsawra.com</span>
              </li>
              <li className="flex items-start space-x-3 rtl:space-x-reverse">
                <MapPin className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />
                <span className="text-gray-300">
                  {lang === "en"
                    ? "Mina Al-Qamah - Abd El-Makki Square, Sade Zaghloul Street, next to the Revolution Restaurant"
                    : "منيا القمح - ميدان عبدة مكي شارع سعد زغلول بجوار مطعم الثورة "}
                </span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          {/* <div className="space-y-4">
            <h3 className="text-xl font-semibold text-red-500">
              {lang === "en" ? "Opening Hours" : "ساعات العمل"}
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex justify-between">
                <span>
                  {lang === "en" ? "Monday - Thursday" : "الاثنين - الخميس"}
                </span>
                <span>9:00 AM - 4:00 AM</span>
              </li>
              <li className="flex justify-between">
                <span>
                  {lang === "en" ? "Friday - Saturday" : "الجمعة - السبت"}
                </span>
                <span>9:00 AM - 4:00 AM</span>
              </li>
              <li className="flex justify-between">
                <span>{lang === "en" ? "Sunday" : "الأحد"}</span>
                <span>12:00 PM - 9:00 PM</span>
              </li>
            </ul>
          </div> */}
        </div>

        {/* Social Media and Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Social Media Links */}
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
              <span className="text-gray-300">
                {lang === "en" ? "Follow Us:" : "تابعونا:"}
              </span>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <a
                  href="https://www.facebook.com/mat3amelsawrazag12"
                  className="text-gray-300 hover:text-red-500 transition-colors"
                  aria-label="Facebook"
                  target="_blank"
                >
                  <Facebook className="h-6 w-6" />
                </a>
                <a
                  href="https://www.instagram.com/elthawra_restaurant/"
                  className="text-gray-300 hover:text-red-500 transition-colors"
                  aria-label="Instagram"
                  target="_blank"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-gray-400 text-center md:text-right">
              <p>
                {lang === "en"
                  ? "All rights reserved to © Elsawra."
                  : "جميع الحقوق محفوظة © لمطعم الثورة."}
              </p>
            </div>
            <div className="text-gray-400 text-center md:text-right flex gap-2">
              <p>
                {lang === "en" ? "Design and develop by " : "تصميم وبرمجة "}
              </p>
              <Link href={"https://ens.eg/"} className="hover:text-red-400">
                ENS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
