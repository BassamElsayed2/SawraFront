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
import { useLocale } from "next-intl";

const HeaderThree = ({ postData }) => {
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

  return (
    <>
      <header className="header axil-header header-style-3  header-light header-sticky">
        <div className="header-top">
          <div className="container">
            <div className=" d-flex justify-content-between align-items-center">
              <div className="">
                <div className="header-top-bar d-flex flex-wrap align-items-center justify-content-center justify-content-md-start">
                  <ul className="header-top-date liststyle  align-items-center mr--20">
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
              <div className="">
                <ul className="social-share-transparent md-size justify-content-center justify-content-md-end">
                  <LanguageSwitcher />
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="header-middle">
          <div className="container">
            <div className="row">
              <div className="logoz col-12">
                <div className=" d-flex ">
                  <Link href="/">
                    <a>
                      <Image
                        className={logo?.logo_url || "dark-logo"}
                        width={385}
                        height={265}
                        src={"/images/logo.png"}
                        alt="Blogar logo"
                      />
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="header-bottom">
          <div className="container">
            <div className="row">
              <div className="d-flex">
                <div className="mainmenu-wrapper  d-xl-block">
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
