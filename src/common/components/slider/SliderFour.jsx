"use client";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { SectionTitleTwo } from "../../elements/sectionTitle/SectionTitle";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getNews } from "../../../../services/apiNews";
import { useLocale } from "next-intl";

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
    <div className=" p-5">
      <SectionTitleTwo />{" "}
      <Link href={`/${locale}/menu`}>
        <a>
          <Image
            width={259}
            height={75}
            src={"/images/last.png"}
            alt="Blogar logo"
          />
        </a>
      </Link>
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
