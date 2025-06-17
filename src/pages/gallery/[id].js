import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getGalleriesById } from "../../../services/apiGalleries";
import HeadTitle from "../../common/elements/head/HeadTitle";
import HeaderOne from "../../common/elements/header/HeaderOne";
import FooterThree from "../../common/elements/footer/FooterThree";
import PostMetaTwo from "../../common/components/post/format/element/PostMetaTwo";
import Image from "next/image";
import Slider from "react-slick";
import SidebarOne from "../../common/components/sidebar/SidebarOne";

import { getNews } from "../../../services/apiNews";

import { getAds } from "../../../services/apiAds";
import AddBanner from "../../common/components/ad-banner/AddBanner";

export default function GalleryDetailsPage() {
  const { query, locale } = useRouter();
  const { id } = query;

  const { data: details, isLoading: isLoadingPost } = useQuery({
    queryKey: ["gallery", id],
    queryFn: () => getGalleriesById(id),
    enabled: !!id,
  });

  const { data: postData } = useQuery({
    queryKey: ["news"],
    queryFn: getNews,
  });

  const { data: ads } = useQuery({
    queryKey: ["ads"],
    queryFn: getAds,
  });

  const otherads = ads?.filter((ad) => ad.location === "other");

  const SlideGallery = () => {
    function SlickNextArrow(props) {
      const { className, onClick } = props;
      return (
        <button
          className={`slide-arrow next-arrow ${className}`}
          onClick={onClick}
        >
          <i className="fal fa-arrow-right"></i>
        </button>
      );
    }

    function SlickPrevArrow(props) {
      const { className, onClick } = props;
      return (
        <button
          className={`slide-arrow prev-arrow ${className}`}
          onClick={onClick}
        >
          <i className="fal fa-arrow-left"></i>
        </button>
      );
    }

    const slideSettings = {
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      nextArrow: <SlickNextArrow />,
      prevArrow: <SlickPrevArrow />,
    };
    return (
      <Slider
        {...slideSettings}
        className="post-gallery-activation axil-slick-arrow arrow-between-side"
      >
        {details?.image_urls.map((data, index) => (
          <div className="post-images" key={index}>
            <Image
              src={data}
              alt={details?.title_en}
              height={500}
              width={810}
              priority={true}
            />
          </div>
        ))}
      </Slider>
    );
  };

  return (
    <>
      <HeadTitle pageTitle={locale === "en" ? "Gallery" : "معرض الصور"} />
      <HeaderOne pClass="header-light header-sticky header-with-shadow" />
      <div className="post-single-wrapper axil-section-gap bg-color-white">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <PostMetaTwo metaData={details} />
              <div className="axil-post-details">
                {details?.image_urls ? <SlideGallery /> : ""}
                <div
                  className="post-details-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      locale === "en"
                        ? details?.description_en
                        : details?.description_ar,
                  }}
                ></div>
              </div>
            </div>
            <div className="col-lg-4">
              <SidebarOne dataPost={postData} />
            </div>
          </div>
          {otherads && (
            <div className="row">
              <div className="col-lg-12">
                <AddBanner
                  img={otherads[0].image_url}
                  height="200"
                  width="1230"
                  pClass="mt--30"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <FooterThree />
    </>
  );
}
