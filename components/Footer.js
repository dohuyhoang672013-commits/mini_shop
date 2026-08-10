"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useShop } from "../context/ShopContext";

export default function Footer() {
    const { showToast } = useShop();
    const [email, setEmail] = useState("");

    const handleNewsletterSubmit = (event) => {
        event.preventDefault();
        if (email.trim()) {
            showToast(`Đã gửi! Cảm ơn bạn đã đăng ký: ${email}`);
            setEmail("");
        }
    };

    return (
        <footer className="site-footer">
            <div className="container">
                <div className="footer-top">
                    {/* Column 1: Brand Info */}
                    <div className="footer-col footer-about">
                        <span className="footer-logo">Tiệm Gốm & Decor</span>
                        <p>Mang thiên nhiên và chất liệu mộc mạc vào không gian sống của bạn với các sản phẩm làm hoàn toàn bằng tay, tỉ mỉ và ấm áp.</p>
                        <div className="footer-socials">
                            <a href="#" className="social-link" title="Facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" />
                                </svg>
                            </a>
                            <a href="#" className="social-link" title="Instagram">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 6.5h.01M9 16.5h.01M15 16.5h.01" />
                                </svg>
                            </a>
                            <a href="#" className="social-link" title="Pinterest">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="footer-col">
                        <h3>Liên kết</h3>
                        <ul className="footer-links">
                            <li><Link href="/">Trang chủ</Link></li>
                            <li><Link href="/products">Sản phẩm</Link></li>
                            <li><a href="#">Câu chuyện thương hiệu</a></li>
                            <li><a href="#">Vật liệu tự nhiên</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div className="footer-col footer-contact">
                        <h3>Thông tin</h3>
                        <p>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>123 Đường Láng, Láng Thượng, Đống Đa, Hà Nội</span>
                        </p>
                        <p>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>0987 654 321</span>
                        </p>
                        <p>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>lienhe@tiemgomdecor.vn</span>
                        </p>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div className="footer-col">
                        <h3>Đăng ký nhận tin</h3>
                        <div className="newsletter-form">
                            <p>Đăng ký nhận ưu đãi giảm giá 10% cho lần mua hàng đầu tiên!</p>
                            <form onSubmit={handleNewsletterSubmit} className="newsletter-input-group">
                                <input
                                    type="email"
                                    placeholder="Email của bạn..."
                                    className="newsletter-input"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <button type="submit" className="newsletter-btn" aria-label="Gửi">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="footer-bottom">
                    <p>&copy; 2026 Tiệm Gốm & Decor. Bảo lưu mọi quyền.</p>
                    <div className="footer-bottom-links">
                        <a href="#">Chính sách bảo mật</a>
                        <a href="#">Điều khoản sử dụng</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
