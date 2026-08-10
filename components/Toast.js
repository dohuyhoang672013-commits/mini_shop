"use client";

import React from "react";
import { useShop } from "../context/ShopContext";

export default function Toast() {
    const { toast } = useShop();

    if (!toast.show) return null;

    return (
        <div className="toast-container" id="toast-container" style={{ zIndex: 9999 }}>
            <div className="toast show">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "20px", height: "20px", color: "var(--primary-color)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{toast.message}</span>
            </div>
        </div>
    );
}
