import Link from "next/link";
import Image from "next/image";
import Slider from "react-slick";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { SectionTitleTwo } from "../../elements/sectionTitle/SectionTitle";
import { getCategories } from "../../../../services/apicatogry";

const CategoryListSlide = () => {
  const locale = useLocale();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Custom Arrow Components
  const SlickNextArrow = ({ onClick }) => (
    <button
      className="slick-arrow slick-next"
      onClick={onClick}
      style={{
        position: "absolute",
        right: "-15px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 10,
        background: "#fff",
        border: "none",
        borderRadius: "50%",
        width: "35px",
        height: "35px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      }}
    >
      <i className="fas fa-chevron-right" style={{ color: "#8b0000" }}></i>
    </button>
  );

  const SlickPrevArrow = ({ onClick }) => (
    <button
      className="slick-arrow slick-prev"
      onClick={onClick}
      style={{
        position: "absolute",
        left: "-15px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 10,
        background: "#fff",
        border: "none",
        borderRadius: "50%",
        width: "35px",
        height: "35px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      }}
    >
      <i className="fas fa-chevron-left" style={{ color: "#8b0000" }}></i>
    </button>
  );

  // Slider Settings
  const slideSettings = {
    infinite: true,
    slidesToShow: 6,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    adaptiveHeight: true,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <SlickNextArrow />,
    prevArrow: <SlickPrevArrow />,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 5 } },
      { breakpoint: 992, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 576, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <section
      className="py-5"
      style={{
        backgroundColor: "rgb(139, 0, 0)",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div className="container">
        <SectionTitleTwo
          title={locale === "ar" ? "التصنيفات" : "CATEGORIES"}
          btnText={locale === "ar" ? "عرض الكل" : "See All Topics"}
          btnUrl={`/${locale}/news`}
        />
      </div>
      <div style={{width: "100%", padding: 0, margin: 0}}>
        <Slider {...slideSettings}>
          {categories?.map((cat) => (
            <div key={cat.id} className="px-2">
              <Link href={`/${locale}/news?category=${cat.id}`} passHref>
                <a className="text-decoration-none">
                  <div
                    className="card border-0 h-100 category-card-hover"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      transition: "0.3s",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      borderRadius: "10px",
                      border: "2px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = "2px solid yellow";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = "2px solid transparent";
                    }}
                  >
                    <div className="d-flex flex-column align-items-center p-4 text-center">
                      <div className="mb-3">
                        <Image
                          src={cat.image_url}
                          alt={locale === "ar" ? cat.name_ar : cat.name_en}
                          width={100}
                          height={100}
                          className="rounded"
                        />
                      </div>
                      <h5
                        className="mb-0"
                        style={{
                          color: "#fff",
                          fontSize: "18px",
                          fontWeight: "bold",
                        }}
                      >
                        {locale === "ar" ? cat.name_ar : cat.name_en}
                      </h5>
                    </div>
                  </div>
                </a>
              </Link>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default CategoryListSlide;
