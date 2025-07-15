import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import Nav from "./Nav";

import { useTranslation } from "next-i18next";
import LanguageSwitcher from "../LanguageSwitcher";
import { useRouter } from "next/router";
import { getAds } from "../../../../services/apiAds";
import { useQuery } from "@tanstack/react-query";
import { getAboutUs } from "../../../../services/apiAboutUs";

const HeaderThree = ({pClass, darkLogo, lightLogo, postData }) => {
  const { locale } = useRouter();

  const { data: logo } = useQuery({
    queryKey: ["site_settings"],
    queryFn: getAboutUs,
  });

  const dateFormate = () => {
    var day = new Date().getDate();
    var month = new Date().toLocaleString(locale, { month: "long" });
    var year = new Date().getFullYear();

    var todayDate = day + " " + month + "," + " " + year;

    return todayDate;
  };

  if (typeof window !== "undefined") {
    var colorMode = window.localStorage.getItem("color-mode");
  }

  const [showMMenu, SetShowMMenu] = useState(false);

  const MobileShowHandler = () => SetShowMMenu(true);
  const MobileHideHandler = () => SetShowMMenu(false);

  const [togglaClass, setTogglaClass] = useState(false);

  const toggleHandler = () => {
    setTogglaClass((active) => !active);
  };

  const { t } = useTranslation("common");

  const { data: ads } = useQuery({
    queryKey: ["ads"],
    queryFn: getAds,
  });

  const homeAds = ads?.filter((ad) => ad.location === "home");

  return (
    <>
  <header className="header axil-header header-style-3 header-light header-sticky">
  <div className="custom-header-top">
  <div className="container">
    <div className="row align-items-center justify-content-between">
      <div className="col-md-9 col-sm-12">
        <ul className="header-top-info list-unstyled mb-0">
          <li>
            <i className="fas fa-map-marker-alt icon-yellow" />
            <span>{t("location", { defaultValue: "Your Country, Your City, 12345" })}</span>
          </li>
          <li>
            <i className="fas fa-phone-alt icon-yellow" />
            <span>{t("hotline", { defaultValue: "123 456 789" })}</span>
          </li>
          <li>
            <i className="fas fa-clock icon-yellow" />
            <span>{t("working_hours", { defaultValue: "11:00 - 21:00" })}</span>
          </li>
        </ul>
      </div>

      <div className="col-md-3 col-sm-12 text-end">
        <LanguageSwitcher />
      </div>
    </div>
  </div>
</div>


    {/* ===== Header Main Row: Logo + Nav + Switch ===== */}
    <div className="header-middle py-2">
      <div className="container">
        <div className="row align-items-center justify-content-between">
          {/* Logo */}
          <div className="col-lg-3 col-md-4 col-sm-4 col-6">
            <div className="logo">
              <Link href="/">
                <a>
                  <Image
                    className={logo?.logo_url || "dark-logo"}
                    width={141}
                    height={60}
                    src="/images/logo/LogoElSawra.png"
                    alt="Blogar logo"
                  />
                </a>
              </Link>
            </div>
          </div>

          <div className="col-lg-6 d-none d-xl-block">
            <div className="mainmenu-wrapper text-center">
              <nav className="mainmenu-nav">
                <Nav posts={postData} />
              </nav>
            </div>
          </div>

          <div className="col-lg-3 col-md-4 col-sm-6 col-6 d-flex justify-content-end align-items-center">
         

            {/* Hamburger (mobile only) */}
            <div className="hamburger-menu d-block d-xl-none">
              <div className="hamburger-inner">
                <div className="icon" onClick={MobileShowHandler}>
                  <i className="fal fa-bars" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <MobileMenu menuShow={showMMenu} menuHide={MobileHideHandler} />
</>

  
  );
};

export default HeaderThree;
