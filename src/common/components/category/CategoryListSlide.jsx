import Link from "next/link";
import Image from "next/image";
import { SectionTitleTwo } from "../../elements/sectionTitle/SectionTitle";
import { removeDuplicates, slugify } from "../../utils";
import Slider from "react-slick";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../../../services/apicatogry";
import { useLocale } from "next-intl";

const CategoryListSlide = ({ cateData }) => {
  const uniqueCategory = removeDuplicates(cateData, "cate");
  const locale = useLocale();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  function SlickNextArrow(props) {
    const { className, onClick } = props;
    return (
      <button className={`slide-arrow next-arrow ${className}`} onClick={onClick}>
        <i className="fal fa-arrow-right"></i>
      </button>
    );
  }

  function SlickPrevArrow(props) {
    const { className, onClick } = props;
    return (
      <button className={`slide-arrow prev-arrow ${className}`} onClick={onClick}>
        <i className="fal fa-arrow-left"></i>
      </button>
    );
  }

  const slideSettings = {
    infinite: true,
    slidesToShow: 6,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    adaptiveHeight: true,
    nextArrow: <SlickNextArrow />,
    prevArrow: <SlickPrevArrow />,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  return (
    <div className="axil-categories-list axil-section-gap bg-color-white">
      <div className="container">
      <SectionTitleTwo
  title={locale === "ar" ? "التصنيفات" : "Categories"}
  btnText={locale === "ar" ? "عرض الكل" : "See All Topics"}
  btnUrl={`/${locale}/news`}
  btnClass="custom-see-all-btn"
/>

        <div className="row">
          <div className="col-lg-12">
            <Slider
              {...slideSettings}
              className="list-categories categories-activation axil-slick-arrow arrow-between-side"
            >
              {categories?.map((data, index) => (
                <div className="single-cat" key={index}>
                  <div
                    className="inner text-center p-3"
                    style={{
                      background: "linear-gradient(45deg, #fca5a5, #fdba74)",
                      borderRadius: "1rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <Link href={`/${locale}/news?category=${data.id}`}>
                      <a>
                        <div className="thumbnail mb-3">
                          <Image
                            src={data.image_url}
                            alt={data.name_en}
                            height={120}
                            width={120}
                            className="rounded-circle"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="content">
                          <h5
                            className="title"
                            style={{
                              color: "white",
                              fontSize: "1.6rem",
                              fontWeight: "bold",
                            }}
                          >
                            {locale === "ar" ? data.name_ar : data.name_en}
                          </h5>
                        </div>
                      </a>
                    </Link>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryListSlide;
