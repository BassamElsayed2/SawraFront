import React from "react";
import { useCart } from "../../../context/CartContext";

const CartIcon = ({ onClick, className = "" }) => {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <div
      className={`cart-icon-wrapper position-relative ${className}`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <i className="fas fa-shopping-cart fa-lg"></i>
      {itemCount > 0 && (
        <span
          className="position-absolute top-0  translate-middle badge rounded-pill bg-danger"
          style={{
            fontSize: "0.75rem",
            transform: "translate(-50%, -50%)",
          }}
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </div>
  );
};

export default CartIcon;
