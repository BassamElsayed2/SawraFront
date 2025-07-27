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
import { useCart } from "../../context/CartContext";
import CartModal from "../../common/components/cart/CartModal";
import CartIcon from "../../common/components/cart/CartIcon";

export default function NewsPage({ allPosts }) {
  const router = useRouter();
  const { locale, query } = router;
  const { addToCart } = useCart();

  const [searchTerm, setSearchTerm] = useState(query.search || "");
  const [selectedCategory, setSelectedCategory] = useState(
    query.category || "all"
  );
  const [currentPage, setCurrentPage] = useState(Number(query.page) || 1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("price");
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const itemsPerPage = 9;
  const [successMessage, setSuccessMessage] = useState("");

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
    setSelectedSize("price");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setQuantity(1);
    setSelectedSize("price");
  };

  const handleAddToCart = () => {
    if (selectedItem) {
      addToCart(selectedItem, quantity, selectedSize);
      setSuccessMessage(
        locale === "en"
          ? "Product added to cart successfully!"
          : "تم إضافة المنتج إلى السلة بنجاح!"
      );
      setTimeout(() => {
        setSuccessMessage("");
        closeModal();
      }, 1200);
    }
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // دالة لحساب السعر الحالي بناءً على الحجم المحدد
  const getCurrentPrice = (item) => {
    if (!item) return 0;

    const priceMap = {
      price: item.price,
      price_small: item.price_small,
      price_medium: item.price_medium,
      price_large: item.price_large,
      price_family: item.price_family,
    };

    return priceMap[selectedSize] || item.price;
  };

  // دالة لحساب الخصم الحالي بناءً على الحجم المحدد
  const getCurrentOffer = (item) => {
    if (!item) return 0;

    const offerMap = {
      price: item.offers,
      price_small: item.offers_small,
      price_medium: item.offers_medium,
      price_large: item.offers_large,
      price_family: item.offers_family,
    };

    return offerMap[selectedSize] || item.offers;
  };

  // دالة للتحقق من وجود أحجام متعددة
  const hasMultipleSizes = (item) => {
    if (!item) return false;
    return (
      item.price_small ||
      item.price_medium ||
      item.price_large ||
      item.price_family
    );
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

      {/* أيقونة السلة */}
      <div
        className="position-fixed"
        style={{
          top: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        <CartIcon
          onClick={() => setIsCartModalOpen(true)}
          className="p-3 rounded-circle shadow-lg"
        />
      </div>

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
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1050,
          }}
          onClick={closeModal}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div
              className="modal-content"
              style={{
                borderRadius: 24,
                boxShadow: "0 12px 48px rgba(0,0,0,0.25)",
                border: "none",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="modal-header border-0"
                style={{
                  padding: "1.5rem 2rem 0 2rem",
                  background: "linear-gradient(90deg,#FFA52A,#FFC773)",
                  minHeight: 0,
                }}
              >
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                  style={{
                    fontSize: 24,
                    color: "#8b0000",
                    background: "#fff",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px #ffa52a33",
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              {successMessage && (
                <div
                  style={{
                    background: "#16a34a",
                    color: "#fff",
                    fontWeight: 600,
                    textAlign: "center",
                    padding: "0.75rem 1rem",
                    borderRadius: 8,
                    margin: "1rem 2rem 0 2rem",
                    fontSize: "1.1rem",
                    boxShadow: "0 2px 8px #16a34a33",
                    zIndex: 2,
                  }}
                >
                  {successMessage}
                </div>
              )}
              <div
                className="modal-body p-4"
                style={{ paddingTop: successMessage ? 12 : 32 }}
              >
                <div className="row">
                  {/* صورة المنتج */}
                  <div className="col-md-6 mb-4">
                    {selectedItem.images?.[0] && (
                      <div
                        className="product-image-container position-relative"
                        style={{
                          height: 320,
                          borderRadius: 18,
                          overflow: "hidden",
                          boxShadow: "0 4px 24px #ffa52a22",
                        }}
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
                        />
                        {getCurrentOffer(selectedItem) > 0 && (
                          <span
                            className="position-absolute top-0 start-0 m-3 px-3 py-2 text-white fw-bold"
                            style={{
                              backgroundColor: "#dc2626",
                              borderRadius: 12,
                              fontSize: "1rem",
                              boxShadow: "0 2px 8px #dc262633",
                            }}
                          >
                            {locale === "en"
                              ? `${Math.round(
                                  (getCurrentOffer(selectedItem) /
                                    getCurrentPrice(selectedItem)) *
                                    100
                                )}% OFF`
                              : `خصم ${Math.round(
                                  (getCurrentOffer(selectedItem) /
                                    getCurrentPrice(selectedItem)) *
                                    100
                                )}٪`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {/* تفاصيل المنتج */}
                  <div className="col-md-6">
                    <h3
                      className="fw-bold mb-3"
                      style={{
                        color: "#222",
                        fontSize: 28,
                        letterSpacing: 0.5,
                      }}
                    >
                      {locale === "en"
                        ? selectedItem.title_en
                        : selectedItem.title_ar}
                    </h3>
                    <div className="mb-3">
                      <span
                        className="category-badge"
                        style={{
                          background: "#FFA52A",
                          color: "#fff",
                          fontWeight: 700,
                          borderRadius: 12,
                          padding: "0.4rem 1.2rem",
                          fontSize: 15,
                        }}
                      >
                        {locale === "en"
                          ? selectedItem.category?.name_en
                          : selectedItem.category?.name_ar}
                      </span>
                    </div>
                    <div className="mb-4">
                      <h6 className="fw-bold mb-2" style={{ color: "#8b0000" }}>
                        {locale === "en" ? "Description" : "الوصف"}
                      </h6>
                      <div
                        className="product-description"
                        style={{
                          color: "#444",
                          fontSize: 16,
                          lineHeight: 1.7,
                          maxHeight: 120,
                          overflowY: "auto",
                        }}
                        dangerouslySetInnerHTML={{
                          __html:
                            locale === "en"
                              ? selectedItem.content_en
                              : selectedItem.content_ar,
                        }}
                      ></div>
                    </div>
                    {hasMultipleSizes(selectedItem) && (
                      <div className="mb-4">
                        <h6
                          className="fw-bold mb-2"
                          style={{ color: "#8b0000" }}
                        >
                          {locale === "en" ? "Size" : "الحجم"}
                        </h6>
                        <div className="size-selector d-flex flex-wrap gap-2">
                          {selectedItem.price && (
                            <button
                              className={`size-btn ${
                                selectedSize === "price" ? "active" : ""
                              }`}
                              onClick={() => setSelectedSize("price")}
                              style={{
                                border: "2px solid #ffa52a",
                                borderRadius: 8,
                                padding: "0.4rem 1.2rem",
                                background:
                                  selectedSize === "price" ? "#FFA52A" : "#fff",
                                color:
                                  selectedSize === "price" ? "#fff" : "#8b0000",
                                fontWeight: 600,
                                transition: "all 0.2s",
                              }}
                            >
                              {locale === "en" ? "Regular" : "عادي"}
                            </button>
                          )}
                          {selectedItem.price_small && (
                            <button
                              className={`size-btn ${
                                selectedSize === "price_small" ? "active" : ""
                              }`}
                              onClick={() => setSelectedSize("price_small")}
                              style={{
                                border: "2px solid #ffa52a",
                                borderRadius: 8,
                                padding: "0.4rem 1.2rem",
                                background:
                                  selectedSize === "price_small"
                                    ? "#FFA52A"
                                    : "#fff",
                                color:
                                  selectedSize === "price_small"
                                    ? "#fff"
                                    : "#8b0000",
                                fontWeight: 600,
                                transition: "all 0.2s",
                              }}
                            >
                              {locale === "en" ? "Small" : "صغير"}
                            </button>
                          )}
                          {selectedItem.price_medium && (
                            <button
                              className={`size-btn ${
                                selectedSize === "price_medium" ? "active" : ""
                              }`}
                              onClick={() => setSelectedSize("price_medium")}
                              style={{
                                border: "2px solid #ffa52a",
                                borderRadius: 8,
                                padding: "0.4rem 1.2rem",
                                background:
                                  selectedSize === "price_medium"
                                    ? "#FFA52A"
                                    : "#fff",
                                color:
                                  selectedSize === "price_medium"
                                    ? "#fff"
                                    : "#8b0000",
                                fontWeight: 600,
                                transition: "all 0.2s",
                              }}
                            >
                              {locale === "en" ? "Medium" : "متوسط"}
                            </button>
                          )}
                          {selectedItem.price_large && (
                            <button
                              className={`size-btn ${
                                selectedSize === "price_large" ? "active" : ""
                              }`}
                              onClick={() => setSelectedSize("price_large")}
                              style={{
                                border: "2px solid #ffa52a",
                                borderRadius: 8,
                                padding: "0.4rem 1.2rem",
                                background:
                                  selectedSize === "price_large"
                                    ? "#FFA52A"
                                    : "#fff",
                                color:
                                  selectedSize === "price_large"
                                    ? "#fff"
                                    : "#8b0000",
                                fontWeight: 600,
                                transition: "all 0.2s",
                              }}
                            >
                              {selectedItem.category?.name_en === "Crepe"
                                ? locale === "en"
                                  ? "role medium"
                                  : "رول وسط"
                                : locale === "en"
                                ? "Large"
                                : "كبير"}
                            </button>
                          )}
                          {selectedItem.price_family && (
                            <button
                              className={`size-btn ${
                                selectedSize === "price_family" ? "active" : ""
                              }`}
                              onClick={() => setSelectedSize("price_family")}
                              style={{
                                border: "2px solid #ffa52a",
                                borderRadius: 8,
                                padding: "0.4rem 1.2rem",
                                background:
                                  selectedSize === "price_family"
                                    ? "#FFA52A"
                                    : "#fff",
                                color:
                                  selectedSize === "price_family"
                                    ? "#fff"
                                    : "#8b0000",
                                fontWeight: 600,
                                transition: "all 0.2s",
                              }}
                            >
                              {selectedItem.category?.name_en === "Crepe"
                                ? locale === "en"
                                  ? "role large"
                                  : "رول كبير"
                                : locale === "en"
                                ? "Family"
                                : "عائلي"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-2" style={{ color: "#8b0000" }}>
                        {locale === "en" ? "Quantity" : "الكمية"}
                      </h6>
                      <div className="quantity-counter d-flex align-items-center">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={decreaseQuantity}
                          disabled={quantity <= 1}
                          style={{
                            borderRadius: 8,
                            width: 38,
                            height: 38,
                            fontWeight: 700,
                            fontSize: 20,
                          }}
                        >
                          -
                        </button>
                        <span
                          className="quantity-display mx-3 fw-bold"
                          style={{ fontSize: 18 }}
                        >
                          {quantity}
                        </span>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={increaseQuantity}
                          style={{
                            borderRadius: 8,
                            width: 38,
                            height: 38,
                            fontWeight: 700,
                            fontSize: 20,
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h6 className="fw-bold mb-2" style={{ color: "#8b0000" }}>
                        {locale === "en" ? "Price" : "السعر"}
                      </h6>
                      <div
                        className="price-display"
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          color: "#dc2626",
                        }}
                      >
                        {getCurrentOffer(selectedItem) > 0 ? (
                          <div className="d-flex align-items-center gap-3">
                            <span
                              className="current-price"
                              style={{ color: "#16a34a", fontSize: 22 }}
                            >
                              {locale === "en"
                                ? `${
                                    getCurrentPrice(selectedItem) -
                                    getCurrentOffer(selectedItem)
                                  } EGP`
                                : `${
                                    getCurrentPrice(selectedItem) -
                                    getCurrentOffer(selectedItem)
                                  } ج.م`}
                            </span>
                            <span
                              className="original-price"
                              style={{
                                textDecoration: "line-through",
                                opacity: 0.7,
                                fontSize: 16,
                              }}
                            >
                              {locale === "en"
                                ? `${getCurrentPrice(selectedItem)} EGP`
                                : `${getCurrentPrice(selectedItem)} ج.م`}
                            </span>
                          </div>
                        ) : (
                          <span className="current-price">
                            {locale === "en"
                              ? `${getCurrentPrice(selectedItem)} EGP`
                              : `${getCurrentPrice(selectedItem)} ج.م`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mb-4">
                      <h6 className="fw-bold mb-2" style={{ color: "#8b0000" }}>
                        {locale === "en" ? "Total" : "الإجمالي"}
                      </h6>
                      <span
                        className="total-price"
                        style={{
                          fontSize: 26,
                          fontWeight: 700,
                          color: "#FFA52A",
                        }}
                      >
                        {locale === "en"
                          ? `${
                              (getCurrentOffer(selectedItem) > 0
                                ? getCurrentPrice(selectedItem) -
                                  getCurrentOffer(selectedItem)
                                : getCurrentPrice(selectedItem)) * quantity
                            } EGP`
                          : `${
                              (getCurrentOffer(selectedItem) > 0
                                ? getCurrentPrice(selectedItem) -
                                  getCurrentOffer(selectedItem)
                                : getCurrentPrice(selectedItem)) * quantity
                            } ج.م`}
                      </span>
                    </div>
                    <div className="action-buttons d-grid gap-2 mt-4">
                      <button
                        className="btn btn-primary btn-lg"
                        style={{
                          background: "linear-gradient(90deg,#FFA52A,#FFC773)",
                          color: "#8b0000",
                          fontWeight: 700,
                          border: "none",
                          borderRadius: 10,
                          fontSize: 20,
                          boxShadow: "0 2px 8px #ffa52a33",
                        }}
                        onClick={handleAddToCart}
                      >
                        {locale === "en" ? "Add to Cart" : "أضف إلى السلة"}
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        style={{
                          borderRadius: 10,
                          fontWeight: 600,
                          fontSize: 18,
                        }}
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

      {/* Modal السلة */}
      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
      />

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
