import React from "react";
import { useCart } from "../../../context/CartContext";
import Image from "next/image";
import { useRouter } from "next/router";

const CartModal = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } =
    useCart();
  const router = useRouter();
  const { locale } = router;

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

  // دالة تجهيز نص الطلب للواتساب
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
    text += locale === "en" ? "Name: " : "الاسم: ";

    return text;
  };

  // رقم الواتساب (يمكنك تغييره)
  const whatsappNumber = "201065223412"; // بدون +
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${getOrderText()}`;

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
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header border-0">
            <div className="d-flex align-items-center">
              <i
                className="fas fa-shopping-cart me-3"
                style={{ fontSize: "1.5rem" }}
              ></i>
              <h5 className="modal-title fw-bold mb-0">
                {locale === "en" ? "Shopping Cart" : "سلة التسوق"}
              </h5>
            </div>
          </div>

          <div className="modal-body p-4">
            {items.length === 0 ? (
              <div className="text-center py-5">
                <div className="empty-cart-icon mb-4">
                  <i className="fas fa-shopping-cart fa-4x"></i>
                </div>
                <h5 className="mb-3">
                  {locale === "en" ? "Your cart is empty" : "سلة التسوق فارغة"}
                </h5>
                <p className="mb-4">
                  {locale === "en"
                    ? "Add some products to get started!"
                    : "أضف بعض المنتجات للبدء!"}
                </p>
                <button className="btn btn-primary" onClick={onClose}>
                  {locale === "en" ? "Start Shopping" : "ابدأ التسوق"}
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="cart-item mb-3 p-3 border rounded"
                    >
                      <div className="row align-items-center">
                        {/* صورة المنتج */}
                        <div className="col-md-2 col-3">
                          {item.image && (
                            <div
                              className="position-relative"
                              style={{ height: "80px" }}
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
                          <h6 className="fw-bold mb-1">
                            {locale === "en" ? item.nameEn : item.nameAr}
                          </h6>
                          <p className="text-muted mb-1 small">
                            {locale === "en" ? "Size" : "الحجم"}:{" "}
                            {locale === "en"
                              ? item.sizeLabel.en
                              : item.sizeLabel.ar}
                          </p>
                          <p className="text-muted mb-0 small">
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
                              <strong>
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
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="mx-2 fw-bold">
                              {item.quantity}
                            </span>
                            <button
                              className="btn btn-sm btn-outline-secondary"
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
                            className="btn btn-sm btn-danger "
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
                <div className="cart-summary mt-4 p-3 bg-light rounded">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <button
                        className="btn btn-outline-danger"
                        onClick={handleClearCart}
                      >
                        {locale === "en" ? "Clear Cart" : "تفريغ السلة"}
                      </button>
                    </div>
                    <div className="col-md-6 text-end">
                      <h5 className="mb-0">
                        {locale === "en" ? "Total" : "الإجمالي"}:
                        <span className="text-success ms-2 me-2">
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
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success btn-lg"
                    style={{ background: "#25D366", border: "none" }}
                  >
                    <i className="fab fa-whatsapp me-2 ms-2"></i>
                    {locale === "en"
                      ? "Send Order via WhatsApp"
                      : "إرسال الطلب عبر واتساب"}
                  </a>

                  <button
                    className="btn btn-outline-secondary"
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
