import React from "react";
import HeadTitle from "../../common/elements/head/HeadTitle";
import HeaderThree from "../../common/elements/header/HeaderThree";
import FooterOne from "../../common/elements/footer/FooterOne";
import FooterThree from "../../common/elements/footer/FooterThree";
import { useQuery } from "@tanstack/react-query";
import { getBranches } from "../../../services/getBranches";
import { useLocale } from "next-intl";

function Branches() {
  const locale = useLocale();

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
  });

  return (
    <div className="main branches-page">
      <HeadTitle />
      <HeaderThree />

      {/* Hero Section */}
      <section className="hero-section py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center hero-content">
              <h1 className="hero-title text-white mb-4">
                {locale === "ar" ? "فروعنا" : "Our Branches"}
              </h1>
              <p className="hero-subtitle text-white mb-5">
                {locale === "ar"
                  ? "اكتشف فروعنا المنتشرة في جميع أنحاء مصر"
                  : "Discover our branches spread across Egypt"}
              </p>
              <div className="hero-stats d-flex justify-content-center gap-3">
                <div className="stat-badge">
                  <span>
                    {locale === "ar"
                      ? `${branches?.length} فروع`
                      : `${branches?.length} Branches`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Branches Section */}
      <section className="branches-section py-5">
        <div className="container">
          <div className="row g-4">
            {branches?.map((branch) => (
              <div key={branch.id} className="col-lg-6">
                <div className="branch-card h-100">
                  {/* Card Image */}
                  <div className="card-image">
                    <img
                      src={branch.image}
                      alt={branch.title_en}
                      className="img-fluid"
                    />
                    <div className="card-title-overlay">
                      <h3>
                        {locale === "ar" ? branch.name_ar : branch.name_en}
                      </h3>
                      <p className="subtitle">
                        {locale === "ar" ? branch.area_ar : branch.area_en}
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body">
                    {/* Address */}
                    <div className="info-item">
                      <div className="icon-wrapper">
                        <svg
                          width="20"
                          height="20"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="info-content">
                        <h4>{locale === "ar" ? "العنوان" : "Address"}</h4>
                        <p>
                          {locale === "ar"
                            ? branch.address_ar
                            : branch.address_en}
                        </p>
                      </div>
                    </div>

                    {/* Working Hours */}
                    <div className="info-item mb-4">
                      <div className="icon-wrapper purple">
                        <svg
                          width="20"
                          height="20"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="info-content">
                        <h4>
                          {locale === "ar" ? "ساعات العمل" : "Working Hours"}
                        </h4>
                        <p>{branch.works_hours}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                      <a
                        href={`tel:${branch.phone}`}
                        className="btn btn-contact"
                      >
                        <svg
                          width="20"
                          height="20"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        اتصل بنا
                      </a>

                      <a
                        href={branch.google_map}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-directions"
                      >
                        <svg
                          width="20"
                          height="20"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        احصل على الاتجاهات
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterThree />
    </div>
  );
}

export default Branches;
