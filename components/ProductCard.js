"use client";

import React from "react";
import Link from "next/link";
import { useShop } from "../context/ShopContext";

export default function ProductCard({ product }) {
    const { toggleWishlist, isWishlisted, addToCart } = useShop();

    const isFav = isWishlisted(product.id);

    const formatImgPath = (path) => {
        if (!path) return "/assets/images/placeholder.webp";
        if (path.startsWith("/")) return path;
        return "/" + path;
    };

    const formatVND = (number) => {
        return number.toLocaleString("vi-VN") + "đ";
    };

    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product.id);
    };

    const handleAddToCartClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product.id);
    };

    // Render stars helper
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalf = rating - fullStars >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(
                    <svg key={i} viewBox="0 0 20 20" fill="currentColor" style={{ width: "16px", height: "16px", color: "#FFB800" }}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                );
            } else {
                stars.push(
                    <svg key={i} viewBox="0 0 20 20" fill="#EAE4DE" stroke="#D4C5B9" style={{ width: "16px", height: "16px" }}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                );
            }
        }
        return stars;
    };

    return (
        <Link href={`/products/${product.id}`} className="product-card">
            {product.badge && <div className="product-badge">{product.badge}</div>}
            
            <div className="product-img-wrapper">
                <img
                    src={formatImgPath(product.image)}
                    alt={product.name}
                    className="product-img"
                    onError={(e) => { e.target.src = "/assets/images/placeholder.webp"; }}
                />
                <button
                    className={`wishlist-btn-card ${isFav ? "active" : ""}`}
                    onClick={handleWishlistClick}
                    title="Yêu thích"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill={isFav ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            </div>
            
            <div className="product-info">
                <span className="product-cat">{product.categoryName}</span>
                <h3 className="product-title">{product.name}</h3>
                
                <div className="product-rating">
                    {renderStars(product.rating)}
                    <span>({product.ratingCount})</span>
                </div>
                
                <div className="product-footer">
                    <span className="product-price">{formatVND(product.price)}</span>
                    <button
                        className="add-to-cart-btn"
                        onClick={handleAddToCartClick}
                        title="Thêm vào giỏ"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                </div>
            </div>
        </Link>
    );
}
