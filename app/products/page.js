"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useShop } from "../../context/ShopContext";
import ProductCard from "../../components/ProductCard";

function ProductsCatalog() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { products, isMounted } = useShop();

    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState("default");
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // Sync state with URL search params
    useEffect(() => {
        if (isMounted) {
            const cat = searchParams.get("category") || "all";
            const search = searchParams.get("search") || "";
            setCategoryFilter(cat);
            setSearchQuery(search);
        }
    }, [searchParams, isMounted]);

    const categories = [
        { id: "all", name: "Tất cả sản phẩm" },
        { id: "gom-su-moc", name: "Gốm sứ mộc" },
        { id: "may-tre-dan", name: "Mây tre đan" },
        { id: "do-go-moc", name: "Đồ gỗ mộc" },
        { id: "noi-that-tho", name: "Nội thất thô" }
    ];

    // Filter and Sort products
    const filteredProducts = products.filter((product) => {
        // Category filter
        const matchCategory = categoryFilter === "all" || product.category === categoryFilter;
        
        // Search filter
        const matchSearch = searchQuery.trim() === "" || 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

        // Active products only in public pages
        const matchStatus = product.status !== "inactive";

        return matchCategory && matchSearch && matchStatus;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating-desc") return b.rating - a.rating;
        return 0; // default (by ID or database insertion)
    });

    const handleCategoryClick = (catId) => {
        setMobileFilterOpen(false);
        const params = new URLSearchParams(searchParams);
        if (catId === "all") {
            params.delete("category");
        } else {
            params.set("category", catId);
        }
        router.push(`/products?${params.toString()}`);
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        const params = new URLSearchParams(searchParams);
        if (val) {
            params.set("search", val);
        } else {
            params.delete("search");
        }
        router.push(`/products?${params.toString()}`);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    return (
        <main className="container section">
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <Link href="/">Trang chủ</Link> &nbsp;/&nbsp; <span className="active-crumb">Sản phẩm</span>
            </div>

            {/* Title Section */}
            <div className="page-header">
                <h1>Cửa Hàng Thủ Công</h1>
                <p>Tuyển chọn những sản phẩm trang trí tinh tế từ chất liệu mây, tre, gỗ và đất nung tự nhiên.</p>
            </div>

            {/* Shop Main Layout */}
            <div className="shop-layout">
                {/* Sidebar (Filters) */}
                <aside className={`shop-sidebar ${mobileFilterOpen ? "active" : ""}`} id="shop-sidebar">
                    <div className="filter-section">
                        <h3 className="filter-title">Tìm kiếm</h3>
                        <div className="sidebar-search-box">
                            <input
                                type="text"
                                placeholder="Nhập tên sản phẩm..."
                                className="sidebar-search-input"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="sidebar-search-icon">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3 className="filter-title">Danh mục sản phẩm</h3>
                        <ul className="filter-list">
                            {categories.map((cat) => (
                                <li key={cat.id}>
                                    <button
                                        className={`filter-link ${categoryFilter === cat.id ? "active" : ""}`}
                                        onClick={() => handleCategoryClick(cat.id)}
                                        style={{ background: "none", border: "none", textAlign: "left", cursor: "pointer", width: "100%", padding: "6px 0" }}
                                    >
                                        {cat.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="filter-section">
                        <h3 className="filter-title">Sắp xếp theo</h3>
                        <div className="sort-wrapper">
                            <select
                                id="sort-select"
                                className="sort-select"
                                value={sortBy}
                                onChange={handleSortChange}
                            >
                                <option value="default">Mặc định (Mới nhất)</option>
                                <option value="price-asc">Giá: Thấp đến Cao</option>
                                <option value="price-desc">Giá: Cao đến Thấp</option>
                                <option value="rating-desc">Đánh giá cao nhất</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Close button for mobile filter */}
                    {mobileFilterOpen && (
                        <button
                            className="btn btn-outline"
                            style={{ marginTop: "20px", width: "100%" }}
                            onClick={() => setMobileFilterOpen(false)}
                        >
                            Đóng bộ lọc
                        </button>
                    )}
                </aside>

                {/* Product Listing */}
                <div className="shop-content">
                    {/* Active Filters & Result Count */}
                    <div className="shop-toolbar">
                        <div className="result-count">
                            Hiển thị <span id="displayed-count">{isMounted ? sortedProducts.length : 0}</span> trên <span id="total-count">{isMounted ? products.filter(p => p.status !== "inactive").length : 0}</span> sản phẩm
                        </div>
                        <button
                            className="mobile-filter-btn"
                            id="mobile-filter-btn"
                            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.477 8 1.4V7c0 .646-.226 1.258-.6 1.737L15 13.5v5.5l-6-3v-2.5L4.6 8.737A2.998 2.998 0 014 7V4.4c2.545-.923 5.245-1.4 8-1.4z" />
                            </svg>
                            Lọc & Sắp xếp
                        </button>
                    </div>

                    {/* Products Grid */}
                    {isMounted ? (
                        sortedProducts.length === 0 ? (
                            <div className="no-results" style={{ display: "block" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                                </svg>
                                <h3>Không tìm thấy sản phẩm nào</h3>
                                <p>Vui lòng thử chọn bộ lọc danh mục hoặc tìm từ khóa khác.</p>
                            </div>
                        ) : (
                            <div className="products-grid">
                                {sortedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )
                    ) : (
                        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                            Đang tải cửa hàng...
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <main className="container section">
                <div style={{ textAlign: "center", padding: "80px", color: "var(--text-muted)" }}>
                    Đang tải danh sách sản phẩm...
                </div>
            </main>
        }>
            <ProductsCatalog />
        </Suspense>
    );
}
