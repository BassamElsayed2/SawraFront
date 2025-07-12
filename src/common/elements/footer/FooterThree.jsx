import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SocialData from "../../../data/social/SocialData.json";
import { useLocale } from "next-intl";

const FooterThree = ({ bgColor, darkLogo, lightLogo }) => {
  const locale = useLocale();

  if (typeof window !== "undefined") {
    var colorMode = window.localStorage.getItem("color-mode");
  }

  return (
    <div
      className="footerz"
    >
      {/* Start Footer Top Area  */}
      <div className="footer-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              {/* Start Post List  */}
              {/* <div className="inner d-flex align-items-center flex-wrap">
            <h5 className="follow-title mb--0 mr--20">Follow Us</h5>
            <ul className="social-icon color-tertiary md-size justify-content-start">
            <li>
                <a href={SocialData.fb.url}>
                  <i className={SocialData.fb.icon} />
                </a>
              </li>
              <li>
                <a href={SocialData.instagram.url}>
                  <i className={SocialData.instagram.icon} />
                </a>
              </li>
              <li>
                <a href={SocialData.twitter.url}>
                  <i className={SocialData.twitter.icon} />
                </a>
              </li>
              <li>
                <a href={SocialData.linked.url}>
                  <i className={SocialData.linked.icon} />
                </a>
              </li>
            </ul>
          </div> */}
              {/* End Post List  */}
            </div>
          </div>
        </div>
      </div>
      {/* End Footer Top Area  */}
      {/* Start Copyright Area  */}
      <div className="copyright-area">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-9 col-md-12">
              <div className="copyright-left">
               
                <ul className="mainmenu justify-content-start">
                  <li>
                  <Link href="/">
                    <a>
                      <Image
                      
                        width={100}
                        height={38}
                        src={"/images/link1.png"}
                        alt="Blogar logo"
                      />
                    </a>
                  </Link>
                  </li>
                  <li>
                  <Link href="/">
                    <a>
                      <Image
                      
                        width={98}
                        height={38}
                        src={"/images/link2.png"}
                        alt="Blogar logo"
                      />
                    </a>
                  </Link>
                  </li>
       
                  <li>
                  <Link href="/">
                    <a>
                      <Image
                      
                        width={140}
                        height={38}
                        src={"/images/link3.png"}
                        alt="Blogar logo"
                      />
                    </a>
                  </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-12">
              <div className="copyright-right text-start text-lg-end mt_md--20 mt_sm--20">
               
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Copyright Area  */}
    </div>
  );
};

export default FooterThree;
