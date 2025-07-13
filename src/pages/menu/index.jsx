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
import HeaderThree from "../../common/elements/header/HeaderThree";

export default function NewsPage({ allPosts }) {
  const router = useRouter();
  const { locale, query } = router;

  const [searchTerm, setSearchTerm] = useState(query.search || "");
  const [selectedCategory, setSelectedCategory] = useState(
    query.category || "all"
  );
  const [currentPage, setCurrentPage] = useState(Number(query.page) || 1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const itemsPerPage = 9;

  const {
    data: news = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["news", locale],
    queryFn: getNews,
  });

  const categories = useMemo(() => {
    const unique = [
      ...new Set(news.map((item) => String(item.category?.id))),
    ].filter(Boolean);
    return ["all", ...unique];
  }, [news]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

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

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const title = locale === "en" ? item.title_en : item.title_ar;
      const matchesSearch = title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        String(item.category?.id) === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [news, searchTerm, selectedCategory, locale]);

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const currentItems = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setQuantity(1);
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  if (isLoading)
    return <div className="container mt-5 text-center">Loading...</div>;
  if (error)
    return (
      <div className="container mt-5 text-center text-danger">
        {locale === "en" ? "Error loading news" : "خطأ في تحميل الأخبار"}
      </div>
    );

  return (
    <div className="news-page main">
      <HeadTitle pageTitle={locale === "en" ? "News" : "الأخبار"} />
      <HeaderThree postData={allPosts} />

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
                  placeholder={
                    locale === "en"
                      ? "Search for news..."
                      : "ابحث عن الأخبار..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* الفلاتر كأزرار */}
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
          {categories.map((catId) => {
            const category = news.find(
              (item) => String(item.category?.id) === catId
            )?.category;
            const label =
              catId === "all"
                ? locale === "en"
                  ? "All"
                  : "الكل"
                : locale === "en"
                ? category?.name_en
                : category?.name_ar;

            return (
              <button
                key={catId}
                className={`btn-category${
                  selectedCategory === catId ? " active" : ""
                }`}
                onClick={() => setSelectedCategory(catId)}
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
              <div
                className="card semi-transparent-card h-100 text-center border-0 category-card-hover"
                style={{
                  borderRadius: "1rem",
                  background: "#f5f5f5 ",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                  border: "2px solid transparent",
                  cursor: "pointer",
                }}
                onClick={() => handleCardClick(item)}
              >
                {item.images?.[0] && (
                  <div
                    className="position-relative"
                    style={{
                      height: 200,
                      overflow: "visible",
                      borderTopLeftRadius: "1rem",
                      borderTopRightRadius: "1rem",
                    }}
                  >
                    <Image
                      src={item.images[0]}
                      alt={locale === "en" ? item.title_en : item.title_ar}
                      layout="fill"
                      objectFit="cover"
                    />

                    {/* التصنيف */}
                    <span
                      className="position-absolute top-0 end-0 m-2 px-3 py-1 text-white fw-bold"
                      style={{
                        backgroundColor: "rgba(255, 0, 0, 0.8)",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                      }}
                    >
                      {locale === "en"
                        ? item.category?.name_en
                        : item.category?.name_ar}
                    </span>

                    {/* خصم العرض */}
                    {item.offers > 0 && (
                      <span
                        className="position-absolute start-0"
                        style={{
                          bottom: "-20px",
                          width: "80px",
                          height: "80px",
                          background:
                            "linear-gradient(45deg, #dc2626, #f97316)",
                          color: "#fff",
                          borderRadius: "50%",
                          fontSize: "1.5rem",
                          fontWeight: "bold",
                          boxShadow: "0 0 10px #FFA52A",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 5,
                        }}
                      >
                        {locale === "en"
                          ? `${Math.round(
                              (item.offers / item.price) * 100
                            )}%  OFF`
                          : `خصم  ${Math.round(
                              (item.offers / item.price) * 100
                            )}٪`}
                      </span>
                    )}
                  </div>
                )}

                <div className="card-body px-3 py-4 d-flex flex-column justify-content-between">
                  <h5
                    className="fw-bold mb-2 category-title"
                    style={{ minHeight: "48px", color: "#000" }}
                  >
                    {locale === "en" ? item.title_en : item.title_ar}
                  </h5>

                  <div
                    className="news-description text-muted mb-3"
                    style={{ color: "#8b0000", opacity: 0.9 }}
                    dangerouslySetInnerHTML={{
                      __html:
                        (locale === "en" ? item.content_en : item.content_ar)
                          ?.split(" ")
                          .slice(0, 20)
                          .join(" ") + " ...",
                    }}
                  ></div>

                  <div className="mb-3">
                    {item.offers > 0 ? (
                      <>
                        <div
                          className="rounded px-3 py-2 d-flex justify-content-between align-items-center"
                          style={{
                            background:
                              "linear-gradient(135deg, #FFA52A, #FFC773)",
                            fontSize: "1.7rem",
                            fontWeight: "bold",
                            direction: locale === "ar" ? "rtl" : "ltr",
                            color: "#fff",
                          }}
                        >
                          <span
                            style={{
                              color: "#8b0000",
                              fontWeight: "bold",
                            }}
                          >
                            {locale === "en"
                              ? `${item.price - item.offers} EGP`
                              : `${item.price - item.offers} ج.م`}
                          </span>
                          <span
                            style={{
                              textDecoration: "line-through",
                              opacity: 0.7,
                            }}
                          >
                            {locale === "en"
                              ? `${item.price} EGP`
                              : `${item.price} ج.م`}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div
                        className="rounded px-3 py-2 text-center"
                        style={{
                          background:
                            "linear-gradient(135deg, #FFA52A, #FFC773)",
                          fontSize: "1.7rem",
                          fontWeight: "bold",
                          color: "#8b0000",
                        }}
                      >
                        {locale === "en"
                          ? `${item.price} EGP`
                          : `${item.price} ج.م`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-4">
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (num) => (
                  <li
                    key={num}
                    className={`page-item ${
                      currentPage === num ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(num)}
                    >
                      {num}
                    </button>
                  </li>
                )
              )}
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
        )}

        {/* لا يوجد نتائج */}
        {filteredNews.length === 0 && (
          <div className="text-center mt-5 py-5">
            <i className="fas fa-newspaper fa-3x text-muted mb-3"></i>
            <h3 className="text-muted">
              {locale === "en" ? "No news found" : "لم يتم العثور على أخبار"}
            </h3>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedItem && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
          }}
          onClick={closeModal}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header border-0">
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body p-4">
                <div className="row">
                  {/* صورة المنتج */}
                  <div className="col-md-6 mb-4">
                    {selectedItem.images?.[0] && (
                      <div
                        className="product-image-container position-relative"
                        style={{ height: "400px" }}
                      >
                        <Image
                          src={selectedItem.images[0]}
                          alt={
                            locale === "en"
                              ? selectedItem.title_en
                              : selectedItem.title_ar
                          }
                          layout="fill"
                          objectFit="cover"
                          style={{ borderRadius: "1rem" }}
                        />
                        {selectedItem.offers > 0 && (
                          <span
                            className="position-absolute top-0 start-0 m-3 px-3 py-2 text-white fw-bold"
                            style={{
                              backgroundColor: "rgba(220, 38, 38, 0.9)",
                              borderRadius: "9999px",
                              fontSize: "1rem",
                            }}
                          >
                            {locale === "en"
                              ? `${Math.round(
                                  (selectedItem.offers / selectedItem.price) *
                                    100
                                )}% OFF`
                              : `خصم ${Math.round(
                                  (selectedItem.offers / selectedItem.price) *
                                    100
                                )}٪`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* تفاصيل المنتج */}
                  <div className="col-md-6">
                    <h3 className="fw-bold mb-3" style={{ color: "#000" }}>
                      {locale === "en"
                        ? selectedItem.title_en
                        : selectedItem.title_ar}
                    </h3>

                    {/* التصنيف */}
                    <div className="mb-3">
                      <span className="category-badge">
                        {locale === "en"
                          ? selectedItem.category?.name_en
                          : selectedItem.category?.name_ar}
                      </span>
                    </div>

                    {/* الوصف */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-2">
                        {locale === "en" ? "Description" : "الوصف"}
                      </h6>
                      <div
                        className="product-description"
                        dangerouslySetInnerHTML={{
                          __html:
                            locale === "en"
                              ? selectedItem.content_en
                              : selectedItem.content_ar,
                        }}
                      ></div>
                    </div>

                    {/* العداد */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-2">
                        {locale === "en" ? "Quantity" : "الكمية"}
                      </h6>
                      <div className="quantity-counter d-flex align-items-center">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={decreaseQuantity}
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <span className="quantity-display mx-3 fw-bold">
                          {quantity}
                        </span>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={increaseQuantity}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* السعر */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-2">
                        {locale === "en" ? "Price" : "السعر"}
                      </h6>
                      <div className="price-display">
                        {selectedItem.offers > 0 ? (
                          <div className="d-flex align-items-center gap-3">
                            <span className="current-price">
                              {locale === "en"
                                ? `${
                                    selectedItem.price - selectedItem.offers
                                  } EGP`
                                : `${
                                    selectedItem.price - selectedItem.offers
                                  } ج.م`}
                            </span>
                            <span className="original-price">
                              {locale === "en"
                                ? `${selectedItem.price} EGP`
                                : `${selectedItem.price} ج.م`}
                            </span>
                          </div>
                        ) : (
                          <span className="current-price">
                            {locale === "en"
                              ? `${selectedItem.price} EGP`
                              : `${selectedItem.price} ج.م`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* إجمالي السعر */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-2">
                        {locale === "en" ? "Total" : "الإجمالي"}
                      </h6>
                      <span className="total-price">
                        {locale === "en"
                          ? `${
                              (selectedItem.offers > 0
                                ? selectedItem.price - selectedItem.offers
                                : selectedItem.price) * quantity
                            } EGP`
                          : `${
                              (selectedItem.offers > 0
                                ? selectedItem.price - selectedItem.offers
                                : selectedItem.price) * quantity
                            } ج.م`}
                      </span>
                    </div>

                    {/* أزرار الإجراءات */}
                    <div className="action-buttons d-grid gap-2">
                      <button className="btn btn-primary btn-lg">
                        {locale === "en" ? "Add to Cart" : "أضف إلى السلة"}
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={closeModal}
                      >
                        {locale === "en" ? "Close" : "إغلاق"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* <GalleryOne /> */}
      <FooterThree />
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
    props: {
      allPosts,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
