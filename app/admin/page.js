"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useShop } from "../../context/ShopContext";

export default function AdminPage() {
    const router = useRouter();
    const {
        products,
        orders,
        user,
        authLoading,
        isMounted,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        deleteOrder,
        showToast
    } = useShop();

    const [activeTab, setActiveTab] = useState("overview");
    const [chartLoaded, setChartLoaded] = useState(false);

    // Product pagination
    const [currentProductPage, setCurrentProductPage] = useState(1);
    const productsPerPage = 5;

    // Product form states
    const [editingProduct, setEditingProduct] = useState(null);
    const [prodName, setProdName] = useState("");
    const [prodCategory, setProdCategory] = useState("gom-su-moc");
    const [prodPrice, setProdPrice] = useState("");
    const [prodStock, setProdStock] = useState("");
    const [prodImage, setProdImage] = useState("assets/images/products/do-my-nghe/binh-gom-trang-tri.webp");
    const [prodStatus, setProdStatus] = useState("active");
    const [prodDesc, setProdDesc] = useState("");

    // Refs for Chart.js canvas elements
    const salesCanvasRef = useRef(null);
    const ordersCanvasRef = useRef(null);
    const categoriesCanvasRef = useRef(null);

    // Refs for Chart instances
    const salesChartInstRef = useRef(null);
    const ordersChartInstRef = useRef(null);
    const categoriesChartInstRef = useRef(null);

    const nameInputRef = useRef(null);

    // Guard: check if user is admin
    useEffect(() => {
        if (isMounted && !authLoading) {
            if (!user || user.role !== "admin") {
                alert("Vui lòng đăng nhập tài khoản admin để vào trang quản trị!");
                router.push("/login");
            }
        }
    }, [user, authLoading, isMounted]);

    // Redraw charts when activeTab, orders, products, or Chart.js loads
    useEffect(() => {
        if (!isMounted || !chartLoaded || activeTab !== "overview" || !window.Chart) return;

        // 1. Calculate Stats
        const totalRevenue = orders
            .filter(o => o.status === "delivered")
            .reduce((sum, o) => sum + o.total, 0);

        // --- SALES LINE CHART (Last 7 Days) ---
        if (salesCanvasRef.current) {
            if (salesChartInstRef.current) {
                salesChartInstRef.current.destroy();
            }

            const dates = [];
            const dateStrings = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                dates.push(d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }));
                dateStrings.push(d.toLocaleDateString("vi-VN"));
            }

            const baseValues = [1500000, 2400000, 1800000, 3100000, 2800000, 4200000, 5200000];
            const revenueData = dateStrings.map((dateStr, idx) => {
                const dailyOrders = orders.filter(o => {
                    if (o.status !== "delivered") return false;
                    const orderDatePart = o.createdAt.split(',')[0].trim();
                    const parseDateParts = orderDatePart.split('/');
                    if (parseDateParts.length === 3) {
                        const day = parseDateParts[0].padStart(2, '0');
                        const month = parseDateParts[1].padStart(2, '0');
                        const year = parseDateParts[2];
                        const standardizedOrderDate = `${day}/${month}/${year}`;
                        
                        const queryParts = dateStr.split('/');
                        const queryDay = queryParts[0].padStart(2, '0');
                        const queryMonth = queryParts[1].padStart(2, '0');
                        const queryYear = queryParts[2];
                        const standardizedQueryDate = `${queryDay}/${queryMonth}/${queryYear}`;
                        
                        return standardizedOrderDate === standardizedQueryDate;
                    }
                    return false;
                });
                const orderSum = dailyOrders.reduce((sum, o) => sum + o.total, 0);
                return baseValues[idx] + orderSum;
            });

            salesChartInstRef.current = new window.Chart(salesCanvasRef.current, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Doanh thu',
                        data: revenueData,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#3B82F6'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            padding: 12,
                            backgroundColor: '#0F172A',
                            titleFont: { size: 13, weight: 'bold' },
                            bodyFont: { size: 12 },
                            callbacks: {
                                label: function(context) {
                                    return 'Doanh thu: ' + context.parsed.y.toLocaleString('vi-VN') + 'đ';
                                }
                            }
                        }
                    },
                    scales: {
                        x: { grid: { display: false } },
                        y: {
                            grid: { color: '#F1F5F9' },
                            ticks: {
                                callback: function(value) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                }
                            }
                        }
                    }
                }
            });
        }

        // --- ORDERS DOUGHNUT CHART ---
        if (ordersCanvasRef.current) {
            if (ordersChartInstRef.current) {
                ordersChartInstRef.current.destroy();
            }

            const deliveredCount = orders.filter(o => o.status === "delivered").length;
            const shippingCount = orders.filter(o => o.status === "shipping").length;
            const pendingCount = orders.filter(o => o.status === "pending").length;
            const cancelledCount = orders.filter(o => o.status === "cancelled").length;

            ordersChartInstRef.current = new window.Chart(ordersCanvasRef.current, {
                type: 'doughnut',
                data: {
                    labels: ['Đã giao', 'Đang giao', 'Chờ xử lý', 'Đã hủy'],
                    datasets: [{
                        data: [deliveredCount, shippingCount, pendingCount, cancelledCount],
                        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
                        borderWidth: 2,
                        borderColor: '#FFFFFF'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                font: { size: 11, weight: '600' },
                                padding: 15
                            }
                        }
                    },
                    cutout: '65%'
                }
            });
        }

        // --- CATEGORIES BAR CHART ---
        if (categoriesCanvasRef.current) {
            if (categoriesChartInstRef.current) {
                categoriesChartInstRef.current.destroy();
            }

            const counts = {
                "gom-su-moc": products.filter(p => p.category === "gom-su-moc").length,
                "may-tre-dan": products.filter(p => p.category === "may-tre-dan").length,
                "do-go-moc": products.filter(p => p.category === "do-go-moc").length,
                "noi-that-tho": products.filter(p => p.category === "noi-that-tho").length
            };

            categoriesChartInstRef.current = new window.Chart(categoriesCanvasRef.current, {
                type: 'bar',
                data: {
                    labels: ['Gốm sứ mộc', 'Mây tre đan', 'Đồ gỗ mộc', 'Nội thất thô'],
                    datasets: [{
                        data: [counts["gom-su-moc"], counts["may-tre-dan"], counts["do-go-moc"], counts["noi-that-tho"]],
                        backgroundColor: ['#8F5938', '#2ECC71', '#EF6C00', '#3498DB'],
                        borderRadius: 5,
                        borderWidth: 0,
                        barThickness: 18
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: { grid: { display: false }, ticks: { stepSize: 1 } },
                        y: { grid: { display: false } }
                    }
                }
            });
        }
    }, [activeTab, orders, products, chartLoaded, isMounted]);



    // --- Tab overview statistics calculation ---
    const totalRevenue = orders
        .filter(o => o.status === "delivered")
        .reduce((sum, o) => sum + o.total, 0);

    const lowStockCount = products.filter(p => p.stock <= 10).length;

    const deliveredOrders = orders.filter(o => o.status === "delivered");
    const avgRevenue = deliveredOrders.length > 0 ? Math.round(totalRevenue / deliveredOrders.length) : 0;

    // Last 5 added products
    const recentProducts = [...products].slice(-5).reverse();

    // --- Tab Products processing ---
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === "active").length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    // Pagination
    const indexOfLastProduct = currentProductPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProductsList = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / productsPerPage);

    // Categories tallies
    const categoryCounts = {
        "gom-su-moc": products.filter(p => p.category === "gom-su-moc").length,
        "may-tre-dan": products.filter(p => p.category === "may-tre-dan").length,
        "do-go-moc": products.filter(p => p.category === "do-go-moc").length,
        "noi-that-tho": products.filter(p => p.category === "noi-that-tho").length
    };

    // Images options
    const imageOptions = [
        { label: "Bình gốm trang trí mộc dáng bầu", val: "assets/images/products/do-my-nghe/binh-gom-trang-tri.webp" },
        { label: "Bộ bình gốm tráng men màu minimal", val: "assets/images/products/do-my-nghe/bo-binh-gom-minimal.webp" },
        { label: "Đèn tre để bàn thủ công mỹ nghệ", val: "assets/images/products/do-my-nghe/den-tre-thu-cong.webp" },
        { label: "Đèn lồng tre đan mộc mạc dáng xưa", val: "assets/images/products/do-my-nghe/den-long-tre.webp" },
        { label: "Giỏ mây đan tay đa năng có quai cầm", val: "assets/images/products/do-thu-cong/gio-may-dan.webp" },
        { label: "Tranh treo tường sợi cotton Macrame lớn", val: "assets/images/products/do-thu-cong/tranh-treo-macrame.webp" },
        { label: "Khay gỗ sồi trang trí hình lục giác", val: "assets/images/products/do-thu-cong/khay-go-trang-tri.webp" },
        { label: "Kệ gỗ trang trí treo tường 3 tầng", val: "assets/images/products/noi-that-gia-dung/ke-go-trang-tri.webp" },
        { label: "Ghế sofa phòng khách bọc nỉ chân gỗ thông", val: "assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp" }
    ];

    // --- Product Form Actions ---
    const resetProductForm = () => {
        setEditingProduct(null);
        setProdName("");
        setProdCategory("gom-su-moc");
        setProdPrice("");
        setProdStock("");
        setProdImage("assets/images/products/do-my-nghe/binh-gom-trang-tri.webp");
        setProdStatus("active");
        setProdDesc("");
    };

    if (!isMounted || authLoading || !user || user.role !== "admin") {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--text-muted)", fontSize: "1.1rem" }}>
                Đang xác thực quyền truy cập...
            </div>
        );
    }

    const handleEditClick = (p) => {
        setEditingProduct(p);
        setProdName(p.name);
        setProdCategory(p.category);
        setProdPrice(p.price);
        setProdStock(p.stock);
        setProdImage(p.image);
        setProdStatus(p.status || "active");
        setProdDesc(p.description || "");
        
        if (nameInputRef.current) {
            nameInputRef.current.focus();
        }
    };

    const handleDeleteClick = (id) => {
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
            deleteProduct(id);
            // adjust page if deleting makes the page empty
            const remainingOnPage = products.length - 1 - (currentProductPage - 1) * productsPerPage;
            if (remainingOnPage <= 0 && currentProductPage > 1) {
                setCurrentProductPage(currentProductPage - 1);
            }
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const categoryNames = {
            "gom-su-moc": "Gốm sứ mộc",
            "may-tre-dan": "Mây tre đan",
            "do-go-moc": "Đồ gỗ mộc",
            "noi-that-tho": "Nội thất thô"
        };

        const parsedPrice = parseFloat(prodPrice) || 0;
        const parsedStock = parseInt(prodStock) || 0;

        const productData = {
            name: prodName,
            category: prodCategory,
            categoryName: categoryNames[prodCategory],
            price: parsedPrice,
            stock: parsedStock,
            image: prodImage,
            status: prodStatus,
            description: prodDesc
        };

        if (editingProduct) {
            // Update
            updateProduct({ id: editingProduct.id, ...productData });
        } else {
            // Add
            addProduct(productData);
        }

        resetProductForm();
    };

    const formatVND = (number) => {
        return number.toLocaleString("vi-VN") + "đ";
    };

    const formatImgPath = (path) => {
        if (!path) return "/assets/images/placeholder.webp";
        if (path.startsWith("/")) return path;
        return "/" + path;
    };

    const getProductStatusText = (p) => {
        if (p.status === "inactive") return "Ngừng hoạt động";
        if (p.stock === 0) return "Hết hàng";
        if (p.stock <= 10) return "Kho thấp";
        return "Đang hoạt động";
    };

    const getProductStatusClass = (p) => {
        if (p.status === "inactive") return "inactive";
        if (p.stock === 0) return "out-of-stock";
        if (p.stock <= 10) return "low-stock";
        return "active";
    };

    if (!isMounted || authLoading) {
        return (
            <div style={{ padding: "100px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "1.1rem" }}>
                Đang xác thực quyền truy cập quản trị...
            </div>
        );
    }

    if (!user || user.role !== "admin") {
        return null;
    }

    return (
        <>
            {/* Load Chart.js CDN */}
            <Script
                src="https://cdn.jsdelivr.net/npm/chart.js"
                strategy="lazyOnload"
                onLoad={() => setChartLoaded(true)}
            />

            <div className="admin-wrapper" style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
                {/* Sidebar Menu */}
                <aside className="admin-sidebar" style={{ width: "260px", backgroundColor: "#1E293B", color: "#F8FAFC" }}>
                    <div className="admin-sidebar-header" style={{ padding: "24px 20px", borderBottom: "1px solid #334155" }}>
                        <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#3B82F6" }}>Khu Quản Trị</div>
                        <div style={{ fontSize: "0.8rem", color: "#94A3B8", marginTop: "4px" }}>Cửa Hàng Thủ Công</div>
                    </div>
                    
                    <ul className="admin-menu-list" style={{ listStyle: "none", padding: "20px 0" }}>
                        <li>
                            <button
                                className={`admin-menu-item ${activeTab === "overview" ? "active" : ""}`}
                                onClick={() => setActiveTab("overview")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                </svg>
                                Tổng quan Dashboard
                            </button>
                        </li>
                        <li>
                            <button
                                className={`admin-menu-item ${activeTab === "products" ? "active" : ""}`}
                                onClick={() => { setActiveTab("products"); resetProductForm(); }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                                Quản lý sản phẩm
                            </button>
                        </li>
                        <li>
                            <button
                                className={`admin-menu-item ${activeTab === "orders" ? "active" : ""}`}
                                onClick={() => setActiveTab("orders")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Quản lý đơn hàng
                            </button>
                        </li>
                    </ul>
                </aside>

                {/* Main Admin Area */}
                <main className="admin-content" style={{ flex: 1, padding: "30px" }}>
                    {/* Header */}
                    <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                        <div>
                            <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "#0F172A" }}>
                                {activeTab === "overview" && "Tổng quan Dashboard"}
                                {activeTab === "products" && "Quản lý sản phẩm"}
                                {activeTab === "orders" && "Quản lý đơn hàng"}
                            </h2>
                            <p style={{ color: "#64748B", fontSize: "0.88rem", marginTop: "4px" }}>Chào mừng trở lại, {user.username}.</p>
                        </div>
                        <button
                            className="btn btn-outline"
                            onClick={() => router.push("/")}
                            style={{ height: "40px", borderColor: "#CBD5E1", color: "#475569" }}
                        >
                            Quay lại cửa hàng
                        </button>
                    </div>

                    {/* --- TAB OVERVIEW --- */}
                    {activeTab === "overview" && (
                        <div className="admin-tab-panel active">
                            {/* Stat cards grid */}
                            <div className="admin-stats-grid">
                                {/* Card 1 */}
                                <div className="admin-stat-card">
                                    <div className="stat-info">
                                        <span className="stat-label">Doanh thu</span>
                                        <span className="stat-value" id="stat-revenue">{formatVND(totalRevenue)}</span>
                                    </div>
                                    <div className="stat-icon-wrapper" style={{ backgroundColor: "#ECFDF5", color: "#10B981" }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                {/* Card 2 */}
                                <div className="admin-stat-card">
                                    <div className="stat-info">
                                        <span className="stat-label">Tổng đơn hàng</span>
                                        <span className="stat-value" id="stat-orders">{orders.length}</span>
                                    </div>
                                    <div className="stat-icon-wrapper" style={{ backgroundColor: "#EFF6FF", color: "#3B82F6" }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                    </div>
                                </div>
                                {/* Card 3 */}
                                <div className="admin-stat-card">
                                    <div className="stat-info">
                                        <span className="stat-label">Tổng sản phẩm</span>
                                        <span className="stat-value" id="stat-products">{products.length}</span>
                                    </div>
                                    <div className="stat-icon-wrapper" style={{ backgroundColor: "#F5F3FF", color: "#8B5CF6" }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                        </svg>
                                    </div>
                                </div>
                                {/* Card 4 */}
                                <div className="admin-stat-card">
                                    <div className="stat-info">
                                        <span className="stat-label">Kho thấp</span>
                                        <span className="stat-value" id="stat-low-stock">{lowStockCount}</span>
                                    </div>
                                    <div className="stat-icon-wrapper" style={{ backgroundColor: "#FFF7ED", color: "#F97316" }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Middle section: Chart & Recent products table */}
                            <div className="admin-charts-grid" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px", marginBottom: "24px" }}>
                                <div className="admin-chart-card">
                                    <div className="chart-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                        <div>
                                            <h3 style={{ fontSize: "1.08rem", fontWeight: "700" }}>Biểu đồ Doanh thu (7 ngày qua)</h3>
                                            <span style={{ fontSize: "0.78rem", color: "#64748B" }}>Doanh thu thực nhận dựa trên đơn hàng đã giao thành công</span>
                                        </div>
                                    </div>
                                    
                                    {/* Sub-stats for charts */}
                                    <div className="chart-legend-stats" style={{ display: "flex", gap: "30px", marginBottom: "20px", borderBottom: "1px solid #E2E8F0", paddingBottom: "15px" }}>
                                        <div>
                                            <div style={{ fontSize: "0.75rem", color: "#64748B" }}>Doanh thu</div>
                                            <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#1E293B" }} id="chart-total-sales">{formatVND(totalRevenue)}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "0.75rem", color: "#64748B" }}>Số đơn đặt</div>
                                            <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#1E293B" }} id="chart-orders-count">{orders.length}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "0.75rem", color: "#64748B" }}>Đơn giá TB</div>
                                            <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#1E293B" }} id="chart-avg-order">{formatVND(avgRevenue)}</div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ height: "240px", position: "relative" }}>
                                        <canvas ref={salesCanvasRef} id="salesChart"></canvas>
                                    </div>
                                </div>
                                
                                {/* Recent Products List */}
                                <div className="admin-chart-card">
                                    <h3 style={{ fontSize: "1.08rem", fontWeight: "700", marginBottom: "15px" }}>Sản phẩm mới thêm</h3>
                                    <div className="recent-products-table-wrapper" style={{ overflowX: "auto" }}>
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Sản phẩm</th>
                                                    <th>Giá bán</th>
                                                    <th>Tồn</th>
                                                    <th>Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody id="recent-products-list">
                                                {recentProducts.map((p) => (
                                                    <tr key={p.id}>
                                                        <td>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                <img
                                                                    src={formatImgPath(p.image)}
                                                                    alt={p.name}
                                                                    style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover" }}
                                                                    onError={(e) => { e.target.src = "/assets/images/placeholder.webp"; }}
                                                                />
                                                                <div>
                                                                    <div style={{ fontWeight: "600", color: "#1E293B", fontSize: "0.85rem", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                        {p.name}
                                                                    </div>
                                                                    <div style={{ fontSize: "0.72rem", color: "#64748B" }}>{p.categoryName}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontWeight: "700", color: "#0F172A", fontSize: "0.85rem" }}>{formatVND(p.price)}</td>
                                                        <td style={{ fontWeight: "600", color: "#475569", fontSize: "0.85rem" }}>{p.stock}</td>
                                                        <td>
                                                            <span className={`status-pill ${getProductStatusClass(p)}`} style={{ fontSize: "0.7rem", padding: "3px 6px" }}>
                                                                <span className="status-dot"></span> {getProductStatusText(p)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom charts row */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                                <div className="admin-chart-card">
                                    <h3 style={{ fontSize: "1.08rem", fontWeight: "700", marginBottom: "20px" }}>Tỷ lệ Trạng thái đơn đặt</h3>
                                    <div style={{ height: "220px", position: "relative" }}>
                                        <canvas ref={ordersCanvasRef} id="ordersChart"></canvas>
                                    </div>
                                </div>
                                <div className="admin-chart-card">
                                    <h3 style={{ fontSize: "1.08rem", fontWeight: "700", marginBottom: "20px" }}>Sản phẩm theo Danh mục</h3>
                                    <div style={{ height: "220px", position: "relative" }}>
                                        <canvas ref={categoriesCanvasRef} id="categoriesChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB PRODUCTS --- */}
                    {activeTab === "products" && (
                        <div className="admin-tab-panel active">
                            <div className="product-mgmt-layout" style={{ display: "grid", gridTemplateColumns: "220px 1fr 340px", gap: "24px" }}>
                                
                                {/* Left column: Summary numbers */}
                                <div className="product-mgmt-sidebar" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <div className="summary-stat-card">
                                        <span className="summary-stat-label">Tổng sản phẩm</span>
                                        <span className="summary-stat-value" id="prod-total-count">{totalProducts}</span>
                                    </div>
                                    <div className="summary-stat-card">
                                        <span className="summary-stat-label">Đang hoạt động</span>
                                        <span className="summary-stat-value" id="prod-active-count">{activeProducts}</span>
                                    </div>
                                    <div className="summary-stat-card">
                                        <span className="summary-stat-label">Đã hết hàng</span>
                                        <span className="summary-stat-value" id="prod-out-stock-count">{outOfStockCount}</span>
                                    </div>
                                    <div className="summary-stat-card">
                                        <span className="summary-stat-label">Cảnh báo kho thấp</span>
                                        <span className="summary-stat-value" id="prod-low-stock-count">{lowStockCount}</span>
                                    </div>
                                </div>

                                {/* Middle column: Tables list */}
                                <div className="product-mgmt-main" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                    
                                    {/* Products Table Card */}
                                    <div className="admin-chart-card" style={{ padding: "20px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                                            <h3 style={{ fontSize: "1.08rem", fontWeight: "700" }}>Danh sách Sản phẩm</h3>
                                            <button
                                                className="btn btn-primary"
                                                onClick={resetProductForm}
                                                style={{ height: "32px", fontSize: "0.8rem", padding: "0 12px" }}
                                            >
                                                + Thêm mới
                                            </button>
                                        </div>
                                        
                                        <div style={{ overflowX: "auto" }}>
                                            <table className="admin-table">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Sản phẩm</th>
                                                        <th>Đơn giá</th>
                                                        <th>Tồn kho</th>
                                                        <th>Trạng thái</th>
                                                        <th>Hành động</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="all-products-list">
                                                    {currentProductsList.map((p) => {
                                                        const isEditing = editingProduct && editingProduct.id === p.id;
                                                        return (
                                                            <tr key={p.id} className={isEditing ? "editing-row-highlight" : ""}>
                                                                <td style={{ fontWeight: "700", color: "#64748B" }}>#{p.id}</td>
                                                                <td>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                        <img
                                                                            src={formatImgPath(p.image)}
                                                                            alt={p.name}
                                                                            style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover" }}
                                                                            onError={(e) => { e.target.src = "/assets/images/placeholder.webp"; }}
                                                                        />
                                                                        <div>
                                                                            <div style={{ fontWeight: "600", color: "#1E293B", fontSize: "0.88rem" }}>{p.name}</div>
                                                                            <div style={{ fontSize: "0.72rem", color: "#64748B" }}>{p.categoryName}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td style={{ fontWeight: "700", color: "#0F172A" }}>{formatVND(p.price)}</td>
                                                                <td style={{ fontWeight: "600", color: "#475569" }}>{p.stock}</td>
                                                                <td>
                                                                    <span className={`status-pill ${getProductStatusClass(p)}`}>
                                                                        <span className="status-dot"></span> {getProductStatusText(p)}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div className="table-actions">
                                                                        <button className="table-btn-edit" onClick={() => handleEditClick(p)} title="Sửa">
                                                                            Sửa
                                                                        </button>
                                                                        <button className="table-btn-delete" onClick={() => handleDeleteClick(p.id)} title="Xóa">
                                                                            Xóa
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="admin-pagination" id="products-pagination" style={{ display: "flex", gap: "6px", marginTop: "20px", justifyContent: "flex-end" }}>
                                                <button
                                                    className="page-btn"
                                                    disabled={currentProductPage === 1}
                                                    onClick={() => setCurrentProductPage(currentProductPage - 1)}
                                                >
                                                    &lt;
                                                </button>
                                                {Array.from({ length: totalPages }, (_, idx) => (
                                                    <button
                                                        key={idx + 1}
                                                        className={`page-btn ${currentProductPage === idx + 1 ? "active" : ""}`}
                                                        onClick={() => setCurrentProductPage(idx + 1)}
                                                    >
                                                        {idx + 1}
                                                    </button>
                                                ))}
                                                <button
                                                    className="page-btn"
                                                    disabled={currentProductPage === totalPages}
                                                    onClick={() => setCurrentProductPage(currentProductPage + 1)}
                                                >
                                                    &gt;
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Categories Table */}
                                    <div className="admin-chart-card" style={{ padding: "20px" }}>
                                        <h3 style={{ fontSize: "1.08rem", fontWeight: "700", marginBottom: "15px" }}>Danh mục Sản phẩm</h3>
                                        <div style={{ overflowX: "auto" }}>
                                            <table className="admin-table">
                                                <thead>
                                                    <tr>
                                                        <th>Mã DM</th>
                                                        <th>Tên danh mục</th>
                                                        <th>Chất liệu</th>
                                                        <th>Số sản phẩm</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td style={{ fontWeight: "700", color: "#64748B" }}>gom-su-moc</td>
                                                        <td style={{ fontWeight: "600", color: "#1E293B" }}>Gốm sứ mộc</td>
                                                        <td>Đất nung, Men lì nung cao độ</td>
                                                        <td style={{ fontWeight: "700", color: "#3B82F6" }}>{categoryCounts["gom-su-moc"]}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ fontWeight: "700", color: "#64748B" }}>may-tre-dan</td>
                                                        <td style={{ fontWeight: "600", color: "#1E293B" }}>Mây tre đan</td>
                                                        <td>Mây song tự nhiên, Tre già nan mảnh</td>
                                                        <td style={{ fontWeight: "700", color: "#3B82F6" }}>{categoryCounts["may-tre-dan"]}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ fontWeight: "700", color: "#64748B" }}>do-go-moc</td>
                                                        <td style={{ fontWeight: "600", color: "#1E293B" }}>Đồ gỗ mộc</td>
                                                        <td>Gỗ sồi, Gỗ thông mộc tự nhiên</td>
                                                        <td style={{ fontWeight: "700", color: "#3B82F6" }}>{categoryCounts["do-go-moc"]}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ fontWeight: "700", color: "#64748B" }}>noi-that-tho</td>
                                                        <td style={{ fontWeight: "600", color: "#1E293B" }}>Nội thất thô</td>
                                                        <td>Gỗ dày nguyên tấm, Khung sắt thô ráp</td>
                                                        <td style={{ fontWeight: "700", color: "#3B82F6" }}>{categoryCounts["noi-that-tho"]}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Right column: Sticky Form Panel */}
                                <div className="product-mgmt-form-panel">
                                    <div className="admin-form-sticky-card">
                                        <h3 className="form-card-title" id="form-panel-title" style={{ fontSize: "1.08rem", fontWeight: "700", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px", marginBottom: "16px" }}>
                                            {editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
                                        </h3>
                                        
                                        <form onSubmit={handleFormSubmit}>
                                            <div className="form-group" style={{ marginBottom: "14px" }}>
                                                <label className="form-label">Tên sản phẩm</label>
                                                <input
                                                    type="text"
                                                    ref={nameInputRef}
                                                    className="form-input"
                                                    placeholder="Ví dụ: Bình gốm xanh nhám"
                                                    value={prodName}
                                                    onChange={(e) => setProdName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="form-group" style={{ marginBottom: "14px" }}>
                                                <label className="form-label">Danh mục</label>
                                                <select
                                                    className="form-input"
                                                    value={prodCategory}
                                                    onChange={(e) => setProdCategory(e.target.value)}
                                                >
                                                    <option value="gom-su-moc">Gốm sứ mộc</option>
                                                    <option value="may-tre-dan">Mây tre đan</option>
                                                    <option value="do-go-moc">Đồ gỗ mộc</option>
                                                    <option value="noi-that-tho">Nội thất thô</option>
                                                </select>
                                            </div>
                                            
                                            <div className="form-group" style={{ marginBottom: "14px" }}>
                                                <label className="form-label">Đơn giá (VND)</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    placeholder="Ví dụ: 350000"
                                                    value={prodPrice}
                                                    onChange={(e) => setProdPrice(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="form-group" style={{ marginBottom: "14px" }}>
                                                <label className="form-label">Số lượng tồn</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    placeholder="Ví dụ: 15"
                                                    value={prodStock}
                                                    onChange={(e) => setProdStock(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="form-group" style={{ marginBottom: "14px" }}>
                                                <label className="form-label">Hình ảnh minh họa</label>
                                                <select
                                                    className="form-input"
                                                    value={prodImage}
                                                    onChange={(e) => setProdImage(e.target.value)}
                                                >
                                                    {imageOptions.map((opt, i) => (
                                                        <option key={i} value={opt.val}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            <div className="form-group" style={{ marginBottom: "14px" }}>
                                                <label className="form-label">Trạng thái hoạt động</label>
                                                <select
                                                    className="form-input"
                                                    value={prodStatus}
                                                    onChange={(e) => setProdStatus(e.target.value)}
                                                >
                                                    <option value="active">Đang hoạt động (Active)</option>
                                                    <option value="inactive">Ngừng hoạt động (Inactive)</option>
                                                </select>
                                            </div>
                                            
                                            <div className="form-group" style={{ marginBottom: "20px" }}>
                                                <label className="form-label">Mô tả sản phẩm</label>
                                                <textarea
                                                    className="form-input"
                                                    style={{ height: "80px", padding: "8px 12px", resize: "none" }}
                                                    placeholder="Nhập mô tả sản phẩm..."
                                                    value={prodDesc}
                                                    onChange={(e) => setProdDesc(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="form-actions-row" style={{ display: "flex", gap: "10px" }}>
                                                <button type="submit" className="btn btn-primary" style={{ flex: 1, height: "38px" }}>
                                                    Lưu lại
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline"
                                                    onClick={resetProductForm}
                                                    style={{ flex: 1, height: "38px" }}
                                                >
                                                    Hủy bỏ
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB ORDERS --- */}
                    {activeTab === "orders" && (
                        <div className="admin-tab-panel active">
                            <div className="admin-chart-card" style={{ padding: "20px" }}>
                                <h3 style={{ fontSize: "1.08rem", fontWeight: "700", marginBottom: "15px" }}>Danh sách Đơn hàng đặt</h3>
                                <div style={{ overflowX: "auto" }}>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Khách nhận</th>
                                                <th>Chi tiết sản phẩm</th>
                                                <th>Tổng tiền</th>
                                                <th>Ngày đặt</th>
                                                <th>Trạng thái</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                                                        Chưa có đơn hàng nào được ghi nhận.
                                                    </td>
                                                </tr>
                                            ) : (
                                                orders.map((o) => (
                                                    <tr key={o.id}>
                                                        <td style={{ fontWeight: "700", color: "#3B82F6" }}>{o.id}</td>
                                                        <td>
                                                            <div>
                                                                <div style={{ fontWeight: "600", color: "#1E293B" }}>{o.customerName}</div>
                                                                <div style={{ fontSize: "0.78rem", color: "#64748B" }}>SĐT: {o.phone}</div>
                                                                <div style={{ fontSize: "0.72rem", color: "#64748B", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={o.address}>
                                                                    ĐC: {o.address}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontSize: "0.85rem", color: "#475569" }}>
                                                                {o.items.map((item, idx) => (
                                                                    <div key={idx}>
                                                                        - {item.name} <strong style={{ color: "#0F172A" }}>x{item.quantity}</strong>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td style={{ fontWeight: "700", color: "#10B981" }}>{formatVND(o.total)}</td>
                                                        <td style={{ fontSize: "0.8rem", color: "#64748B" }}>{o.createdAt}</td>
                                                        <td>
                                                            <select
                                                                className="sort-select"
                                                                style={{ padding: "4px 8px", fontSize: "0.8rem", height: "30px", border: "1px solid #CBD5E1" }}
                                                                value={o.status}
                                                                onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                                                            >
                                                                <option value="pending">Chờ xử lý</option>
                                                                <option value="shipping">Đang giao</option>
                                                                <option value="delivered">Đã giao</option>
                                                                <option value="cancelled">Đã hủy</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="table-btn-delete"
                                                                onClick={() => {
                                                                    if (confirm(`Bạn có chắc chắn muốn xóa đơn hàng ${o.id}?`)) {
                                                                        deleteOrder(o.id);
                                                                    }
                                                                }}
                                                                style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                                                            >
                                                                Xóa
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
