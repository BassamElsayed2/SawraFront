import React from "react";
import HeadTitle from "../../common/elements/head/HeadTitle";
import HeaderThree from "../../common/elements/header/HeaderThree";
import FooterOne from "../../common/elements/footer/FooterOne";
import FooterThree from "../../common/elements/footer/FooterThree";

function Branches() {
  const branches = [
    {
      id: 1,
      title: "الفرع الرئيسي",
      subtitle: "الرياض - العاصمة",
      address: "شارع الملك فهد، الرياض، المملكة العربية السعودية",
      description:
        "فرعنا الرئيسي في قلب العاصمة الرياض، يوفر جميع خدماتنا مع فريق متخصص ومرافق حديثة. يقع في موقع استراتيجي يسهل الوصول إليه من جميع أحياء المدينة.",
      phone: "+966-11-123-4567",
      location: "https://maps.google.com/?q=24.7136,46.6753",
      image: "/images/bg/bg-image-1.webp",
      workingHours: "الأحد - الخميس: 8 ص - 8 م",
      services: ["خدمة العملاء", "المبيعات", "الدعم الفني", "الاستشارات"],
    },
    {
      id: 2,
      title: "فرع جدة",
      subtitle: "جدة - المدينة الساحلية",
      address: "شارع التحلية، جدة، المملكة العربية السعودية",
      description:
        "فرع جدة المميز يقدم خدمات عالية الجودة في أجواء مريحة ومناسبة لجميع العملاء. يتميز بموقعه القريب من الكورنيش والمراكز التجارية.",
      phone: "+966-12-987-6543",
      location: "https://maps.google.com/?q=21.4858,39.1925",
      image: "/images/bg/bg-image-2.webp",
      workingHours: "الأحد - الخميس: 8 ص - 8 م",
      services: ["خدمة العملاء", "المبيعات", "الدعم الفني"],
    },
    {
      id: 3,
      title: "فرع الدمام",
      subtitle: "الدمام - المنطقة الشرقية",
      address: "شارع الملك خالد، الدمام، المملكة العربية السعودية",
      description:
        "فرع الدمام الجديد يفتح أبوابه لخدمة عملاء المنطقة الشرقية بأحدث التقنيات والخدمات المتميزة. يقع في قلب المدينة التجارية.",
      phone: "+966-13-456-7890",
      location: "https://maps.google.com/?q=26.4207,50.0888",
      image: "/images/bg/bg-image-3.webp",
      workingHours: "الأحد - الخميس: 8 ص - 8 م",
      services: ["خدمة العملاء", "المبيعات", "الدعم الفني", "الاستشارات"],
    },
    {
      id: 4,
      title: "فرع مكة المكرمة",
      subtitle: "مكة المكرمة - المدينة المباركة",
      address: "شارع العزيزية، مكة المكرمة، المملكة العربية السعودية",
      description:
        "فرع مكة المكرمة المبارك يقدم خدمات متميزة لضيوف الرحمن وزوار الحرم الشريف. يتميز بموقعه القريب من الحرم المكي الشريف.",
      phone: "+966-12-345-6789",
      location: "https://maps.google.com/?q=21.4225,39.8262",
      image: "/images/bg/bg-image-4.webp",
      workingHours: "الأحد - الخميس: 8 ص - 8 م",
      services: ["خدمة العملاء", "المبيعات", "الدعم الفني"],
    },
  ];

  return (
    <div className="main branches-page">
      <HeadTitle />
      <HeaderThree />

      {/* Hero Section */}
      <section className="hero-section py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center hero-content">
              <h1 className="hero-title text-white mb-4">فروعنا</h1>
              <p className="hero-subtitle text-white mb-5">
                اكتشف فروعنا المنتشرة في جميع أنحاء مصر
              </p>
              <div className="hero-stats d-flex justify-content-center gap-3">
                <div className="stat-badge">
                  <span>4 فروع</span>
                </div>
                <div className="stat-badge">
                  <span>خدمة 24/7</span>
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
            {branches.map((branch) => (
              <div key={branch.id} className="col-lg-6">
                <div className="branch-card h-100">
                  {/* Card Image */}
                  <div className="card-image">
                    <img
                      src={branch.image}
                      alt={branch.title}
                      className="img-fluid"
                    />
                    <div className="card-title-overlay">
                      <h3>{branch.title}</h3>
                      <p className="subtitle">{branch.subtitle}</p>
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
                        <h4>العنوان</h4>
                        <p>{branch.address}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <h4 className="fw-semibold text-dark mb-3">الوصف</h4>
                      <p className="text-muted">{branch.description}</p>
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
                        <h4>ساعات العمل</h4>
                        <p>{branch.workingHours}</p>
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
                        href={branch.location}
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
