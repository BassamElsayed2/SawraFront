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

  if (isLoading) return <p>loading...</p>;

  const firstPost = tabPostData[0];

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
    <div className="axil-post-grid-area axil-section-gap bg-color-white">
      <div className="container">
        <SectionTitleOne title={t("sectionTitle")} />
        <div className="row">
          <div className="col-lg-12">
            <Tab.Container
              id="axilTab"
              activeKey={activeNav}
              onSelect={(k) => setActiveNav(k)}
            >
              <Nav className="axil-tab-button nav nav-tabs mt--20">
                {categories.map((catId, i) => (
                  <Nav.Item key={i}>
                    <Nav.Link eventKey={catId}>
                      {catId === "all"
                        ? locale === "en"
                          ? "All"
                          : "الكل"
                        : renderCategoryName(
                            postData.find((post) => post.category?.id === catId)
                              ?.category
                          )}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>

              <Tab.Content className="grid-tab-content mt--10">
                <Tab.Pane className="single-post-grid" eventKey={activeNav}>
                  <div className="row mt--40">
                    <div className="col-xl-5 col-lg-6 col-md-12 col-12">
                      {tabPostData.slice(-5).map((data) => (
                        <div
                          className="content-block post-medium post-medium-border border-thin"
                          key={data.id}
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
                                    height={100}
                                    width={100}
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
                                  <a className="hover-flip-item-wrapper">
                                    <span className="hover-flip-item">
                                      <span
                                        data-text={
                                          locale === "en"
                                            ? data?.category?.name_en
                                            : data?.category?.name_ar
                                        }
                                      >
                                        {locale === "en"
                                          ? data?.category?.name_en
                                          : data?.category?.name_ar}
                                      </span>
                                    </span>
                                  </a>
                                </Link>
                              </div>
                            </div>
                            <h4 className="title">
                              <Link href={`/${locale}/post/${data.id}`}>
                                <a>
                                  {locale === "en"
                                    ? data.title_en
                                    : data.title_ar}
                                </a>
                              </Link>
                            </h4>

                            <div className="content">
                              <p>
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
                      <div className="content-block content-block post-grid post-grid-transparent">
                        {getImageSrc(firstPost?.images) && (
                          <div className="post-thumbnail">
                            <Link href={`/${locale}/post/${firstPost?.id}`}>
                              <a>
                                <Image
                                  src={getImageSrc(firstPost?.images)}
                                  alt={
                                    locale === "en"
                                      ? firstPost?.title_en
                                      : firstPost?.title_ar
                                  }
                                  height={660}
                                  width={705}
                                  priority={true}
                                />
                              </a>
                            </Link>
                          </div>
                        )}
                        <div className="post-grid-content">
                          <div className="post-content">
                            <div className="post-cat">
                              <div className="post-cat-list">
                                <Link
                                  href={`/${locale}/news?category=${firstPost?.category.id}`}
                                >
                                  <a className="hover-flip-item-wrapper">
                                    <span className="hover-flip-item">
                                      <span
                                        data-text={
                                          locale === "en"
                                            ? firstPost?.category?.name_en
                                            : firstPost?.category?.name_ar
                                        }
                                      >
                                        {locale === "en"
                                          ? firstPost?.category?.name_en
                                          : firstPost?.category?.name_ar}
                                      </span>
                                    </span>
                                  </a>
                                </Link>
                              </div>
                            </div>
                            <h3 className="title">
                              <Link href={`/${locale}/post/${firstPost?.id}`}>
                                <a>
                                  {locale === "en"
                                    ? firstPost?.title_en
                                    : firstPost?.title_ar}
                                </a>
                              </Link>
                            </h3>
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
