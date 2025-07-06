import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Slider from "react-slick";
import { SectionTitleOne } from "../../elements/sectionTitle/SectionTitle";
import { useQuery } from "@tanstack/react-query";
import { getNews } from "../../../../services/apiNews";
import { useLocale } from "next-intl";
import { getAds } from "../../../../services/apiAds";
import AddBanner from "../ad-banner/AddBanner";

const PostSectionEleven = () => {
  const locale = useLocale();

  const { data: ads } = useQuery({
    queryKey: ["ads"],
    queryFn: getAds,
  });

  const {
    data: fetchedPosts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["news"],
    queryFn: getNews,
  });

  const [thirdHomeAd, setThirdHomeAd] = useState(null);

  useEffect(() => {
    const homeAds = ads?.filter((ad) => ad.location === "home") || [];
    setThirdHomeAd(homeAds[2]);
  }, [ads]);

  const getImageSrc = (img) => {
    if (Array.isArray(img)) return img[0] || "";
    if (typeof img === "string") return img;
    return "";
  };

  // دالة للحصول على العنوان المناسب حسب اللغة
  const getTitle = (data) => {
    if (locale === "ar") {
      return data.title_ar || data.title_en || "عنوان غير متوفر";
    }
    return data.title_en || data.title_ar || "Title not available";
  };

  // دالة للحصول على المحتوى المناسب حسب اللغة
  const getContent = (data) => {
    if (locale === "ar") {
      return data.content_ar || data.content_en || "";
    }
    return data.content_en || data.content_ar || "";
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data.</p>;

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <button className="slick-arrow slick-next" style={{ color: "white" }}>›</button>,
    prevArrow: <button className="slick-arrow slick-prev" style={{ color: "white" }}>‹</button>,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="axil-post-grid-area axil-section-gap" style={{ 
      background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      direction: locale === "ar" ? "rtl" : "ltr"
    }}>
      <div className="container">
        <SectionTitleOne title={locale === "en" ? "Hot Offers" : "العروض الساخنة"} />
        <div className="row">
          <div className="col-lg-12">
            <Slider {...sliderSettings}>
              {fetchedPosts?.map((data) => (
                <div className="slider-item px-2" key={data.id}>
                  <div
                    className="featured-post"
                    style={{
                      background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                      borderRadius: "20px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)",
                      padding: "0",
                      height: "100%",
                      minHeight: "450px",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      border: "1px solid rgba(220,38,38,0.1)",
                      overflow: "hidden",
                      position: "relative",
                      direction: locale === "ar" ? "rtl" : "ltr"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow = "0 20px 40px rgba(220,38,38,0.15), 0 8px 20px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)";
                    }}
                  >
                    <div className="post-thumbnail position-relative" style={{height: "250px", overflow: "hidden"}}>
                      <Link href={`/${locale}/post/${data.id}`}>
                        <a>
                          <Image
                            src={getImageSrc(data.images)}
                            alt={getTitle(data)}
                            layout="fill"
                            objectFit="cover"
                            priority
                            style={{
                              transition: "transform 0.4s ease"
                            }}
                          />
                        </a>
                      </Link>
                      <div 
                        className="position-absolute top-0 start-0 m-3"
                        style={{
                          background: "linear-gradient(45deg, #dc2626, #f97316)",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "25px",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          boxShadow: "0 4px 12px rgba(220,38,38,0.3)"
                        }}
                      >
                        {locale === "en" ? "HOT" : "عرض ساخن"}
                      </div>
                    </div>
                    
                    <div className="post-content p-4" style={{
                      height: "200px", 
                      display: "flex", 
                      flexDirection: "column", 
                      justifyContent: "space-between",
                      direction: locale === "ar" ? "rtl" : "ltr"
                    }}>
                      <h4 
                        className="title mb-3" 
                        style={{ 
                          fontSize: "1.25rem", 
                          fontWeight: "700", 
                          color: "#1a1a1a",
                          lineHeight: "1.4",
                          minHeight: "60px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textAlign: locale === "ar" ? "right" : "left"
                        }}
                      >
                        <Link href={`/${locale}/post/${data.id}`}>
                          <a 
                            className="text-decoration-none" 
                            style={{
                              color: "#1a1a1a",
                              transition: "color 0.3s ease"
                            }}
                            onMouseEnter={(e) => e.target.style.color = "#dc2626"}
                            onMouseLeave={(e) => e.target.style.color = "#1a1a1a"}
                          >
                            {getTitle(data)}
                          </a>
                        </Link>
                      </h4>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <button 
                          className="btn"
                          style={{
                            background: "linear-gradient(45deg, #dc2626, #f97316)",
                            color: "white",
                            border: "none",
                            borderRadius: "25px",
                            padding: "10px 20px",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                            boxShadow: "0 4px 12px rgba(220,38,38,0.3)"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = "scale(1.05)";
                            e.target.style.boxShadow = "0 6px 16px rgba(220,38,38,0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "scale(1)";
                            e.target.style.boxShadow = "0 4px 12px rgba(220,38,38,0.3)";
                          }}
                        >
                          {locale === "en" ? "View Details" : "عرض التفاصيل"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>

        {thirdHomeAd && (
          <div className="row">
            <div className="col-lg-12">
              <AddBanner
                img={thirdHomeAd.image_url}
                height="200"
                width="1230"
                pClass="mt--30"
              />
            </div>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        .slick-slider { 
          padding: 20px 0 50px 0;
          position: relative;
          margin: 0 -10px;
        }
        
        .slick-list {
          padding: 0 20px !important;
        }
        
        .slick-track {
          display: flex !important;
          gap: 20px !important;
        }
        
        .slick-slide {
          height: auto !important;
        }
        
        .slick-slide > div {
          height: 100%;
        }
        
        .slick-arrow {
          position: absolute !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          z-index: 100 !important;
          width: 50px !important;
          height: 50px !important;
          background: linear-gradient(45deg, #dc2626, #f97316) !important;
          border: none !important;
          border-radius: 50% !important;
          color: white !important;
          font-size: 24px !important;
          font-weight: bold !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 6px 20px rgba(220,38,38,0.3) !important;
          transition: all 0.3s ease !important;
          opacity: 1 !important;
          cursor: pointer !important;
        }
        
        .slick-arrow:hover {
          background: linear-gradient(45deg, #b91c1c, #ea580c) !important;
          transform: translateY(-50%) scale(1.1) !important;
          box-shadow: 0 8px 25px rgba(220,38,38,0.4) !important;
        }
        
        .slick-prev { 
          left: -30px !important; 
        }
        
        .slick-next { 
          right: -30px !important; 
        }
        
        .slick-dots {
          bottom: -40px !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          list-style: none !important;
          padding: 0 !important;
          margin: 20px 0 0 0 !important;
        }
        
        .slick-dots li {
          margin: 0 8px !important;
          width: 12px !important;
          height: 12px !important;
        }
        
        .slick-dots li button {
          width: 100% !important;
          height: 100% !important;
          padding: 0 !important;
          background: #e5e7eb !important;
          border: none !important;
          border-radius: 50% !important;
          transition: all 0.3s ease !important;
          cursor: pointer !important;
        }
        
        .slick-dots li button:before {
          display: none !important;
        }
        
        .slick-dots li.slick-active button {
          background: linear-gradient(45deg, #dc2626, #f97316) !important;
          transform: scale(1.3) !important;
          box-shadow: 0 2px 8px rgba(220,38,38,0.3) !important;
        }
        
        /* تحسينات للعرض العربي */
        [dir="rtl"] .slick-arrow {
          transform: translateY(-50%) scaleX(-1) !important;
        }
        
        [dir="rtl"] .slick-prev { 
          right: -30px !important; 
          left: auto !important;
        }
        
        [dir="rtl"] .slick-next { 
          left: -30px !important; 
          right: auto !important;
        }
        
        @media (max-width: 768px) {
          .slick-arrow {
            width: 40px !important;
            height: 40px !important;
            font-size: 18px !important;
          }
          .slick-prev { left: -20px !important; }
          .slick-next { right: -20px !important; }
          [dir="rtl"] .slick-prev { right: -20px !important; left: auto !important; }
          [dir="rtl"] .slick-next { left: -20px !important; right: auto !important; }
          .slider-item .featured-post { min-height: 400px; }
        }
        
        @media (max-width: 576px) {
          .slick-arrow {
            width: 35px !important;
            height: 35px !important;
            font-size: 16px !important;
          }
          .slick-prev { left: -15px !important; }
          .slick-next { right: -15px !important; }
          [dir="rtl"] .slick-prev { right: -15px !important; left: auto !important; }
          [dir="rtl"] .slick-next { left: -15px !important; right: auto !important; }
        }
      `}</style>
    </div>
  );
};

export default PostSectionEleven;