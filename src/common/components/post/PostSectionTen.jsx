"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Tab } from "react-bootstrap";
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
  const [fadeIn, setFadeIn] = useState(false);

  const locale = useLocale();
  const { t } = useTranslation("common");

  useEffect(() => {
    if (!Array.isArray(postData) || postData.length === 0) return;
    const extracted = [...new Set(postData.map((post) => post.category?.id).filter(Boolean))];
    setCategories(["all", ...extracted]);
    if (!activeNav) setActiveNav("all");
  }, [postData]);

  useEffect(() => {
    if (!Array.isArray(postData) || postData.length === 0) return;
    const filtered = activeNav === "all" ? postData : postData.filter((post) => post.category?.id === activeNav);
    setTabPostData(filtered);
    setHoveredPost(filtered[0]);
  }, [postData, activeNav]);

  useEffect(() => {
    if (!hoveredPost) return;
    setFadeIn(false);
    const timeout = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timeout);
  }, [hoveredPost]);

  if (isLoading) return <p>loading...</p>;

  const getImageSrc = (img) => Array.isArray(img) ? img[0] || "" : typeof img === "string" ? img : "";

  const getSnippet = (text = "", length = 50) => {
    const cleanText = text.replace(/<[^>]+>/g, "");
    if (cleanText.length <= length) return cleanText;
    const lastSpace = cleanText.lastIndexOf(" ", length);
    return cleanText.slice(0, lastSpace > 0 ? lastSpace : length) + "...";
  };

  return (
    <div className="axil-post-grid-area axil-section-gap bg-color-white">
{/* اخر الأخبار */}     
 <div className="container">
        <SectionTitleOne title={t("sectionTitle")} />
        <div className="row">
          <div className="col-lg-12">
            <Tab.Container id="axilTab" activeKey={activeNav} onSelect={(k) => setActiveNav(k)}>
              <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
                {categories.map((catId, i) => {
                  const category = postData.find(post => post.category?.id === catId)?.category;
                  const label = catId === "all" ? (locale === "en" ? "All" : "الكل") : (locale === "en" ? category?.name_en : category?.name_ar);
                  return (
                    <button
                      key={i}
                      className={`btn-category w-auto${activeNav === catId ? " active" : ""}`}
                      style={{
                        fontSize: "1.6rem",
                        padding: "0.75rem 2rem",
                        fontWeight: "bold",
                        borderRadius: "2rem",
                        color: "black",
                      }}
                      onClick={() => setActiveNav(catId)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <Tab.Content className="grid-tab-content mt--10">
                <Tab.Pane className="single-post-grid" eventKey={activeNav}>
                  <div className="row mt--40">
                    {/* كروت على الشمال */}
                    <div className="col-xl-5 col-lg-6 col-md-12 col-12">
                      {tabPostData?.slice(-5).map((data) => (
                        data?.id ? (
                          <div
                            key={data.id}
                            className="content-block post-medium post-medium-border border-thin d-flex gap-3 p-3 mb-3 text-white transition-transform duration-300 hover:scale-[1.02]"
                            style={{
                              background: "linear-gradient(45deg,rgba(252, 165, 165, 0.65),rgba(253, 187, 116, 0.47))",
                              borderRadius: "1rem",
                              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                              cursor: "pointer",
                            }}
                            onMouseEnter={() => setHoveredPost(data)}
                          >
                            <div className="post-thumbnail transition-transform duration-300 hover:scale-105">
                              <Link href={`/${locale}/post/${data.id}`}>
                                <Image
                                  src={getImageSrc(data.images)}
                                  alt={locale === "en" ? data.title_en : data.title_ar}
                                  height={100}
                                  width={100}
                                  className="rounded"
                                />
                              </Link>
                            </div>
                            <div className="post-content" style={{ color: "black" }}>
                              <div className="post-cat mb-1">
                                {data?.category?.id && (
                                  <Link href={`/${locale}/news?category=${data.category.id}`} className="inline-block">
                                    <span
                                      className="hover-flip-item px-3 py-1 text-white"
                                      style={{
                                        background: "linear-gradient(45deg, #dc2626, #f97316)",
                                        borderRadius: "9999px",
                                        fontSize: "0.9rem",
                                        mixBlendMode: "overlay",
                                      }}
                                    >
                                      {locale === "en" ? data.category.name_en : data.category.name_ar}
                                    </span>
                                  </Link>
                                )}
                              </div>
                              <h4 className="title transition-transform duration-300 hover:scale-105">
                                <Link href={`/${locale}/post/${data.id}`} className="text-black hover:text-yellow-200" style={{ fontWeight: "bold" }}>
                                  {locale === "en" ? data.title_en : data.title_ar}
                                </Link>
                              </h4>
                              <div className="product-price-box mt-2">
                                <div className="price-blur fs-6">
                                  <span className="price-current text-success fw-bold">
                                    {locale === "en" ? "50 EGP" : "٥٠ ج.م"}
                                  </span>
                                </div>
                              </div>
                              <p className="text-black" style={{ opacity: 0.9 }}>
                                {getSnippet(locale === "en" ? data.content_en : data.content_ar)}
                              </p>
                            </div>
                          </div>
                        ) : null
                      ))}
                    </div>

                    {/* بوست كبير على اليمين */}
                    <div className="col-xl-7 col-lg-6 col-md-12 col-12 mt_md--40 mt_sm--40">
                      <div
                        key={hoveredPost?.id}
                        className="content-block post-grid post-grid-transparent p-3"
                        style={{
                          borderRadius: "1rem",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          opacity: fadeIn ? 1 : 0,
                          transition: "opacity 1.5s cubic-bezier(0.4,0,0.2,1)",
                        }}
                      >
                        {getImageSrc(hoveredPost?.images) && hoveredPost?.id && (
                          <div className="post-thumbnail mb-3 transition-transform duration-500 hover:scale-105">
                            <Link href={`/${locale}/post/${hoveredPost.id}`}>
                              <Image
                                src={getImageSrc(hoveredPost.images)}
                                alt={locale === "en" ? hoveredPost.title_en : hoveredPost.title_ar}
                                height={500}
                                width={705}
                                className="rounded"
                              />
                            </Link>
                          </div>
                        )}
                        <div className="post-grid-content">
                          <div className="post-content" style={{ color: "white" }}>
                            <div className="post-cat mb-2">
                              {hoveredPost?.category?.id && (
                                <Link href={`/${locale}/news?category=${hoveredPost.category.id}`} className="inline-block">
                                  <span
                                    className="hover-flip-item px-3 py-1 text-white"
                                    style={{
                                      background: "linear-gradient(45deg, #dc2626, #f97316)",
                                      borderRadius: "9999px",
                                      fontSize: "1rem",
                                      mixBlendMode: "overlay",
                                    }}
                                  >
                                    {locale === "en" ? hoveredPost.category.name_en : hoveredPost.category.name_ar}
                                  </span>
                                </Link>
                              )}
                            </div>
                            <h3 className="title transition-transform duration-500 hover:scale-105">
                              {hoveredPost?.id ? (
                                <Link href={`/${locale}/post/${hoveredPost.id}`} className="text-white hover:text-yellow-200" style={{ fontWeight: "bold" }}>
                                  {locale === "en" ? hoveredPost.title_en : hoveredPost.title_ar}
                                </Link>
                              ) : (
                                locale === "en" ? hoveredPost?.title_en : hoveredPost?.title_ar
                              )}
                            </h3>
                            
                            {/* إضافة السعر */}
                            <div className="product-price-box mt-3">
                              <div className="price-blur fs-4">
                                <span className="price-current text-success fw-bold">
                                  {locale === "en" ? "50 EGP" : "٥٠ ج.م"}
                                </span>
                              </div>
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
