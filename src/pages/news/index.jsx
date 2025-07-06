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
  const [currentPage, setCurrentPage] = useState(Number(query.page) || 1);
  const itemsPerPage = 9;

  const { data: news = [], isLoading, error } = useQuery({
    queryKey: ["news", locale],
    queryFn: getNews,
  });

  const categories = useMemo(() => {
    const unique = [...new Set(news.map((item) => String(item.category?.id)))].filter(Boolean);
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  if (isLoading) return <div className="container mt-5 text-center">Loading...</div>;
  if (error) return <div className="container mt-5 text-center text-danger">{locale === "en" ? "Error loading news" : "خطأ في تحميل الأخبار"}</div>;

  console.log (news)
  return (
    <div className="news-page">
      <HeadTitle pageTitle={locale === "en" ? "News" : "الأخبار"} />
      <HeaderOne pClass="header-light header-sticky header-with-shadow" postData={allPosts} />

      <div className="container mt-5 mb-5">
        {/* البحث */}  
        <div className="row justify-content-center mb-4">
  <div className="col-lg-6 col-md-10">
    <div className="search-box-wrapper">
      <div className="input-group input-group-lg custom-search-box">
        <span className="input-group-text">
          <i className="fas fa-search"></i>
        </span>
        <input
          type="text"
          className="form-control"
          placeholder={locale === "en" ? "Search for news..." : "ابحث عن الأخبار..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  </div>
</div>


        {/* الفلاتر كأزرار */}  
        <div className="d-flex  justify-content-center gap-2 mb-5">
          {categories.map((catId) => {
            const category = news.find((item) => String(item.category?.id) === catId)?.category;
            const label = catId === "all"
              ? (locale === "en" ? "All" : "الكل")
              : (locale === "en" ? category?.name_en : category?.name_ar);

            return (
              <button
                key={catId}
                className={`btn-category${selectedCategory === catId ? " active" : ""}`}
                onClick={() => setSelectedCategory(catId)}
                style={{ color: "black" }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* الكروت */}  
        <div className="row g-4">
          {currentItems.map((item) => (
          <div key={item.id} className="col-md-4">
          <div className="card h-100 text-center border-0" style={{
            borderRadius: "1rem",
            backgroundColor: "#fff8f0",
            boxShadow: "0 5px 10px rgba(220,38,38,0.15)"
          }}>
            {/* الصورة والتصنيف */}
            {item.images?.[0] && (
              <div className="position-relative" style={{
                height: 200,
                overflow: "hidden",
                borderTopLeftRadius: "1rem",
                borderTopRightRadius: "1rem",
              }}>
                <Image
                  src={item.images[0]}
                  alt={locale === "en" ? item.title_en : item.title_ar}
                  layout="fill"
                  objectFit="cover"
                />
                <span className="position-absolute top-0 end-0 m-2 px-3 py-1 text-white fw-bold" style={{
                  background: "linear-gradient(45deg, #dc2626, #f97316)",
                  borderRadius: "9999px",
                  fontSize: "0.75rem"
                }}>
                  {locale === "en" ? item.category?.name_en : item.category?.name_ar}
                </span>
              </div>
            )}
        
            {/* المحتوى */}
            <div className="card-body px-3 py-4 d-flex flex-column justify-content-between">
              {item.id && (locale === "en" ? item.title_en : item.title_ar) && (
                <h5 className="fw-bold mb-2" style={{ minHeight: "48px" }}>
                  <Link href={`/${locale}/post/${item.id}`} className="text-dark text-decoration-none stretched-link">
                    {locale === "en" ? item.title_en : item.title_ar}
                  </Link>
                </h5>
              )}
        
              <div
                className="news-description text-muted mb-3"
                dangerouslySetInnerHTML={{
                  __html:
                    (locale === "en" ? item.content_en : item.content_ar)?.split(" ").slice(0, 20).join(" ") + " ..."
                }}
              ></div>
        
           {/* الأسعار والعرض الخاص */}
<div className="mb-3">
  <div
    className="rounded px-3 py-2 d-flex justify-content-between align-items-center"
    style={{
      background: "#ffe7e0",
      fontSize: "1.2rem",
      fontWeight: "bold",
      direction: locale === "ar" ? "rtl" : "ltr"
    }}
  >
    <span className="text-danger">${item.price_after || "00.00"}</span>
    <span className="text-muted text-decoration-line-through">${item.price_before || "00.00"}</span>
  </div>

  {/* نسبة الخصم - تجربة */}  
<div className="mt-2" style={{ fontWeight: 600, color: "#16a34a", fontSize: "1.5rem" }}>
  {locale === "en"
    ? "Save 50% off"
    : "خصم 50٪ "}
</div>

</div>

{/* زر التفاصيل بنفس ستايل أزرار التصنيف */}
{/* <button
  onClick={() => router.push(`/${locale}/post/${item.id}`)}
  className="btn-category mt-auto"
  style={{ display: "inline-block", marginTop: "auto" }}
>
  {locale === "en" ? " Details" : " التفاصيل"}
</button> */}

            </div>
          </div>
        </div>
        
          ))}
        </div>

        {/* Pagination */}  
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

        {/* لا يوجد نتائج */}  
        {filteredNews.length === 0 && (
          <div className="text-center mt-5 py-5">
            <i className="fas fa-newspaper fa-3x text-muted mb-3"></i>
            <h3 className="text-muted">{locale === "en" ? "No news found" : "لم يتم العثور على أخبار"}</h3>
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
