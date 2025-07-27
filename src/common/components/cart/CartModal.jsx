import React, { useState, useEffect } from "react";
import { useCart } from "../../../context/CartContext";
import Image from "next/image";
import { useRouter } from "next/router";
import { getBranches } from "../../../../services/getBranches";

const CartModal = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } =
    useCart();
  const router = useRouter();
  const { locale } = router;

  // --- New state for customer info form ---
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [orderType, setOrderType] = useState(""); // "delivery" or "pickup"
  const [branch, setBranch] = useState("");
  const [formError, setFormError] = useState("");
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState("");

  // جلب الفروع عند فتح الفورم
  useEffect(() => {
    if (showCustomerForm && orderType === "pickup") {
      setBranchesLoading(true);
      setBranchesError("");
      getBranches()
        .then((data) => {
          setBranches(data || []);
        })
        .catch((err) => {
          setBranchesError(
            locale === "en"
              ? "Failed to load branches."
              : "فشل في تحميل الفروع."
          );
        })
        .finally(() => setBranchesLoading(false));
    }
  }, [showCustomerForm, orderType, locale]);

  if (!isOpen) return null;

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const getFinalPrice = (item) => {
    return item.offer > 0 ? item.price - item.offer : item.price;
  };

  const getOrderText = () => {
    let text = locale === "en" ? "Order Details:%0A" : "تفاصيل الطلب:%0A";
    items.forEach((item, idx) => {
      text += `${idx + 1}- ${locale === "en" ? item.nameEn : item.nameAr} | ${
        locale === "en" ? item.sizeLabel.en : item.sizeLabel.ar
      } | ${locale === "en" ? "Qty" : "الكمية"}: ${item.quantity} | ${
        locale === "en" ? "Total" : "الإجمالي"
      }: ${getFinalPrice(item) * item.quantity} ${
        locale === "en" ? "EGP" : "ج.م"
      }%0A`;
    });
    text += `${locale === "en" ? "Total:" : "الإجمالي:"} ${getTotal()} ${
      locale === "en" ? "EGP" : "ج.م"
    }%0A`;
    // --- بيانات العميل ---
    text += locale === "en" ? "Name: " : "الاسم: ";
    text += customerName ? `${customerName}%0A` : "%0A";
    text += locale === "en" ? "Phone: " : "رقم الهاتف: ";
    text += customerPhone ? `${customerPhone}%0A` : "%0A";
    text += locale === "en" ? "Address: " : "العنوان: ";
    text += customerAddress ? `${customerAddress}%0A` : "%0A";
    text += locale === "en" ? "Order Type: " : "نوع الطلب: ";
    if (orderType === "delivery") {
      text += locale === "en" ? "Delivery%0A" : "دليفري%0A";
    } else if (orderType === "pickup") {
      text += locale === "en" ? "Branch Pickup%0A" : "استلام فرع%0A";
      text += locale === "en" ? "Branch: " : "الفرع: ";
      text += branch ? `${branch}%0A` : "%0A";
    }
    return text;
  };

  // رقم الواتساب (يمكنك تغييره)
  const whatsappNumber = "201065223412"; // بدون +
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${getOrderText()}`;

  // --- دالة التحقق من صحة الفورم ---
  const validateForm = () => {
    if (!customerName || !customerPhone || !orderType) {
      return locale === "en"
        ? "Please fill in all required fields."
        : "يرجى ملء جميع الحقول المطلوبة.";
    }
    if (orderType === "pickup" && !branch) {
      return locale === "en" ? "Please select a branch." : "يرجى اختيار الفرع.";
    }
    return "";
  };

  // --- دالة عند الضغط على زر إرسال الطلب ---
  const handleSendOrder = (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    setFormError("");
    // فتح رابط الواتساب
    window.open(whatsappLink, "_blank");
    // يمكن هنا تفريغ السلة أو إغلاق المودال حسب الحاجة
    // clearCart();
    // onClose();
  };

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        zIndex: 1050,
        backdropFilter: "blur(5px)",
      }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div
          className="modal-content"
          style={{ borderRadius: 18, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="modal-header border-0"
            style={{
              borderBottom: "1px solid #f0f0f0",
              borderRadius: "18px 18px 0 0",
              background: "#f8f9fa",
            }}
          >
            <div className="d-flex align-items-center">
              <i
                className="fas fa-shopping-cart me-3"
                style={{ fontSize: "2rem", color: "#25D366" }}
              ></i>
              <h5 className="modal-title fw-bold mb-0" style={{ fontSize: 26 }}>
                {locale === "en" ? "Shopping Cart" : "سلة التسوق"}
              </h5>
            </div>
          </div>

          <div
            className="modal-body p-4"
            style={{
              background: "#fff",
              borderRadius: "0 0 18px 18px",
              fontSize: 18,
            }}
          >
            {showCustomerForm ? (
              // --- Customer Info Form ---
              <form
                onSubmit={handleSendOrder}
                style={{ maxWidth: 500, margin: "0 auto", fontSize: 18 }}
              >
                <div className="mb-3">
                  <label
                    className="form-label fw-bold"
                    style={{ color: "#222", fontSize: 18 }}
                  >
                    {locale === "en" ? "Name" : "الاسم"}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      borderRadius: 10,
                      borderColor: "#e0e0e0",
                      fontSize: 17,
                    }}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label
                    className="form-label fw-bold"
                    style={{ color: "#222", fontSize: 18 }}
                  >
                    {locale === "en" ? "Phone Number" : "رقم الهاتف"}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    style={{
                      borderRadius: 10,
                      borderColor: "#e0e0e0",
                      fontSize: 17,
                    }}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label
                    className="form-label fw-bold"
                    style={{ color: "#222", fontSize: 18 }}
                  >
                    {locale === "en" ? "Address" : "العنوان"}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      borderRadius: 10,
                      borderColor: "#e0e0e0",
                      fontSize: 17,
                    }}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label
                    className="form-label fw-bold"
                    style={{ color: "#222", fontSize: 18 }}
                  >
                    {locale === "en" ? "Order Type" : "نوع الطلب"}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    style={{
                      borderRadius: 10,
                      borderColor: "#e0e0e0",
                      fontSize: 17,
                    }}
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    required
                  >
                    <option value="">
                      {locale === "en" ? "Select" : "اختر"}
                    </option>
                    <option value="delivery">
                      {locale === "en" ? "Delivery" : "دليفري"}
                    </option>
                    <option value="pickup">
                      {locale === "en" ? "Branch Pickup" : "استلام فرع"}
                    </option>
                  </select>
                </div>
                {orderType === "pickup" && (
                  <div className="mb-3">
                    <label
                      className="form-label fw-bold"
                      style={{ color: "#222", fontSize: 18 }}
                    >
                      {locale === "en" ? "Branch" : "الفرع"}{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      style={{
                        borderRadius: 10,
                        borderColor: "#e0e0e0",
                        fontSize: 17,
                      }}
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      required
                      disabled={branchesLoading || branchesError}
                    >
                      <option value="">
                        {branchesLoading
                          ? locale === "en"
                            ? "Loading..."
                            : "جاري التحميل..."
                          : locale === "en"
                          ? "Select Branch"
                          : "اختر الفرع"}
                      </option>
                      {branches &&
                        branches.map((b) => (
                          <option
                            key={b.id}
                            value={locale === "en" ? b.name_en : b.name_ar}
                          >
                            {locale === "en" ? b.name_en : b.name_ar}
                          </option>
                        ))}
                    </select>
                    {branchesError && (
                      <div
                        className="text-danger small mt-1"
                        style={{ fontSize: 15 }}
                      >
                        {branchesError}
                      </div>
                    )}
                  </div>
                )}
                {formError && (
                  <div
                    className="alert alert-danger"
                    style={{ borderRadius: 10, fontSize: 16 }}
                  >
                    {formError}
                  </div>
                )}
                <div className="d-flex justify-content-between mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ borderRadius: 10, minWidth: 120, fontSize: 17 }}
                    onClick={() => setShowCustomerForm(false)}
                  >
                    {locale === "en" ? "Back to Cart" : "العودة للسلة"}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    style={{
                      background: "#25D366",
                      border: "none",
                      borderRadius: 10,
                      minWidth: 180,
                      fontSize: 18,
                    }}
                  >
                    <i className="fab fa-whatsapp me-2 ms-2"></i>
                    {locale === "en"
                      ? "Send Order via WhatsApp"
                      : "إرسال الطلب عبر واتساب"}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="cart-items">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="cart-item mb-3 p-3 border rounded"
                      style={{
                        borderRadius: 14,
                        borderColor: "#e0e0e0",
                        background: "#fafbfc",
                        fontSize: 17,
                      }}
                    >
                      <div className="row align-items-center g-2">
                        {/* صورة المنتج */}
                        <div className="col-md-2 col-3">
                          {item.image && (
                            <div
                              className="position-relative"
                              style={{
                                height: "80px",
                                borderRadius: 10,
                                overflow: "hidden",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                              }}
                            >
                              <Image
                                src={item.image}
                                alt={
                                  locale === "en" ? item.nameEn : item.nameAr
                                }
                                layout="fill"
                                objectFit="cover"
                                style={{ borderRadius: "0.5rem" }}
                              />
                            </div>
                          )}
                        </div>

                        {/* تفاصيل المنتج */}
                        <div className="col-md-4 col-6">
                          <h6
                            className="fw-bold mb-1"
                            style={{ fontSize: 19, color: "#222" }}
                          >
                            {locale === "en" ? item.nameEn : item.nameAr}
                          </h6>
                          <p
                            className="text-muted mb-1 small"
                            style={{ fontSize: 16 }}
                          >
                            {locale === "en" ? "Size" : "الحجم"}:{" "}
                            {locale === "en"
                              ? item.sizeLabel.en
                              : item.sizeLabel.ar}
                          </p>
                          <p
                            className="text-muted mb-0 small"
                            style={{ fontSize: 16 }}
                          >
                            {locale === "en" ? "Category" : "الفئة"}:{" "}
                            {locale === "en"
                              ? item.category?.name_en
                              : item.category?.name_ar}
                          </p>
                        </div>

                        {/* السعر */}
                        <div className="col-md-2 col-3 text-center">
                          <div className="price-info">
                            <div className="mb-2">
                              <strong
                                style={{ color: "#25D366", fontSize: 18 }}
                              >
                                {locale === "en"
                                  ? `${getFinalPrice(item) * item.quantity} EGP`
                                  : `${
                                      getFinalPrice(item) * item.quantity
                                    } ج.م`}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* عداد الكمية */}
                        <div className="col-md-2 col-6">
                          <div className="quantity-controls d-flex align-items-center justify-content-center">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              style={{
                                borderRadius: 8,
                                minWidth: 32,
                                fontSize: 18,
                              }}
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span
                              className="mx-2 fw-bold"
                              style={{ fontSize: 18 }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              style={{
                                borderRadius: 8,
                                minWidth: 32,
                                fontSize: 18,
                              }}
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* الإجمالي والحذف */}
                        <div className="col-md-2 col-6 text-center">
                          <button
                            className="btn btn-sm btn-danger"
                            style={{
                              borderRadius: 8,
                              background: "#ff4d4f",
                              border: "none",
                              fontSize: 18,
                            }}
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* إجمالي السلة */}
                <div
                  className="cart-summary mt-4 p-3 bg-light rounded"
                  style={{
                    borderRadius: 14,
                    background: "#f5f6fa",
                    fontSize: 18,
                  }}
                >
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <button
                        className="btn btn-outline-danger"
                        style={{
                          borderRadius: 10,
                          minWidth: 120,
                          fontSize: 17,
                        }}
                        onClick={handleClearCart}
                      >
                        {locale === "en" ? "Clear Cart" : "تفريغ السلة"}
                      </button>
                    </div>
                    <div className="col-md-6 text-end">
                      <h5
                        className="mb-0"
                        style={{ fontWeight: 700, fontSize: 22 }}
                      >
                        {locale === "en" ? "Total" : "الإجمالي"}:
                        <span
                          className="text-success ms-2 me-2"
                          style={{
                            color: "#25D366",
                            fontWeight: 800,
                            fontSize: 24,
                          }}
                        >
                          {locale === "en"
                            ? `${getTotal()} EGP`
                            : `${getTotal()} ج.م`}
                        </span>
                      </h5>
                    </div>
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="cart-actions mt-4 d-grid gap-2">
                  <button
                    className="btn btn-success btn-lg"
                    style={{
                      background: "#25D366",
                      border: "none",
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 20,
                    }}
                    onClick={() => setShowCustomerForm(true)}
                  >
                    <i className="fab fa-whatsapp me-2 ms-2"></i>
                    {locale === "en"
                      ? "Send Order via WhatsApp"
                      : "إرسال الطلب عبر واتساب"}
                  </button>

                  <button
                    className="btn btn-outline-secondary"
                    style={{ borderRadius: 12, fontWeight: 600, fontSize: 18 }}
                    onClick={onClose}
                  >
                    {locale === "en" ? "Continue Shopping" : "مواصلة التسوق"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
