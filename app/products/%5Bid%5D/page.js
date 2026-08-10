"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useShop } from "../../../context/ShopContext";
import ProductCard from "../../../components/ProductCard";

export default function ProductDetailPage({ params }) {
    const resolvedParams = use(params);
    const productId = parseInt(resolvedParams.id);

    const {
        products,
        isMounted,
        addToCart,
        toggleWishlist,
        isWishlisted
    } = useShop();

    const [qty, setQty] = useState(1);

    const product = products.find((p) => p.id === productId);

    if (!isMounted) {
        return (
            <main className="container section">
                <div className="detail-loading">Đang tải thông tin sản phẩm...</div>
            </main>
        );
    }

    if (!product) {
        return (
            <main className="container section">
                <div className="detail-loading" style={{ textAlign: "center", padding: "60px 0" }}>
                    <h3>Không tìm thấy sản phẩm!</h3>
                    <p>Sản phẩm không tồn tại hoặc đã bị gỡ khỏi tiệm.</p>
                    <Link href="/products" className="btn btn-outline" style={{ marginTop: "20px", display: "inline-block" }}>
                        Quay lại cửa hàng
                    </Link>
                </div>
            </main>
        );
    }

    const isFav = isWishlisted(product.id);

    // Get 4 related products in same category (excluding current)
    const relatedProducts = products
        .filter((p) => p.category === product.category && p.id !== product.id && p.status !== "inactive")
        .slice(0, 4);

    const formatImgPath = (path) => {
        if (!path) return "/assets/images/placeholder.webp";
        if (path.startsWith("/")) return path;
        return "/" + path;
    };

    const formatVND = (number) => {
        return number.toLocaleString("vi-VN") + "đ";
    };

    const handleQtyChange = (delta) => {
        const nextQty = qty + delta;
        if (nextQty < 1) return;
        if (product.stock !== undefined && nextQty > product.stock) {
            return; // Can't add more than stock
        }
        setQty(nextQty);
    };

    const handleAddToCart = () => {
        addToCart(product.id, qty);
    };

    // Render stars helper
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(
                    <svg key={i} viewBox="0 0 20 20" fill="currentColor" style={{ width: "18px", height: "18px", color: "#FFB800" }}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                );
            } else {
                stars.push(
                    <svg key={i} viewBox="0 0 20 20" fill="#EAE4DE" stroke="#D4C5B9" style={{ width: "18px", height: "18px" }}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                );
            }
        }
        return stars;
    };

    return (
        <main className="container section">
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <Link href="/">Trang chủ</Link> &nbsp;/&nbsp; 
                <Link href="/products">Sản phẩm</Link> &nbsp;/&nbsp; 
                <Link href={`/products?category=${product.category}`}>{product.categoryName}</Link> &nbsp;/&nbsp; 
                <span className="active-crumb">{product.name}</span>
            </div>

            {/* Product Detail Content */}
            <div className="product-detail-layout">
                {/* Image block */}
                <div className="product-detail-img-wrapper">
                    <img
                        src={formatImgPath(product.image)}
                        alt={product.name}
                        className="product-detail-img"
                        onError={(e) => { e.target.src = "/assets/images/placeholder.webp"; }}
                    />
                </div>

                {/* Info block */}
                <div className="product-detail-info">
                    <span className="detail-cat">{product.categoryName}</span>
                    <h1 className="detail-title">{product.name}</h1>
                    
                    <div className="detail-rating">
                        {renderStars(product.rating)}
                        <span>({product.ratingCount} đánh giá từ khách hàng)</span>
                    </div>

                    <div className="detail-price">
                        {formatVND(product.price)}
                    </div>

                    {/* Stock Alert Badge */}
                    <div style={{ margin: "10px 0 20px" }}>
                        {product.stock === 0 ? (
                            <span className="status-pill status-inactive" style={{ padding: "6px 12px", fontSize: "14px" }}>
                                <span className="status-dot"></span> Hết hàng
                            </span>
                        ) : product.stock <= 10 ? (
                            <span className="status-pill status-lowstock" style={{ padding: "6px 12px", fontSize: "14px" }}>
                                <span className="status-dot"></span> Chỉ còn {product.stock} sản phẩm
                            </span>
                        ) : (
                            <span className="status-pill status-active" style={{ padding: "6px 12px", fontSize: "14px", backgroundColor: "#ECFDF5", color: "#047857" }}>
                                <span className="status-dot" style={{ backgroundColor: "#10B981" }}></span> Còn hàng ({product.stock})
                            </span>
                        )}
                    </div>

                    <p className="detail-desc">{product.description}</p>

                    {/* Quantity & Actions */}
                    <div className="detail-actions-wrapper">
                        <div className="quantity-selector">
                            <button
                                className="qty-btn"
                                onClick={() => handleQtyChange(-1)}
                                disabled={product.stock === 0}
                                aria-label="Giảm số lượng"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                className="qty-input"
                                value={product.stock === 0 ? 0 : qty}
                                readOnly
                            />
                            <button
                                className="qty-btn"
                                onClick={() => handleQtyChange(1)}
                                disabled={product.stock === 0}
                                aria-label="Tăng số lượng"
                            >
                                +
                            </button>
                        </div>

                        <button
                            className="btn-add-to-cart-large"
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Thêm vào giỏ hàng
                        </button>

                        <button
                            className={`btn-wishlist-large ${isFav ? "active" : ""}`}
                            onClick={() => toggleWishlist(product.id)}
                            title="Yêu thích"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill={isFav ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <section className="section related-products-section">
                    <div className="section-header">
                        <h2>Sản Phẩm Liên Quan</h2>
                        <p>Khám phá các sản phẩm khác cùng danh mục có thể bạn sẽ thích</p>
                    </div>
                    
                    <div className="products-grid">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
