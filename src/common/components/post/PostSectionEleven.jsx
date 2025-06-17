import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Tab from "react-bootstrap/Tab";
import Nav from "react-bootstrap/Nav";
import { SectionTitleOne } from "../../elements/sectionTitle/SectionTitle";
import { slugify } from "../../utils";
import PostLayoutThree from "./layout/PostLayoutThree";

import WidgetVideoPost from "../sidebar/WidgetVideoPost";

import { useQuery } from "@tanstack/react-query";
import { getNews } from "../../../../services/apiNews";
import { useLocale } from "next-intl";
import { getAds } from "../../../../services/apiAds";
import AddBanner from "../ad-banner/AddBanner";

const PostSectionEleven = ({ filters = [] }) => {
  const locale = useLocale();
  const defaultActiveCat =
    filters.length > 0 ? slugify(filters[0].cate) : "all";

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

  const [activeNav, setActiveNav] = useState(defaultActiveCat);
  const [tabPostData, setTabPostData] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!Array.isArray(fetchedPosts) || fetchedPosts.length === 0) return;

    const extracted = [
      ...new Set(
        fetchedPosts.map((post) => String(post.category?.id)).filter(Boolean)
      ),
    ];
    setCategories(["all", ...extracted]);

    if (!activeNav) {
      setActiveNav("all");
    }
  }, [fetchedPosts, activeNav]);

  useEffect(() => {
    if (!Array.isArray(fetchedPosts) || fetchedPosts.length === 0) return;

    let filtered = [];

    if (activeNav === "all") {
      filtered = fetchedPosts;
    } else {
      filtered = fetchedPosts.filter(
        (post) => String(post.category?.id) === activeNav
      );
    }

    setTabPostData(filtered);
  }, [fetchedPosts, activeNav]);

  const homeAds = ads?.filter((ad) => ad.location === "home") || [];
  const thirdHomeAd = homeAds[2];

  const getImageSrc = (img) => {
    if (Array.isArray(img)) return img[0] || "";
    if (typeof img === "string") return img;
    return "";
  };

  const renderCategoryName = (category) => {
    if (!category) return "Normal";
    return locale === "en" ? category.name_en : category.name_ar;
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data.</p>;

  return (
    <div className="axil-post-grid-area axil-section-gapTop bg-color-grey">
      <div className="container">
        <SectionTitleOne
          title={locale === "en" ? "Previous News" : "الأخبار السابقة"}
        />

        <div className="row">
          <div className="col-lg-12">
            <Tab.Container id="axilTab" activeKey={activeNav}>
              <Nav className="axil-tab-button nav nav-tabs mt--20">
                {categories.map((catId) => {
                  const categoryObj = fetchedPosts.find(
                    (post) => String(post.category?.id) === String(catId)
                  )?.category;

                  const label =
                    catId === "all"
                      ? locale === "en"
                        ? "All"
                        : "الكل"
                      : locale === "en"
                      ? categoryObj?.name_en
                      : categoryObj?.name_ar;

                  return (
                    <Nav.Item key={catId}>
                      <Nav.Link
                        eventKey={catId}
                        onClick={() => setActiveNav(String(catId))}
                      >
                        {label}
                      </Nav.Link>
                    </Nav.Item>
                  );
                })}
              </Nav>

              <Tab.Content>
                <Tab.Pane eventKey={activeNav}>
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="row">
                        {tabPostData.slice(0, 2).map((data) => (
                          <div className="col-lg-6" key={data.id}>
                            <div className="featured-post mt--30">
                              <div className="content-block">
                                <div className="post-content">
                                  <div className="post-cat">
                                    <div className="post-cat-list">
                                      <Link
                                        href={`/${locale}/news?category=${data?.category.id}`}
                                      >
                                        <a className="hover-flip-item-wrapper">
                                          <span className="hover-flip-item">
                                            <span
                                              data-text={
                                                locale === "en"
                                                  ? data.category?.name_en
                                                  : data.category?.name_ar
                                              }
                                            >
                                              {locale === "en"
                                                ? data.category?.name_en
                                                : data.category?.name_ar}
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
                                </div>

                                <div className="post-thumbnail">
                                  <Link href={`/${locale}/post/${data.id}`}>
                                    <a>
                                      <Image
                                        src={getImageSrc(data.images)}
                                        alt={
                                          locale === "en"
                                            ? data.title_en
                                            : data.title_ar
                                        }
                                        height={338}
                                        width={600}
                                        priority
                                        style={{
                                          objectFit: "cover",
                                        }}
                                      />
                                    </a>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-lg-8 col-xl-8 mt--30">
                      <PostLayoutThree
                        dataPost={tabPostData}
                        postStart={2}
                        show={3}
                        bgColor="with-bg-solid"
                      />
                    </div>

                    <div className="col-lg-4 col-xl-4 mt--30 mt_md--40 mt_sm--40">
                      <div className="sidebar-inner">
                        <WidgetVideoPost postData={fetchedPosts} />
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
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
    </div>
  );
};

export default PostSectionEleven;
