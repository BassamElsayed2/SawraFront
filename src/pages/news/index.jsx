import React, { useState, useEffect } from "react";
import HeaderOne from "../../common/elements/header/HeaderOne";
import HeadTitle from "../../common/elements/head/HeadTitle";
import { useQuery } from "@tanstack/react-query";
import { getNews } from "../../../services/apiNews";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { slugify } from "../../common/utils";
import { SortingByDate } from "../../common/utils";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getAllPosts } from "../../../lib/api";
import FooterThree from "../../common/elements/footer/FooterThree";
import GalleryOne from "../../common/gallery/GalleryOne";

export default function NewsPage({ allPosts }) {
  const router = useRouter();
  const { locale, query } = router;
  const [searchTerm, setSearchTerm] = useState(query.search || "");
  const [selectedCategory, setSelectedCategory] = useState(
    query.category || "all"
  );
  const [categories, setCategories] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // عدد العناصر في كل صفحة

  const {
    data: news = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["news"],
    queryFn: getNews,
  });

  useEffect(() => {
    if (news.length > 0) {
      const uniqueCategories = [
        ...new Set(news.map((item) => item.category?.id)),
      ].filter(Boolean);
      setCategories(["all", ...uniqueCategories]);
    }
  }, [news]);

  // Update URL when category or search changes
  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.set("search", searchTerm);
    if (selectedCategory !== "all")
      queryParams.set("category", selectedCategory);
    if (currentPage > 1) queryParams.set("page", currentPage);

    const newUrl = queryParams.toString()
      ? `${router.pathname}?${queryParams.toString()}`
      : router.pathname;

    router.push(newUrl, undefined, { shallow: true });
  }, [searchTerm, selectedCategory, currentPage]);

  const filteredNews = news.filter((item) => {
    const matchesSearch = (locale === "en" ? item.title_en : item.title_ar)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // حساب عدد الصفحات
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  // الحصول على العناصر الخاصة بالصفحة الحالية
  const currentItems = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "en" ? "en-US" : "ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // دالة للتنقل بين الصفحات
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading)
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger" role="alert">
          {locale === "en" ? "Error loading news" : "خطأ في تحميل الأخبار"}
        </div>
      </div>
    );

  return (
    <div className="news-page">
      <HeadTitle pageTitle={locale === "en" ? "News" : "الأخبار"} />
      <HeaderOne
        pClass="header-light header-sticky header-with-shadow"
        postData={allPosts}
      />

      <div className="container mt-5 mb-5">
        {/* Search and Filter Section */}
        <div className="search-filter-section mb-5">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="search-box position-relative">
                <input
                  type="text"
                  className="form-control form-control-lg ps-5"
                  placeholder={
                    locale === "en" ? "Search news..." : "ابحث عن الأخبار..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="category-filter position-relative">
                <select
                  className="form-select form-select-lg ps-5"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">
                    {locale === "en" ? "All Categories" : "جميع الفئات"}
                  </option>
                  {categories.map((catId) => {
                    const category = news.find(
                      (item) => item.category?.id === catId
                    )?.category;
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
        </div>

        {/* News Grid */}
        <div className="row g-4">
          {currentItems.map((item) => (
            <div key={item.id} className="col-md-4">
              <div
                className={`card h-100 news-card ${
                  hoveredCard === item.id ? "card-hover" : ""
                }`}
                onMouseEnter={() => setHoveredCard(item.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {item.images?.[0] && (
                  <div className="card-img-wrapper">
                    <Image
                      src={item.images[0]}
                      alt={locale === "en" ? item.title_en : item.title_ar}
                      layout="fill"
                      objectFit="cover"
                      className="card-img-top"
                    />
                    <div className="category-badge">
                      <span className="badge bg-primary">
                        {locale === "en"
                          ? item.category?.name_en
                          : item.category?.name_ar}
                      </span>
                    </div>
                  </div>
                )}
                <div className="card-body">
                  <h5 className="card-title">
                    <Link href={`/post/${item.id}`}>
                      <a className="text-decoration-none text-dark stretched-link">
                        {locale === "en" ? item.title_en : item.title_ar}
                      </a>
                    </Link>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-section mt-5">
            <nav aria-label="Page navigation">
              <ul className="pagination justify-content-center">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    {locale === "en" ? "Previous" : "السابق"}
                  </button>
                </li>

                {[...Array(totalPages)].map((_, index) => (
                  <li
                    key={index + 1}
                    className={`page-item ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {locale === "en" ? "Next" : "التالي"}
                  </button>
                </li>
              </ul>
            </nav>
          </div>
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

      <style>{`
        .news-page {
          background-color: #f8f9fa;
          min-height: 100vh;
        }
        
        .search-filter-section {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
        }
        
        .search-box input,
        .category-filter select {
          border-radius: 12px;
          border: 2px solid #e9ecef;
          transition: all 0.3s ease;
          font-size: 1.5rem;
          height: 55px;
          background-color: #f8f9fa;
        }
        
        .search-box input:focus,
        .category-filter select:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
          background-color: white;
        }
        
        .search-box input::placeholder {
          color: #6c757d;
          opacity: 0.7;
        }
        
        .category-filter select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%230d6efd' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: calc(100% - 1rem) center;
          padding-right: 2.5rem;
        }
        
        .search-box i,
        .category-filter i {
          font-size: 1.2rem;
          opacity: 0.8;
        }
        
        .search-box input:hover,
        .category-filter select:hover {
          border-color: #0d6efd;
          background-color: white;
        }
        
        @media (max-width: 768px) {
          .search-filter-section {
            padding: 1.5rem;
          }
          
          .search-box input,
          .category-filter select {
            font-size: 0.95rem;
            height: 50px;
          }

          .pagination {
            flex-wrap: wrap;
            justify-content: center;
          }

          .page-link {
            padding: 0.4rem 0.8rem;
            font-size: 0.9rem;
          }
        }
        
        .news-card {
          border: none;
          border-radius: 15px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
        }

        .news-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
        }

        .card-img-wrapper {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .category-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          z-index: 1;
        }

        .card-title {
          font-size: 1.1rem;
          line-height: 1.4;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-text {
          font-size: 0.9rem;
        }

        /* Pagination Styles */
        .pagination-section {
          margin-top: 3rem;
        }

        .pagination {
          gap: 0.5rem;
        }

        .page-link {
          border-radius: 8px;
          border: 2px solid #e9ecef;
          color: #0d6efd;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
        }

        .page-link:hover {
          background-color: #e9ecef;
          border-color: #0d6efd;
        }

        .page-item.active .page-link {
          background-color: #0d6efd;
          border-color: #0d6efd;
          color: white;
        }

        .page-item.disabled .page-link {
          color: #6c757d;
          pointer-events: none;
          background-color: #f8f9fa;
          border-color: #e9ecef;
        }
      `}</style>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  const allPosts = getAllPosts([
    "postFormat",
    "title",
    "featureImg",
    "featured",
    "date",
    "slug",
    "pCate",
    "cate",
    "cate_img",
    "author_img",
    "author_name",
    "post_views",
    "read_time",
    "author_social",
  ]);

  SortingByDate(allPosts);
  return {
    props: { allPosts, ...(await serverSideTranslations(locale, ["common"])) },
  };
}
