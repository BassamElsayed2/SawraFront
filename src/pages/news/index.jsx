// ✅ الكود بعد التعديلات والتنظيف

import React, { useState, useEffect, useMemo } from "react";
import HeaderOne from "../../common/elements/header/HeaderOne";
import HeadTitle from "../../common/elements/head/HeadTitle";
import { useQuery } from "@tanstack/react-query";
import { getNews } from "../../../services/apiNews";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { slugify, SortingByDate } from "../../common/utils";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getAllPosts } from "../../../lib/api";
import FooterThree from "../../common/elements/footer/FooterThree";
import GalleryOne from "../../common/gallery/GalleryOne";

export default function NewsPage({ allPosts }) {
  const router = useRouter();
  const { locale, query } = router;

  const [searchTerm, setSearchTerm] = useState(query.search || "");
  const [selectedCategory, setSelectedCategory] = useState(query.category || "all");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentPage, setCurrentPage] = useState(Number(query.page) || 1);
  const itemsPerPage = 9;

  const { data: news = [], isLoading, error } = useQuery({
    queryKey: ["news", locale],
    queryFn: getNews,
  });

  const categories = useMemo(() => {
    const unique = [
      ...new Set(news.map((item) => String(item.category?.id)))
    ].filter(Boolean);
    return ["all", ...unique];
  }, [news]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.set("search", searchTerm);
    if (selectedCategory !== "all") queryParams.set("category", selectedCategory);
    if (currentPage > 1) queryParams.set("page", currentPage);

    const newUrl = queryParams.toString()
      ? `${router.pathname}?${queryParams.toString()}`
      : router.pathname;

    router.push(newUrl, undefined, { shallow: true });
  }, [searchTerm, selectedCategory, currentPage]);

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const title = locale === "en" ? item.title_en : item.title_ar;
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" ||
        String(item.category?.id) === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [news, searchTerm, selectedCategory, locale]);

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const currentItems = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "en" ? "en-US" : "ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) return <div className="container mt-5 text-center">Loading...</div>;
  if (error) return <div className="container mt-5 text-center text-danger">{locale === "en" ? "Error loading news" : "خطأ في تحميل الأخبار"}</div>;

  return (
    <div className="news-page">
      <HeadTitle pageTitle={locale === "en" ? "News" : "الأخبار"} />
      <HeaderOne pClass="header-light header-sticky header-with-shadow" postData={allPosts} />

      <div className="container mt-5 mb-5">
      <div className="row align-items-center justify-content-center g-4 mb-5 search-filter-wrapper">
  <div className="col-lg-6 col-md-12">
    <div className="input-group input-group-lg shadow-sm">
      <span className="input-group-text bg-white border-end-0">
        <i className="fas fa-search text-muted"></i>
      </span>
      <input
        type="text"
        className="form-control border-start-0"
        placeholder={locale === "en" ? "Search for news..." : "ابحث عن الأخبار..."}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  </div>

  <div className="col-lg-4 col-md-10">
    <div className="input-group input-group-lg shadow-sm">
      <span className="input-group-text bg-white border-end-0">
        <i className="fas fa-filter text-muted"></i>
      </span>
      <select
        className="form-select border-start-0"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="all">{locale === "en" ? "All Categories" : "جميع الفئات"}</option>
        {categories.map((catId) => {
          const category = news.find((item) => String(item.category?.id) === catId)?.category;
          if (!category) return null;
          return (
            <option key={catId} value={catId}>
              {locale === "en" ? category.name_en : category.name_ar}
            </option>
          );
        })}
      </select>
    </div>
  </div>
</div>

dede
        <div className="row g-4">
          {currentItems.map((item) => (
            <div key={item.id} className="col-md-4">
              <div className="card h-100" onMouseEnter={() => setHoveredCard(item.id)} onMouseLeave={() => setHoveredCard(null)}>
                {item.images?.[0] && (
                  <div className="position-relative" style={{ height: 200 }}>
                    <Image
                      src={item.images[0]}
                      alt={locale === "en" ? item.title_en : item.title_ar}
                      layout="fill"
                      objectFit="cover"
                    />
                    <span className="badge bg-primary position-absolute top-0 end-0 m-2">
                      {locale === "en" ? item.category?.name_en : item.category?.name_ar}
                    </span>
                  </div>
                )}
                <div className="card-body">
                  <h5 className="card-title">
                    <Link href={`/${locale}/post/${item.id}`} scroll={false}>{locale === "en" ? item.title_en : item.title_ar}</Link>
                  </h5>
                  <p className="card-text text-muted">
                    <i className="far fa-calendar-alt me-2 ms-2"></i>
                    {formatDate(item.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="mt-4">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  {locale === "en" ? "Previous" : "السابق"}
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <li key={num} className={`page-item ${currentPage === num ? "active" : ""}`}>
                  <button className="page-link" onClick={() => handlePageChange(num)}>{num}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                  {locale === "en" ? "Next" : "التالي"}
                </button>
              </li>
            </ul>
          </nav>
        )}

        {filteredNews.length === 0 && (
          <div className="text-center mt-5 py-5">
            <i className="fas fa-newspaper fa-3x text-muted mb-3"></i>
            <h3 className="text-muted">
              {locale === "en" ? "No news found" : "لم يتم العثور على أخبار"}
            </h3>
          </div>
        )}
      </div>

      <GalleryOne />
      <FooterThree />
    </div>
  );
}


export async function getStaticProps({ locale }) {
  const allPosts = getAllPosts([
    "postFormat", "title", "featureImg", "featured", "date",
    "slug", "pCate", "cate", "cate_img", "author_img",
    "author_name", "post_views", "read_time", "author_social",
  ]);

  SortingByDate(allPosts);
  return {
    props: {
      allPosts,
      ...(await serverSideTranslations(locale, ["common"]))
    }
  };
}
