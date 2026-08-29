"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useShop } from "../context/ShopContext";

export default function CartDrawer() {
    const router = useRouter();
    const {
        cart,
        cartOpen,
        setCartOpen,
        updateCartQuantity,
        removeFromCart
    } = useShop();

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCheckout = () => {
        setCartOpen(false);
        router.push("/checkout");
    };

    const formatImgPath = (path) => {
        if (!path) return "/assets/images/placeholder.webp";
        if (path.startsWith("/")) return path;
        return "/" + path;
    };

    // Format money helper
    const formatVND = (number) => {
        return number.toLocaleString("vi-VN") + "đ";
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`cart-overlay ${cartOpen ? "active" : ""}`}
                onClick={() => setCartOpen(false)}
            />

            {/* Drawer */}
            <div className={`cart-drawer ${cartOpen ? "active" : ""}`}>
                <div className="cart-drawer-header">
                    <h3>Giỏ hàng của bạn</h3>
                    <button className="cart-drawer-close" onClick={() => setCartOpen(false)} aria-label="Đóng giỏ hàng">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* Cart Items */}
                <div className="cart-drawer-body">
                    {cart.length === 0 ? (
                        <div className="empty-cart-message" style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: "64px", height: "64px", margin: "0 auto 15px", opacity: 0.4 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            <p>Giỏ hàng của bạn đang trống.</p>
                        </div>
                    ) : (
                        <div className="cart-items-list">
                            {cart.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item-img-wrapper">
                                        <img
                                            src={formatImgPath(item.image)}
                                            alt={item.name}
                                            onError={(e) => { e.target.src = "/assets/images/placeholder.webp"; }}
                                        />
                                    </div>
                                    
                                    <div className="cart-item-details">
                                        <h4 className="cart-item-title">{item.name}</h4>
                                        
                                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
                                            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                                                Đơn giá: {formatVND(item.price)}
                                            </span>
                                            <span style={{ fontSize: "0.9rem", color: "var(--text-main)", fontWeight: "600" }}>
                                                Thành tiền: <span style={{ color: "var(--primary-color)", fontWeight: "700" }}>{formatVND(item.price * item.quantity)}</span>
                                            </span>
                                        </div>
                                        
                                        <div className="cart-item-qty-wrapper" style={{ marginTop: "10px" }}>
                                            <div className="cart-item-qty">
                                                <button
                                                    className="cart-qty-btn"
                                                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    className="cart-qty-input"
                                                    readOnly
                                                />
                                                <button
                                                    className="cart-qty-btn"
                                                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <button
                                                    className="btn btn-outline"
                                                    style={{
                                                        padding: "0 10px",
                                                        fontSize: "0.78rem",
                                                        height: "32px",
                                                        borderRadius: "var(--border-radius-sm)",
                                                        borderColor: "var(--primary-color)",
                                                        color: "var(--primary-color)",
                                                        backgroundColor: "transparent",
                                                        fontWeight: "600"
                                                    }}
                                                    onClick={() => {
                                                        setCartOpen(false);
                                                        router.push(`/checkout?buyNow=${item.id}`);
                                                    }}
                                                >
                                                    Mua riêng
                                                </button>
                                                
                                                <button
                                                    className="cart-item-remove"
                                                    onClick={() => removeFromCart(item.id)}
                                                    aria-label="Xóa"
                                                    style={{ margin: 0 }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "18px", height: "18px" }}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart Footer */}
                <div className="cart-drawer-footer">
                    <div className="cart-total-row">
                        <span>Tổng cộng:</span>
                        <span className="cart-total-price">{formatVND(subtotal)}</span>
                    </div>
                    <button
                        className="btn btn-primary btn-checkout"
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                    >
                        Thanh toán ngay
                    </button>
                    <button className="btn btn-outline btn-close-cart" onClick={() => setCartOpen(false)}>
                        Tiếp tục mua sắm
                    </button>
                </div>
            </div>
        </>
    );
}
