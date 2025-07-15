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

  const { data: postData, isLoading: isLoadingNews } = useQuery({
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
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      nextArrow: <SlickNextArrow />,
      prevArrow: <SlickPrevArrow />,
    };

    return (
      <Slider {...slideSettings} className="post-gallery-activation axil-slick-arrow arrow-between-side">
        {Array.isArray(details?.image_urls) &&
          details.image_urls.map((data) => (
            <div className="post-images" key={data}>
<div className="gallery-image-wrapper">
  <Image
    src={data}
    alt={details?.title_en}
    height={500}
    width={810}
    priority
    className="gallery-image"
  />
  <div className="gallery-overlay">
    <h3 className="gallery-title">
      {locale === "ar" ? details?.title_ar : details?.title_en}
    </h3>
    <p className="gallery-price">
      {details?.price ? `${details?.price} EGP` : ""}
    </p>
  </div>
</div>
            </div>
          ))}
      </Slider>
    );
  };

  if (isLoadingPost) {
    return <div className="text-center py-5">Loading gallery...</div>;
  }

  if (!details) {
    return <div className="text-center py-5">No gallery found.</div>;
  }

  return (
    <>
      <HeadTitle pageTitle={locale === "en" ? "Gallery" : "\u0645\u0639\u0631\u0636 \u0627\u0644\u0635\u0648\u0631"}  />
      <HeaderOne pClass="header-light header-sticky header-with-shadow" />
      <div className="post-single-wrapper gallery-background axil-section-gap">
      <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <PostMetaTwo metaData={details} />
              <div className="axil-post-details">
                {details?.image_urls && <SlideGallery />}
                <div
                  className="post-details-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      locale === "en"
                        ? details?.description_en || ""
                        : details?.description_ar || "",
                  }}
                ></div>
              </div>
            </div>
            {/* <div className="col-lg-4">
              {!isLoadingNews && <SidebarOne dataPost={postData} />}
            </div> */}
          </div>

          {otherads?.length > 0 && (
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