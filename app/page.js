"use client";

import React from "react";
import Link from "next/link";
import { useShop } from "../context/ShopContext";
import ProductCard from "../components/ProductCard";

export default function Home() {
    const { products, isMounted } = useShop();

    // Select featured products (first 8 products from the database)
    const featuredProducts = products.slice(0, 8);

    return (
        <>
            {/* Hero Section */}
            <section className="hero-section container">
                <div className="hero-banner-container">
                    <img
                        src="/assets/images/banner/banner-trang-chu-mini-shop.webp"
                        alt="Không gian trưng bày gốm và đồ thủ công mộc mạc"
                        className="hero-image"
                        onError={(e) => { e.target.src = "/assets/images/banner/banner-trang-chu-mini-shop.webp"; }}
                    />
                    <div className="hero-overlay">
                        <div className="hero-content">
                            <h1>Chạm Vào <em>Đất</em>,<br />Kể Câu Chuyện <em>Bàn Tay</em></h1>
                            <p>Mang vẻ đẹp mộc mạc, tĩnh lặng của tự nhiên vào ngôi nhà bạn qua các tác phẩm thủ công chế tác tỉ mỉ bởi nghệ nhân Việt.</p>
                            <a href="#featured-products" className="btn btn-primary">Khám phá bộ sưu tập</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="section container">
                <div className="section-header">
                    <h2>Danh Mục Nổi Bật</h2>
                    <p>Khám phá các sản phẩm thủ công được chia nhóm theo chất liệu tự nhiên</p>
                </div>
                
                <div className="categories-grid">
                    {/* Cat 1 */}
                    <Link href="/products?category=gom-su-moc" className="category-card">
                        <div className="category-img-wrapper">
                            <img src="/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp" alt="Gốm sứ trang trí" />
                        </div>
                        <h3>Gốm sứ mộc</h3>
                    </Link>
                    {/* Cat 2 */}
                    <Link href="/products?category=may-tre-dan" className="category-card">
                        <div className="category-img-wrapper">
                            <img src="/assets/images/products/do-thu-cong/gio-may-dan.webp" alt="Đồ mây tre đan" />
                        </div>
                        <h3>Mây tre đan</h3>
                    </Link>
                    {/* Cat 3 */}
                    <Link href="/products?category=do-go-moc" className="category-card">
                        <div className="category-img-wrapper">
                            <img src="/assets/images/products/do-thu-cong/khay-go-trang-tri.webp" alt="Đồ gỗ trang trí" />
                        </div>
                        <h3>Đồ gỗ mộc</h3>
                    </Link>
                    {/* Cat 4 */}
                    <Link href="/products?category=noi-that-tho" className="category-card">
                        <div className="category-img-wrapper">
                            <img src="/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp" alt="Nội thất gia dụng" />
                        </div>
                        <h3>Nội thất thô</h3>
                    </Link>
                </div>
            </section>

            {/* Brand Values Section */}
            <section className="section section-bg">
                <div className="container">
                    <div className="values-grid">
                        {/* Value 1 */}
                        <div className="value-card">
                            <div className="value-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.5.3-2.5.9v2.7c0 .6 1.145.9 2.5.9s2.5-.3 2.5-.9V9.15c0-.6-1.145-.9-2.5-.9zm0 5.4v-1.5m0 1.5c-1.355 0-2.5.3-2.5.9v2.7c0 .6 1.145.9 2.5.9s2.5-.3 2.5-.9V14.55c0-.6-1.145-.9-2.5-.9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3>Chế tác thủ công</h3>
                            <p>Mỗi sản phẩm đều mang những vết vân đất, đường đan độc bản và mang đậm dấu ấn sáng tạo của nghệ nhân.</p>
                        </div>
                        {/* Value 2 */}
                        <div className="value-card">
                            <div className="value-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18" />
                                </svg>
                            </div>
                            <h3>Vật liệu tự nhiên</h3>
                            <p>Chúng tôi tuyển chọn và sử dụng 100% nguyên liệu tự nhiên bản địa như đất sét sét lọc, mây tre rừng và gỗ thông.</p>
                        </div>
                        {/* Value 3 */}
                        <div className="value-card">
                            <div className="value-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <h3>Thẩm mỹ tối giản</h3>
                            <p>Đơn giản hóa đường nét để tôn vinh sự mộc mạc nguyên bản, dễ dàng đồng điệu với bất kỳ không gian nội thất nào.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="section container" id="featured-products">
                <div className="section-header">
                    <h2>Sản Phẩm Nổi Bật</h2>
                    <p>Những tác phẩm thủ công được ưa chuộng nhất tuần này</p>
                </div>
                
                <div className="products-grid">
                    {isMounted ? (
                        featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div style={{ textAlign: "center", gridColumn: "1 / -1", padding: "40px", color: "var(--text-muted)" }}>
                            Đang tải sản phẩm nổi bật...
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
