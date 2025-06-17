import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MenuData from "../../../data/mobilemenu/MenuData.json";
import { useQuery } from "@tanstack/react-query";
import { getAboutUs } from "../../../../services/apiAboutUs";
import { useLocale } from "next-intl";

const MobileMenu = ({ menuShow, menuHide }) => {
  const locale = useLocale();
  const { data: logo } = useQuery({
    queryKey: ["site_settings"],
    queryFn: getAboutUs,
  });

  if (typeof window !== "undefined") {
    var colorMode = window.localStorage.getItem("color-mode");
  }

  const MenuToggleHandler = (e) => {
    let selectElm = e.target.nextSibling;
    if (!selectElm.classList.contains("open")) {
      selectElm.classList.add("open");
      e.target.classList.add("open");
    } else {
      selectElm.classList.remove("open");
      e.target.classList.remove("open");
    }
  };

  return (
    <div className={`popup-mobilemenu-area ${menuShow ? "show" : ""}`}>
      <div className="inner">
        <div className="mobile-menu-top">
          <div className="logo">
            <Link href="/">
              <a>
                <Image
                  className={logo?.logo_url || "dark-logo"}
                  width={141}
                  height={37}
                  src={
                    colorMode === "Dark"
                      ? "/images/logo/logo-white2.webp"
                      : "/images/logo/logo-black.webp"
                  }
                  alt="Blogar logo"
                />
              </a>
            </Link>
          </div>
          <div className="mobile-close" onClick={menuHide}>
            <div className="icon">
              <i className="fal fa-times" />
            </div>
          </div>
        </div>

        <ul className="mainmenu">
          <li className="menu-item-has-children">
            <Link href="/">{locale === "en" ? "Home" : "الرئيسية"}</Link>
          </li>
          <li className="menu-item-has-children">
            <Link href={`/${locale}/news`}>
              {locale === "en" ? "All News" : "جميع الأخبار"}
            </Link>
          </li>
          <li className="menu-item-has-children">
            <Link href={`/${locale}/gallery`}>
              <a>{locale === "en" ? "Gallery" : "معرض الصور"}</a>
            </Link>
          </li>
          <li>
            <Link href={`/${locale}/about`}>
              <a>{locale === "en" ? "About Us" : "عنا"}</a>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MobileMenu;
