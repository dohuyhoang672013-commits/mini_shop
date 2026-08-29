"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useShop } from "../../context/ShopContext";

function CheckoutCatalog() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const buyNowId = searchParams.get("buyNow");
    
    const {
        cart,
        user,
        placeOrder
    } = useShop();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Local form states
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cod");

    // Success Modal states
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderId, setOrderId] = useState("");

    // Redirect to login if not logged in
    useEffect(() => {
        if (mounted) {
            if (!user) {
                sessionStorage.setItem("mini_shop_checkout_intent", "true");
                router.push("/login");
            } else {
                // Populate default name from user profile username
                setName(user.username === "admin" ? "" : user.username);
            }
        }
    }, [user, mounted]);

    if (!mounted || !user) {
        return (
            <main className="container section">
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                    {!mounted ? "Đang tải trang thanh toán..." : "Đang chuyển hướng đến đăng nhập..."}
                </div>
            </main>
        );
    }

    const checkoutItems = buyNowId 
        ? cart.filter(item => String(item.id) === String(buyNowId))
        : cart;

    const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 30000;
    const total = subtotal + shipping;

    const handlePaymentChange = (method) => {
        setPaymentMethod(method);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (checkoutItems.length === 0) {
            alert("Không có sản phẩm nào để thanh toán!");
            return;
        }

        try {
            const id = await placeOrder({
                name,
                phone,
                email,
                address,
                notes,
                paymentMethod
            }, checkoutItems);

            if (id) {
                setOrderId(id);
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error("Lỗi khi đặt hàng:", error);
            alert("Đặt hàng thất bại, vui lòng thử lại!");
        }
    };

    const formatVND = (number) => {
        return number.toLocaleString("vi-VN") + "đ";
    };

    const formatImgPath = (path) => {
        if (!path) return "/assets/images/placeholder.webp";
        if (path.startsWith("/")) return path;
        return "/" + path;
    };

    return (
        <main className="container section">
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <Link href="/">Trang chủ</Link> &nbsp;/&nbsp; <span className="active-crumb">Thanh toán</span>
            </div>

            {/* Title Section */}
            <div className="page-header">
                <h1>Thanh Toán Đơn Hàng</h1>
                <p>Vui lòng kiểm tra lại đơn hàng và điền thông tin giao nhận bên dưới.</p>
            </div>

            {/* Checkout Layout */}
            <form id="checkout-form" onSubmit={handleFormSubmit} className="checkout-layout">
                {/* Left: Shipping Info */}
                <div className="checkout-card">
                    <h3 className="checkout-section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Thông tin giao hàng
                    </h3>
                    
                    <div className="form-group">
                        <label className="form-label">Họ và tên</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Nguyễn Văn A"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Số điện thoại</label>
                        <input
                            type="tel"
                            className="form-input"
                            placeholder="0987 654 321"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Địa chỉ email (tùy chọn)</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="nva@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Địa chỉ nhận hàng</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Ghi chú đơn hàng (tùy chọn)</label>
                        <textarea
                            className="form-input"
                            style={{ height: "80px", padding: "10px 14px", resize: "none" }}
                            placeholder="Lưu ý giao hàng, chỉ dẫn đường đi..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                    
                    <h3 className="checkout-section-title" style={{ marginTop: "30px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Phương thức thanh toán
                    </h3>
                    
                    <div className="payment-methods">
                        {/* COD */}
                        <label
                            className={`payment-method-option ${paymentMethod === "cod" ? "selected" : ""}`}
                            id="method-cod"
                            onClick={() => handlePaymentChange("cod")}
                        >
                            <div className="payment-method-header">
                                <input
                                    type="radio"
                                    name="payment-method"
                                    value="cod"
                                    checked={paymentMethod === "cod"}
                                    onChange={() => {}}
                                />
                                <span className="payment-method-title">Thanh toán khi nhận hàng (COD)</span>
                            </div>
                            <div className="payment-method-desc">
                                Bạn sẽ thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận được sản phẩm tại nhà.
                            </div>
                        </label>
                        
                        {/* Bank Transfer */}
                        <label
                            className={`payment-method-option ${paymentMethod === "bank" ? "selected" : ""}`}
                            id="method-bank"
                            onClick={() => handlePaymentChange("bank")}
                        >
                            <div className="payment-method-header">
                                <input
                                    type="radio"
                                    name="payment-method"
                                    value="bank"
                                    checked={paymentMethod === "bank"}
                                    onChange={() => {}}
                                />
                                <span className="payment-method-title">Chuyển khoản ngân hàng</span>
                            </div>
                            <div className="payment-method-desc">
                                Vui lòng chuyển khoản vào tài khoản ngân hàng sau với cú pháp: <strong>[Mã đơn hàng] - [Số điện thoại]</strong><br />
                                - Ngân hàng: Vietcombank<br />
                                - Số tài khoản: 1012345678<br />
                                - Chủ tài khoản: TIEM GOM DECOR
                            </div>
                        </label>
                    </div>
                </div>
                
                {/* Right: Order Summary */}
                <div>
                    <div className="checkout-card">
                        <h3 className="checkout-section-title">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Tóm tắt đơn hàng
                        </h3>
                        
                        {/* Checkout Items */}
                        <div className="checkout-items-list" id="checkout-summary-items">
                            {checkoutItems.length === 0 ? (
                                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px 0" }}>
                                    Giỏ hàng của bạn đang trống!
                                </div>
                            ) : (
                                checkoutItems.map((item) => (
                                    <div key={item.id} className="checkout-item">
                                        <div className="checkout-item-info">
                                            <img
                                                src={formatImgPath(item.image)}
                                                alt={item.name}
                                                className="checkout-item-img"
                                                onError={(e) => { e.target.src = "/assets/images/placeholder.webp"; }}
                                            />
                                            <div className="checkout-item-details">
                                                <span className="checkout-item-name" title={item.name}>{item.name}</span>
                                                <span className="checkout-item-qty">Số lượng: {item.quantity}</span>
                                            </div>
                                        </div>
                                        <span className="checkout-item-price">{formatVND(item.price * item.quantity)}</span>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {/* Financial Summary */}
                        <div className="checkout-summary-row" style={{ marginTop: "20px" }}>
                            <span>Tạm tính</span>
                            <span>{formatVND(subtotal)}</span>
                        </div>
                        <div className="checkout-summary-row">
                            <span>Phí vận chuyển</span>
                            <span>{formatVND(shipping)}</span>
                        </div>
                        <div className="checkout-summary-row total">
                            <span>Tổng cộng</span>
                            <span className="total-price">{formatVND(checkoutItems.length === 0 ? 0 : total)}</span>
                        </div>
                        
                        <button
                            type="submit"
                            className="btn btn-primary btn-checkout-submit"
                            disabled={checkoutItems.length === 0}
                        >
                            Đặt hàng ngay
                        </button>
                    </div>
                </div>
            </form>

            {/* Success Modal */}
            <div className={`order-success-modal ${showSuccessModal ? "active" : ""}`} id="order-success-modal">
                <div className="order-success-card">
                    <div className="success-icon-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2>Đặt Hàng Thành Công!</h2>
                    <p>
                        Cảm ơn bạn đã lựa chọn Tiệm Gốm & Decor.<br />
                        Mã đơn hàng của bạn là: <strong style={{ color: "var(--primary-color)" }}>{orderId}</strong>.<br />
                        Chúng tôi sẽ sớm liên hệ với bạn để xác nhận đơn hàng.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => router.push("/")}
                        style={{ padding: "0 30px", height: "44px", display: "inline-block" }}
                    >
                        Quay lại Trang chủ
                    </button>
                </div>
            </div>
        </main>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <main className="container section">
                <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
                    Đang tải trang thanh toán...
                </div>
            </main>
        }>
            <CheckoutCatalog />
        </Suspense>
    );
}
