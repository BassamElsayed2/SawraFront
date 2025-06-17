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

const HeaderThree = ({ darkLogo, lightLogo, postData }) => {
  const { locale } = useRouter();
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
      <header className="header axil-header header-style-3  header-light header-sticky">
        <div className="header-top">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 col-md-8 col-sm-12">
                <div className="header-top-bar d-flex flex-wrap align-items-center justify-content-center justify-content-md-start">
                  <ul className="header-top-date liststyle d-flex flrx-wrap align-items-center mr--20">
                    <li>
                      <Link href="#">
                        <a>{dateFormate()}</a>
                      </Link>
                    </li>
                  </ul>
                  <ul className="header-top-nav liststyle d-flex flrx-wrap align-items-center">
                    <li>
                      <Link href="#">
                        <a>{t("advertisement")}</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="#">
                        <a href="#">{t("about")}</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="#">
                        <a>{t("contact")}</a>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-6 col-md-4 col-sm-12">
                <ul className="social-share-transparent md-size justify-content-center justify-content-md-end">
                  <LanguageSwitcher />
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="header-middle">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-3 col-md-4 col-sm-6">
                <div className="logo">
                  <Link href="/">
                    <a>
                      <Image
                        className="dark-logo"
                        width={141}
                        height={37}
                        src={
                          (colorMode === "Dark"
                            ? lightLogo || "/images/logo/logo-white2.webp"
                            : darkLogo || "/images/logo/logo-black.webp") ||
                          "/images/logo/logo-black.webp"
                        }
                        alt="Blogar logo"
                      />
                    </a>
                  </Link>
                </div>
              </div>
              <div className="col-lg-9 col-md-8 col-sm-6">
                <div className="banner-add text-end">
                  {homeAds?.[0] && (
                    <Link href={homeAds[0].link || "#"}>
                      <a>
                        <Image
                          src={homeAds[0].image_url}
                          width={728}
                          height={92}
                          alt={homeAds[0].title_en}
                        />
                      </a>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="header-bottom">
          <div className="container">
            <div className="row justify-content-between align-items-center">
              <div className="d-flex justify-content-center">
                <div className="mainmenu-wrapper d-none d-xl-block">
                  <nav className="mainmenu-nav">
                    <Nav posts={postData} />
                  </nav>
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
