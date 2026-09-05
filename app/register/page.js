"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useShop } from "../../context/ShopContext";

export default function RegisterPage() {
    const router = useRouter();
    const { user, loginUser, registerUser, showToast, isMounted } = useShop();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // If already logged in, redirect to home
    useEffect(() => {
        if (isMounted && user) {
            router.push("/");
        }
    }, [user, isMounted]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showToast("Mật khẩu xác nhận không khớp!");
            return;
        }

        const res = await registerUser(username, email, password);

        if (res.success) {
            showToast("Đăng ký thành công! Đang tự động đăng nhập...");
            const loginRes = await loginUser(email, password);
            if (loginRes.success) {
                const checkoutIntent = sessionStorage.getItem("mini_shop_checkout_intent");
                setTimeout(() => {
                    if (checkoutIntent === "true") {
                        sessionStorage.removeItem("mini_shop_checkout_intent");
                        router.push("/checkout");
                    } else {
                        router.push("/");
                    }
                }, 1000);
            }
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
                        <h2>Đăng ký tài khoản</h2>
                        <p>Tạo tài khoản mới tại Tiệm Gốm & Decor</p>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Tên tài khoản</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Tên đăng nhập mong muốn"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Địa chỉ email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Email của bạn..."
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
                                placeholder="Mật khẩu của bạn..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Nhập lại mật khẩu..."
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        
                        <button type="submit" className="btn btn-primary" style={{ width: "100%", height: "44px", marginTop: "10px" }}>
                            Đăng ký
                        </button>
                    </form>
                    
                    <div className="auth-footer">
                        <span>Bạn đã có tài khoản?</span>
                        <Link href="/login">Đăng nhập</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
