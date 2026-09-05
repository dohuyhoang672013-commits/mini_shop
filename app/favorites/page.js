"use client";

import React from "react";
import Link from "next/link";
import { useShop } from "../../context/ShopContext";
import ProductCard from "../../components/ProductCard";

export default function FavoritesPage() {
    const { wishlist } = useShop();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="container section">
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <Link href="/">Trang chủ</Link> &nbsp;/&nbsp; <span className="active-crumb">Yêu thích</span>
            </div>

            {/* Title Section */}
            <div className="page-header">
                <h1>Sản Phẩm Yêu Thích</h1>
                <p>Tuyển chọn những sản phẩm mộc mạc và tinh tế bạn đã đặc biệt quan tâm.</p>
            </div>

            {/* Favorites Container */}
            <div className="shop-layout" style={{ display: "block" }}>
                {!mounted ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                        Đang tải danh sách yêu thích...
                    </div>
                ) : wishlist.length === 0 ? (
                    /* Empty State */
                    <div className="no-results" style={{ display: "block", textAlign: "center", padding: "60px 20px" }}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1"
                            stroke="currentColor"
                            style={{ width: "80px", height: "80px", color: "var(--text-muted)", marginBottom: "20px", marginLeft: "auto", marginRight: "auto", display: "block" }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "10px" }}>
                            Danh sách yêu thích đang trống
                        </h3>
                        <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>
                            Hãy lướt xem các sản phẩm và nhấn nút trái tim để lưu lại những món đồ bạn yêu thích nhé.
                        </p>
                        <Link href="/products" className="btn btn-primary" style={{ display: "inline-block" }}>
                            Khám phá cửa hàng
                        </Link>
                    </div>
                ) : (
                    /* Favorites Grid */
                    <div className="products-grid">
                        {wishlist.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
