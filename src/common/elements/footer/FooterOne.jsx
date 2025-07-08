import Image from 'next/image';
import Link from "next/link";

const FooterOne = () => {
  if (typeof window !== "undefined") {
    var colorMode = window.localStorage.getItem('color-mode');
  }

  return (
    <div className="axil-footer-area axil-footer-style-1 footer-variation-2">
      <div className="footer-mainmenu">
        <div className="container">
          <div className="row">
            <div className="col-lg-2 col-md-6 col-sm-6 col-12">
              <div className="footer-widget">
                <h2 className="title">World</h2>
                <div className="inner">
                  <ul className="ft-menu-list">
                    <li>
                      <a href="#" className="hover-effect">U.N.</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Conflicts</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Terrorism</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Disasters</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Global Economy</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Environment</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Religion</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Scandals</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-6 col-sm-6 col-12">
              <div className="footer-widget">
                <h2 className="title">Politics</h2>
                <div className="inner">
                  <ul className="ft-menu-list">
                    <li>
                      <a href="#" className="hover-effect">Executive</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Senate</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">House</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Judiciary</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Global Economy</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Foreign policy</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Polls</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Elections</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-6 col-sm-6 col-12">
              <div className="footer-widget">
                <h2 className="title">Entertainment</h2>
                <div className="inner">
                  <ul className="ft-menu-list">
                    <li>
                      <a href="#" className="hover-effect">Celebrity News</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Movies</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">TV News</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Disasters</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Music News</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Environment</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Style News</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Entertainment Video</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-6 col-sm-6 col-12">
              <div className="footer-widget">
                <h2 className="title">Business</h2>
                <div className="inner">
                  <ul className="ft-menu-list">
                    <li>
                      <a href="#" className="hover-effect">Environment</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Conflicts</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Terrorism</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Disasters</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Global Economy</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Environment</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Religion</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Scandals</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-6 col-sm-6 col-12">
              <div className="footer-widget">
                <h2 className="title">Health</h2>
                <div className="inner">
                  <ul className="ft-menu-list">
                    <li>
                      <a href="#" className="hover-effect">Movies</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Conflicts</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Terrorism</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Disasters</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Global Economy</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Environment</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Religion</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Scandals</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-6 col-sm-6 col-12">
              <div className="footer-widget">
                <h2 className="title">About</h2>
                <div className="inner">
                  <ul className="ft-menu-list">
                    <li>
                      <a href="#" className="hover-effect">U.N.</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Conflicts</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Terrorism</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Disasters</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Global Economy</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Environment</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Religion</a>
                    </li>
                    <li>
                      <a href="#" className="hover-effect">Scandals</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Start Footer Top Area  */}
      <div className="footer-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-4">
              <div className="logo">
              <Link href="/">
                <a>
                  <Image
                    className="dark-logo"
                    src={colorMode === "Dark" ? "/images/logo/sawra.png" : "/images/logo/sawra.png"}
                    alt="Logo Images"
                    height={37}
                    width={141}
                  />
                </a>
                </Link>
              </div>
            </div>
            <div className="col-lg-8 col-md-8">
              {/* Start Post List  */}
              <div className="d-flex justify-content-start mt_sm--15 justify-content-md-end align-items-center flex-wrap">
                <h5 className="follow-title mb--0 mr--20">Follow Us</h5>
                <ul className="social-icon color-tertiary md-size justify-content-start">
                  <li>
                    <a href="https://www.facebook.com/" rel="noopener" target="_blank">
                      <i className="fab fa-facebook-f" />
                    </a>
                  </li>
                  <li>
                    <a href="https://www.instagram.com/">
                      <i className="fab fa-instagram" />
                    </a>
                  </li>
                  <li>
                    <a href="https://twitter.com/">
                      <i className="fab fa-twitter" />
                    </a>
                  </li>
                  <li>
                    <a href="https://www.linkedin.com/">
                      <i className="fab fa-linkedin-in" />
                    </a>
                  </li>
                </ul>
              </div>
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
            <div className="col-lg-9 col-md-8">
              <div className="copyright-left">
                <ul className="mainmenu justify-content-start">
                  <li>
                    <Link href="/about">
                      <a className="hover-flip-item-wrapper hover-effect">
                        <span className="hover-flip-item">
                          <span data-text="Contact Us">Contact Us</span>
                        </span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy">
                      <a className="hover-flip-item-wrapper hover-effect">
                        <span className="hover-flip-item">
                          <span data-text="Privacy Policy">Privacy Policy</span>
                        </span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <a className="hover-flip-item-wrapper hover-effect">
                        <span className="hover-flip-item">
                          <span data-text="AdChoices">AdChoices</span>
                        </span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <a className="hover-flip-item-wrapper hover-effect">
                        <span className="hover-flip-item">
                          <span data-text="Advertise with Us">
                            Advertise with Us
                          </span>
                        </span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <a className="hover-flip-item-wrapper hover-effect">
                        <span className="hover-flip-item">
                          <span data-text="Blogar Store">Blogar Store</span>
                        </span>
                      </a>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-4">
              <div className="copyright-right text-start text-md-end mt_sm--20">
                <p className="b3">
                  All Rights Reserved © {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Copyright Area  */}
    </div>
  );
};

export default FooterOne;
