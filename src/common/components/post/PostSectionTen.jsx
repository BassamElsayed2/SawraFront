"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Tab, Nav } from "react-bootstrap";

import { getNews } from "../../../../services/apiNews";
import { SectionTitleOne } from "../../elements/sectionTitle/SectionTitle";
import { useTranslation } from "react-i18next";

const PostSectionTen = () => {
  const {
    data: postData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["news"],
    queryFn: getNews,
  });

  const [activeNav, setActiveNav] = useState("");
  const [tabPostData, setTabPostData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hoveredPost, setHoveredPost] = useState(null);
  const [fade, setFade] = useState(true);

  const locale = useLocale();
  const { t } = useTranslation("common");

  useEffect(() => {
    if (!Array.isArray(postData) || postData.length === 0) return;

    const extracted = [
      ...new Set(postData.map((post) => post.category?.id).filter(Boolean)),
    ];
    setCategories(["all", ...extracted]);

    if (!activeNav) {
      setActiveNav("all");
    }
  }, [postData]);

  useEffect(() => {
    if (!Array.isArray(postData) || postData.length === 0) return;

    let filtered = [];

    if (activeNav === "all") {
      filtered = postData;
    } else {
      filtered = postData.filter((post) => post.category?.id === activeNav);
    }

    setTabPostData(filtered);
  }, [postData, activeNav]);

  const firstPost = hoveredPost || tabPostData[0];

  if (isLoading) return <p>loading...</p>;

  const getImageSrc = (img) => {
    if (Array.isArray(img)) return img[0] || "";
    if (typeof img === "string") return img;
    return "";
  };

  const renderCategoryName = (category) => {
    if (!category) return "Normal";
    return locale === "en" ? category.name_en : category.name_ar;
  };

  const getSnippet = (text = "", length = 50) => {
    const cleanText = text.replace(/<[^>]+>/g, "");
    if (cleanText.length <= length) return cleanText;
    const lastSpace = cleanText.lastIndexOf(" ", length);
    return cleanText.slice(0, lastSpace > 0 ? lastSpace : length) + "...";
  };

  return (
    <div
      className="axil-post-grid-area axil-section-gap bg-color-white position-relative"
      style={{
        backgroundColor: "#8b0000",
      }}
    >
      <img
        src="/images/Rectangle.png"
        alt="Rectangle"
        style={{
          position: "absolute",
          top: -60,
          left: 0,
          right: 0,
          bottom: 0,
          height: 1200,
        }}
      />
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <SectionTitleOne title={t("sectionTitle")} />
        <div className="row">
          {/*Latest News*/}
          <div className="col-lg-12">
            <Tab.Container
              id="axilTab"
              activeKey={activeNav}
              onSelect={(k) => setActiveNav(k)}
            >
              <Nav className="axil-tab-button semi-transparent-tab nav nav-tabs mt--20 custom-nav">
                {categories.map((catId, i) => (
                  <Nav.Item key={i}>
                    <Nav.Link eventKey={catId} className="custom-tab">
                      {catId === "all"
                        ? locale === "en"
                          ? "All"
                          : "الكل"
                        : renderCategoryName(
                            postData.find(
                              (post) => post.category?.id === catId
                            )?.category
                          )}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>

              <Tab.Content className="grid-tab-content mt--10">
                <Tab.Pane className="single-post-grid" eventKey={activeNav}>
                  <div className="row mt--40">
                    <div className="col-xl-5 col-lg-6 col-md-12 col-12">
                      {tabPostData.slice(-5).map((data, index) => (
                        <div
                          className="content-block post-medium post-medium-border border-thin category-card-hover mb-5"
                          key={data.id}
                          onMouseEnter={() => {
                            setFade(false);
                            setTimeout(() => {
                              setHoveredPost(data);
                              setFade(true);
                            }, 100); // slight delay for smooth effect
                          }}
                          onMouseLeave={() => {
                            setFade(false);
                            setTimeout(() => {
                              setHoveredPost(null);
                              setFade(true);
                            }, 100);
                          }}
                        >
                          <div className="post-thumbnail">
                            <Link href={`/${locale}/post/${data.id}`}>
                              <a>
                                {getImageSrc(data.images) ? (
                                  <Image
                                    src={getImageSrc(data.images)}
                                    alt={
                                      locale === "en"
                                        ? data.title_en
                                        : data.title_ar
                                    }
                                    height={160}
                                    width={110}
                                    priority={true}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "100px",
                                      height: "100px",
                                      backgroundColor: "#ccc",
                                    }}
                                  />
                                )}
                              </a>
                            </Link>
                          </div>
                          <div className="post-content mr--10">
                            <div className="post-cat">
                              <div className="post-cat-list">
                                <Link
                                  href={`/${locale}/news?category=${data?.category?.id}`}
                                >
                                  <a
                                    className="hover-flip-item-wrapper"
                                    style={{ color: "#CC9D2F", fontSize: 15 }}
                                  >
                                    {locale === "en" ? "New🔥" : "جديد🔥"}
                                  </a>
                                </Link>
                              </div>
                              <div className="product-price-box mt-3 ">
                                <div className="price-blur fs-4 ">
                                  <span className="price-current ">
                                    {locale === "en"
                                      ? ` ${data.price - data.offers} EGP`
                                      : ` ${data.price - data.offers} ج.م`}
                                  </span>
                                  <span className="price-old ms-3">
                                    {locale === "en"
                                      ? ` ${data.price} EGP`
                                      : ` ${data.price} ج.م`}
                                  </span>
                                  <span
                                    className="discount-badge ms-2"
                                    style={{
                                      color: "#cc9d2f",
                                      padding: "2px 6px",
                                      borderRadius: "3px",
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {locale === "en"
                                      ? `${Math.round(
                                          (data.offers / data.price) * 100
                                        )}% OFF`
                                      : `خصم ${Math.round(
                                          (data.offers / data.price) * 100
                                        )}٪`}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <h4 className="title category-title" style={{ color: "#fff" }}>
                              <Link href={`/${locale}/post/${data.id}`}>
                                <a>
                                  {locale === "en"
                                    ? data.title_en
                                    : data.title_ar}
                                </a>
                              </Link>
                            </h4>
                            <div className="content">
                              <p style={{ color: "#fff" }}>
                                {getSnippet(
                                  locale === "en"
                                    ? data.content_en
                                    : data.content_ar
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="col-xl-7 col-lg-6 col-md-12 col-12 mt_md--40 mt_sm--40">
  <div
    className={`content-block post-grid post-grid-transparent fade-transition category-card-hover ${
      fade ? "" : "hidden"
    }`}
  >
    {getImageSrc(firstPost?.images) && (
      <div className="post-thumbnail">
        <Link href={`/${locale}/post/${firstPost?.id}`}>
          <a>
            <Image
              src={getImageSrc(firstPost?.images)}
              alt={
                locale === "en" ? firstPost?.title_en : firstPost?.title_ar
              }
              height={710}
              width={705}
              priority={true}
            />
          </a>
        </Link>
      </div>
    )}

    <div className="post-grid-content">
      <div className="post-content">

        {/* 👇 التصنيف - الكاتيجوري فوق السعر عادي مش في المنتصف */}
        <div className="post-cat-list mb-2">
          <Link href={`/${locale}/news?category=${firstPost?.category.id}`}>
            <a
              style={{
                backgroundColor: "rgba(255, 0, 0, 0.8)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "bold",
                display: "inline-block",
              }}
            >
              {locale === "en"
                ? firstPost?.category?.name_en
                : firstPost?.category?.name_ar}
            </a>
          </Link>
        </div>

        {/* 👇 السعر والخصم */}
        <div className="product-price-box mt-3">
          <div className="price-blur fs-4">
            <span className="price-current" style={{ color: "#fff" }}>
              {locale === "en"
                ? `${firstPost?.price - firstPost?.offers} EGP`
                : `${firstPost?.price - firstPost?.offers} ج.م`}
            </span>
            <span className="price-old ms-3" style={{ color: "#ddd" }}>
              {locale === "en"
                ? `${firstPost?.price} EGP`
                : `${firstPost?.price} ج.م`}
            </span>
            <span
              className="discount-badge ms-2"
              style={{
                color: "#cc9d2f",
                padding: "2px 6px",
                borderRadius: "3px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {locale === "en"
                ? `${Math.round(
                    (firstPost?.offers / firstPost?.price) * 100
                  )}% OFF`
                : `خصم ${Math.round(
                    (firstPost?.offers / firstPost?.price) * 100
                  )}٪`}
            </span>
          </div>
        </div>

        {/* 👇 العنوان */}
        <h3 className="title category-title" style={{ color: "#fff" }}>
          <Link href={`/${locale}/post/${firstPost?.id}`}>
            <a>
              {locale === "en"
                ? firstPost?.title_en
                : firstPost?.title_ar}
            </a>
          </Link>
        </h3>

        {/* 👇 الوصف */}
        <div className="content">
          <p style={{ color: "#fff" }}>
            {getSnippet(
              locale === "en"
                ? firstPost?.content_en
                : firstPost?.content_ar,
              120 // length for larger description
            )}
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
 </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostSectionTen;
