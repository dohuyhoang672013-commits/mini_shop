"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useShop } from "../../context/ShopContext";

export default function LoginPage() {
    const router = useRouter();
    const { user, loginUser, isMounted } = useShop();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // If already logged in, redirect to home
    useEffect(() => {
        if (isMounted && user) {
            if (user.role === "admin") {
                router.push("/admin");
            } else {
                router.push("/");
            }
        }
    }, [user, isMounted]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await loginUser(email, password);

        if (res.success) {
            const checkoutIntent = sessionStorage.getItem("mini_shop_checkout_intent");
            setTimeout(() => {
                if (checkoutIntent === "true") {
                    sessionStorage.removeItem("mini_shop_checkout_intent");
                    router.push("/checkout");
                } else {
                    if (res.role === "admin") {
                        router.push("/admin");
                    } else {
                        router.push("/");
                    }
                }
            }, 1000);
        }
    };

    if (!isMounted) {
        return (
            <div className="container section">
                <div style={{ textAlign: "center", padding: "60px 0" }}>Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="container section">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Chào mừng quay lại</h2>
                        <p>Nhập tài khoản của bạn để tiếp tục mua sắm</p>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Địa chỉ Email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Email của bạn (ví dụ: customer@example.com)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Mật khẩu</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Mật khẩu (ví dụ: 123)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        
                        <button type="submit" className="btn btn-primary" style={{ width: "100%", height: "44px", marginTop: "10px" }}>
                            Đăng nhập
                        </button>
                    </form>
                    
                    <div className="auth-footer">
                        <span>Bạn chưa có tài khoản?</span>
                        <Link href="/register">Đăng ký ngay</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
