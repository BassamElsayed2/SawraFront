"use client";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { SectionTitleTwo } from "../../elements/sectionTitle/SectionTitle";

import { useQuery } from "@tanstack/react-query";
import { getNews } from "../../../../services/apiNews";
import { useLocale } from "next-intl";

const cards = [
  {
    id: 1,
    title: "كارت 1",
    image: "/images/add-banner/banner-01.webp",
    desc: "وصف مختصر للكارت 1",
  },
  {
    id: 2,
    title: "كارت 2",
    image: "/images/add-banner/banner-01.webp",
    desc: "وصف مختصر للكارت 2",
  },
  {
    id: 3,
    title: "كارت 3",
    image: "/images/add-banner/banner-01.webp",
    desc: "وصف مختصر للكارت 3",
  },
  {
    id: 4,
    title: "كارت 4",
    image: "/images/add-banner/banner-01.webp",
    desc: "وصف مختصر للكارت 4",
  },
  {
    id: 5,
    title: "كارت 5",
    image: "/images/add-banner/banner-01.webp",
    desc: "وصف مختصر للكارت 5",
  },
  {
    id: 6,
    title: "كارت 6",
    image: "/images/add-banner/banner-01.webp",
    desc: "وصف مختصر للكارت 6",
  },
  {
    id: 7,
    title: "كارت 7",
    image: "/images/add-banner/banner-01.webp",
    desc: "وصف مختصر للكارت 7",
  },
  {
    id: 8,
    title: "كارت 8",
    image: "/images/add-banner/banner-01.webp",
    desc: "وصف مختصر للكارت 8",
  },
];

export default function CardSlider() {
  const locale = useLocale();

  const { data: news } = useQuery({
    queryKey: ["news"],
    queryFn: getNews,
  });

  // فلترة الأخبار التي لديها offers غير null
  const offersNews = Array.isArray(news)
    ? news.filter((item) => item.offers > 0)
    : [];

  console.log(offersNews);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: false,
    pauseOnFocus: false,
    responsive: [
      {
        breakpoint: 992,
        settings: { slidesToShow: 2, slidesToScroll: 2 },
      },
      {
        breakpoint: 576,
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
    ],
  };

  return (
    <div className=" p-5" style={{ backgroundColor: "#8b0000" }}>
      <SectionTitleTwo
        title={locale === "en" ? "Offers" : "اخر العروض"}
        btnText={locale === "en" ? "See More" : "عرض الكل"}
        btnUrl={`/${locale}/news`}
      />
      <Slider {...settings}>
        {offersNews.map((item) => (
          <div key={item.id} className="p-2">
            <div
              className="card h-100 shadow-sm text-center card-offer"
              style={{
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                transition: "transform 0.2s, box-shadow 0.2s",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              {item.images?.[0] && (
                <Image
                  src={item.images[0]}
                  alt={locale === "en" ? item.title_en : item.title_ar}
                  width={400}
                  height={250}
                  className="card-img-top"
                  style={{
                    objectFit: "cover",
                    borderTopLeftRadius: 18,
                    borderTopRightRadius: 18,
                    minHeight: 180,
                  }}
                />
              )}
              <div className="card-body" style={{ padding: 18 }}>
                <h5
                  className="card-title"
                  style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}
                >
                  {locale === "en" ? item.title_en : item.title_ar}
                </h5>
                <div style={{ marginTop: 12 }}>
                  <div
                    className="product-price-box mt-3"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {item.offers > 0 && (
                      <span
                        className="price-current"
                        style={{
                          color: "#16a34a",
                          fontWeight: 700,
                          fontSize: 20,
                        }}
                      >
                        {locale === "en"
                          ? `${item.price - item.offers} EGP`
                          : `${item.price - item.offers} ج.م`}
                      </span>
                    )}
                    <span
                      className={
                        item.offers > 0 ? "price-old" : "price-current"
                      }
                      style={{
                        color: item.offers > 0 ? "#888" : "#16a34a",
                        textDecoration:
                          item.offers > 0 ? "line-through" : "none",
                        fontSize: 16,
                        fontWeight: 500,
                        marginLeft: 6,
                      }}
                    >
                      {locale === "en"
                        ? `${item.price} EGP`
                        : `${item.price} ج.م`}
                    </span>
                    {item.offers > 0 && (
                      <span
                        className="discount-badge ms-2"
                        style={{
                          background: "#fff4e0",
                          color: "#d32f2f",
                          padding: "2px 10px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: "bold",
                          marginLeft: 6,
                          border: "1px solid #ffd6b0",
                          letterSpacing: 1,
                        }}
                      >
                        {locale === "en"
                          ? `${Math.round(
                              (item.offers / item.price) * 100
                            )}% OFF`
                          : `خصم ${Math.round(
                              (item.offers / item.price) * 100
                            )}٪`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
      <style>{`
        .card-offer:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 8px 24px rgba(220,38,38,0.13);
        }
      `}</style>
    </div>
  );
}
