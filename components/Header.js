"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useShop } from "../context/ShopContext";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        cart,
        wishlist,
        user,
        logoutUser,
        setCartOpen
    } = useShop();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const userMenuRef = useRef(null);

    // Track scroll to apply shadow
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Sync search input with URL search param
    useEffect(() => {
        if (mounted) {
            const query = searchParams.get("search") || "";
            setSearchQuery(query);
        }
    }, [searchParams, mounted]);

    // Close user dropdown when clicking outside
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    }, []);

    const debounceTimerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, []);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const wishlistCount = wishlist.length;

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (pathname === "/products") {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
                const params = new URLSearchParams(searchParams);
                if (val.trim()) {
                    params.set("search", val.trim());
                } else {
                    params.delete("search");
                }
                router.replace(`/products?${params.toString()}`);
            }, 300);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        const query = searchQuery.trim();
        if (query) {
            router.push(`/products?search=${encodeURIComponent(query)}`);
        } else {
            router.push("/products");
        }
    };

    const handleLogout = async () => {
        await logoutUser();
        setUserMenuOpen(false);
        if (pathname === "/checkout" || pathname === "/admin") {
            router.push("/");
        }
    };

    return (
        <header className={`site-header ${scrolled ? "scrolled" : ""}`} id="site-header">
            <div className="container navbar">
                {/* Logo */}
                <Link href="/" className="logo">
                    Tiệm Gốm & Decor
                </Link>

                {/* Navigation Links */}
                <ul className={`nav-menu ${mobileMenuOpen ? "active" : ""}`} id="nav-menu">
                    <li>
                        <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
                            Trang chủ
                        </Link>
                    </li>
                    <li>
                        <Link href="/products" className={`nav-link ${pathname.startsWith("/products") ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
                            Sản phẩm
                        </Link>
                    </li>
                    <li>
                        <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); }}>
                            Câu chuyện
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); }}>
                            Liên hệ
                        </a>
                    </li>
                </ul>

                {/* Actions */}
                <div className="nav-actions">
                    {/* Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="search-box">
                        <button type="submit" className="search-icon-btn" aria-label="Tìm kiếm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        <input
                            type="text"
                            placeholder="Tìm sản phẩm..."
                            className="search-input"
                            id="search-input"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </form>

                    {/* Heart (Wishlist) */}
                    <Link href="/favorites" className="action-btn" title="Yêu thích">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="wishlist-count" id="wishlist-count">
                            {mounted ? wishlistCount : 0}
                        </span>
                    </Link>

                    {/* Cart */}
                    <button className="action-btn" id="cart-btn" title="Giỏ hàng" onClick={() => setCartOpen(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span className="cart-count" id="cart-count">
                            {mounted ? cartCount : 0}
                        </span>
                    </button>

                    {/* User Account */}
                    <div className="user-menu-container" id="user-menu-container" ref={userMenuRef}>
                        <button
                            className="action-btn"
                            title="Tài khoản"
                            onClick={(e) => {
                                e.stopPropagation();
                                setUserMenuOpen(!userMenuOpen);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {mounted && user && (
                                <span className="user-status-dot" id="user-status-dot" style={{ display: "block" }}></span>
                            )}
                        </button>

                        <div className={`user-dropdown ${userMenuOpen ? "active" : ""}`} id="user-dropdown">
                            {mounted && user ? (
                                <>
                                    <div className="user-dropdown-header">
                                        <div className="user-dropdown-username">{user.username}</div>
                                        <div className="user-dropdown-role">
                                            {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                                        </div>
                                    </div>

                                    {user.role === "admin" ? (
                                        <Link href="/admin" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Khu quản trị (Admin)
                                        </Link>
                                    ) : (
                                        <Link href="/checkout" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                            Thanh toán đơn hàng
                                        </Link>
                                    )}

                                    <div className="user-dropdown-item" onClick={handleLogout}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Đăng xuất
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Đăng nhập
                                    </Link>
                                    <Link href="/register" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                        Đăng ký tài khoản
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Hamburger */}
                    <button
                        className="mobile-menu-toggle"
                        id="menu-toggle"
                        aria-label="Toggle menu"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
