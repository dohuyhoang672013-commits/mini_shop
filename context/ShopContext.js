"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { PRODUCTS_DATA } from "../data/products";

const ShopContext = createContext();

export function ShopProvider({ children }) {
    // 1. Core States
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState(null);
    const [toast, setToast] = useState({ show: false, message: "" });
    const [cartOpen, setCartOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // 2. Initial Hydration from localStorage
    useEffect(() => {
        setIsMounted(true);

        // Load Products
        const storedProducts = localStorage.getItem("mini_shop_products");
        if (storedProducts) {
            setProducts(JSON.parse(storedProducts));
        } else {
            setProducts(PRODUCTS_DATA);
            localStorage.setItem("mini_shop_products", JSON.stringify(PRODUCTS_DATA));
        }

        // Load Cart
        const storedCart = localStorage.getItem("mini_shop_cart");
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }

        // Load Wishlist
        const storedWishlist = localStorage.getItem("mini_shop_wishlist");
        if (storedWishlist) {
            setWishlist(JSON.parse(storedWishlist));
        }

        // Load User
        const storedUser = localStorage.getItem("mini_shop_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // Load Orders
        const storedOrders = localStorage.getItem("mini_shop_orders");
        if (storedOrders) {
            setOrders(JSON.parse(storedOrders));
        } else {
            // Initial mock orders
            const defaultOrders = [
                {
                    id: "#GOM98210",
                    customerName: "Nguyễn Văn An",
                    phone: "0987654321",
                    email: "anv@gmail.com",
                    address: "12 Chùa Bộc, Đống Đa, Hà Nội",
                    notes: "Giao giờ hành chính",
                    paymentMethod: "Chuyển khoản",
                    items: [
                        { id: 1, name: "Bình gốm trang trí mộc dáng bầu", price: 320000, quantity: 2 },
                        { id: 3, name: "Đèn tre để bàn thủ công mỹ nghệ", price: 250000, quantity: 1 }
                    ],
                    total: 920000,
                    status: "delivered",
                    createdAt: "05/08/2026, 14:32:10"
                },
                {
                    id: "#GOM32810",
                    customerName: "Trần Thị Bích",
                    phone: "0912345678",
                    email: "btt@gmail.com",
                    address: "45 Lê Lợi, Quận 1, TP. HCM",
                    notes: "",
                    paymentMethod: "COD",
                    items: [
                        { id: 2, name: "Bộ bình gốm tráng men màu minimal", price: 450000, quantity: 1 },
                        { id: 6, name: "Giỏ mây đan tay đa năng có quai cầm", price: 220000, quantity: 2 }
                    ],
                    total: 920000,
                    status: "shipping",
                    createdAt: "06/08/2026, 09:15:22"
                },
                {
                    id: "#GOM82341",
                    customerName: "Lê Hoàng Cường",
                    phone: "0909090909",
                    email: "cle@gmail.com",
                    address: "78 Nguyễn Huệ, Đà Nẵng",
                    notes: "Gọi trước khi giao",
                    paymentMethod: "COD",
                    items: [
                        { id: 7, name: "Tranh treo tường sợi cotton Macrame lớn", price: 380000, quantity: 1 }
                    ],
                    total: 410000,
                    status: "pending",
                    createdAt: "07/08/2026, 08:05:40"
                },
                {
                    id: "#GOM42718",
                    customerName: "Phạm Minh Đức",
                    phone: "0933333333",
                    email: "dpm@gmail.com",
                    address: "22 Trần Hưng Đạo, Cần Thơ",
                    notes: "",
                    paymentMethod: "Chuyển khoản",
                    items: [
                        { id: 4, name: "Bộ bình gốm vân nứt thủ công dáng trà", price: 520000, quantity: 1 }
                    ],
                    total: 550000,
                    status: "cancelled",
                    createdAt: "04/08/2026, 16:48:15"
                }
            ];
            setOrders(defaultOrders);
            localStorage.setItem("mini_shop_orders", JSON.stringify(defaultOrders));
        }
    }, []);

    // 3. Show Toast Feedback helper
    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => {
            setToast({ show: false, message: "" });
        }, 3000);
    };

    // 4. Cart Operations
    const addToCart = (productId, quantity = 1) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        if (product.stock === 0) {
            showToast("Sản phẩm đã hết hàng!");
            return;
        }

        setCart(prevCart => {
            const existingIndex = prevCart.findIndex(item => item.id === productId);
            let newCart = [...prevCart];

            if (existingIndex > -1) {
                const newQty = newCart[existingIndex].quantity + quantity;
                if (product.stock !== undefined && newQty > product.stock) {
                    showToast(`Chỉ còn ${product.stock} sản phẩm trong kho!`);
                    newCart[existingIndex].quantity = product.stock;
                } else {
                    newCart[existingIndex].quantity = newQty;
                    showToast(`Đã cập nhật giỏ hàng: ${product.name}`);
                }
            } else {
                if (product.stock !== undefined && quantity > product.stock) {
                    newCart.push({ ...product, quantity: product.stock });
                    showToast(`Chỉ còn ${product.stock} sản phẩm trong kho!`);
                } else {
                    newCart.push({ ...product, quantity });
                    showToast(`Đã thêm vào giỏ hàng: ${product.name}`);
                }
            }
            
            localStorage.setItem("mini_shop_cart", JSON.stringify(newCart));
            setCartOpen(true);
            return newCart;
        });
    };

    const updateCartQuantity = (productId, newQty) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        setCart(prevCart => {
            let newCart = [...prevCart];
            const idx = newCart.findIndex(item => item.id === productId);
            if (idx > -1) {
                if (newQty <= 0) {
                    newCart.splice(idx, 1);
                    showToast(`Đã xóa khỏi giỏ hàng: ${product.name}`);
                } else {
                    if (product.stock !== undefined && newQty > product.stock) {
                        newCart[idx].quantity = product.stock;
                        showToast(`Chỉ còn ${product.stock} sản phẩm trong kho!`);
                    } else {
                        newCart[idx].quantity = newQty;
                    }
                }
            }
            localStorage.setItem("mini_shop_cart", JSON.stringify(newCart));
            return newCart;
        });
    };

    const removeFromCart = (productId) => {
        const product = products.find(p => p.id === productId);
        setCart(prevCart => {
            const newCart = prevCart.filter(item => item.id !== productId);
            localStorage.setItem("mini_shop_cart", JSON.stringify(newCart));
            if (product) showToast(`Đã xóa khỏi giỏ hàng: ${product.name}`);
            return newCart;
        });
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("mini_shop_cart");
    };

    // 5. Wishlist Operations
    const toggleWishlist = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        setWishlist(prevWishlist => {
            let newWishlist = [...prevWishlist];
            const idx = newWishlist.findIndex(item => item.id === productId);
            if (idx > -1) {
                newWishlist.splice(idx, 1);
                showToast(`Đã gỡ khỏi danh sách yêu thích: ${product.name}`);
            } else {
                newWishlist.push(product);
                showToast(`Đã thêm vào danh sách yêu thích: ${product.name}`);
            }
            localStorage.setItem("mini_shop_wishlist", JSON.stringify(newWishlist));
            return newWishlist;
        });
    };

    const isWishlisted = (productId) => {
        return wishlist.some(item => item.id === productId);
    };

    // 6. User Authentication Operations
    const loginUser = (username, password) => {
        if (password === "123") {
            const role = username === "admin" ? "admin" : "customer";
            const newUser = { username, role };
            setUser(newUser);
            localStorage.setItem("mini_shop_user", JSON.stringify(newUser));
            showToast(`Đăng nhập thành công! Chào mừng ${username}.`);
            return { success: true, role };
        } else {
            showToast("Mật khẩu không đúng! (Dùng mật khẩu mặc định: 123)");
            return { success: false, error: "Incorrect password" };
        }
    };

    const logoutUser = () => {
        setUser(null);
        localStorage.removeItem("mini_shop_user");
        showToast("Đã đăng xuất tài khoản!");
    };

    // 7. Checkout Operations
    const placeOrder = (customerInfo) => {
        const orderId = "#GOM" + Math.floor(Math.random() * 90000 + 10000);
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalAmount = subtotal + 30000; // subtotal + 30k shipping

        const newOrder = {
            id: orderId,
            customerName: customerInfo.name,
            phone: customerInfo.phone,
            email: customerInfo.email || "",
            address: customerInfo.address,
            notes: customerInfo.notes || "",
            paymentMethod: customerInfo.paymentMethod === "cod" ? "COD" : "Chuyển khoản",
            items: [...cart],
            total: totalAmount,
            status: "pending",
            createdAt: new Date().toLocaleString("vi-VN")
        };

        // Deduct product stock
        const updatedProducts = products.map(p => {
            const cartItem = cart.find(c => c.id === p.id);
            if (cartItem) {
                const newStock = Math.max(0, (p.stock || 0) - cartItem.quantity);
                return { ...p, stock: newStock };
            }
            return p;
        });

        // Set state & save
        setProducts(updatedProducts);
        localStorage.setItem("mini_shop_products", JSON.stringify(updatedProducts));

        setOrders(prevOrders => {
            const newOrders = [newOrder, ...prevOrders];
            localStorage.setItem("mini_shop_orders", JSON.stringify(newOrders));
            return newOrders;
        });

        clearCart();
        return orderId;
    };

    // 8. Admin Operations (Products)
    const addProduct = (newProductData) => {
        const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
        const newProduct = {
            id: maxId + 1,
            name: newProductData.name,
            price: newProductData.price,
            stock: newProductData.stock,
            rating: 5.0,
            ratingCount: 1,
            category: newProductData.category,
            categoryName: newProductData.categoryName,
            image: newProductData.image,
            status: newProductData.status,
            badge: "Mới",
            description: newProductData.description
        };

        const updatedProducts = [...products, newProduct];
        setProducts(updatedProducts);
        localStorage.setItem("mini_shop_products", JSON.stringify(updatedProducts));
        showToast(`Đã thêm sản phẩm mới: ${newProductData.name}`);
    };

    const updateProduct = (updatedProductData) => {
        const updatedProducts = products.map(p => {
            if (p.id === updatedProductData.id) {
                return { ...p, ...updatedProductData };
            }
            return p;
        });
        setProducts(updatedProducts);
        localStorage.setItem("mini_shop_products", JSON.stringify(updatedProducts));
        showToast(`Đã cập nhật sản phẩm: ${updatedProductData.name}`);
    };

    const deleteProduct = (productId) => {
        const p = products.find(item => item.id === productId);
        const name = p ? p.name : "Sản phẩm";

        const updatedProducts = products.filter(item => item.id !== productId);
        setProducts(updatedProducts);
        localStorage.setItem("mini_shop_products", JSON.stringify(updatedProducts));
        showToast(`Đã xóa sản phẩm: ${name}`);
    };

    // 9. Admin Operations (Orders)
    const updateOrderStatus = (orderId, newStatus) => {
        const updatedOrders = orders.map(o => {
            if (o.id === orderId) {
                return { ...o, status: newStatus };
            }
            return o;
        });
        setOrders(updatedOrders);
        localStorage.setItem("mini_shop_orders", JSON.stringify(updatedOrders));
        showToast(`Cập nhật thành công đơn hàng ${orderId}`);
    };

    const deleteOrder = (orderId) => {
        const updatedOrders = orders.filter(o => o.id !== orderId);
        setOrders(updatedOrders);
        localStorage.setItem("mini_shop_orders", JSON.stringify(updatedOrders));
        showToast(`Đã xóa đơn hàng ${orderId}`);
    };

    // 10. Expose Provider
    return (
        <ShopContext.Provider
            value={{
                isMounted,
                products,
                cart,
                wishlist,
                orders,
                user,
                toast,
                showToast,
                cartOpen,
                setCartOpen,
                addToCart,
                updateCartQuantity,
                removeFromCart,
                clearCart,
                toggleWishlist,
                isWishlisted,
                loginUser,
                logoutUser,
                placeOrder,
                addProduct,
                updateProduct,
                deleteProduct,
                updateOrderStatus,
                deleteOrder
            }}
        >
            {children}
        </ShopContext.Provider>
    );
}

export function useShop() {
    return useContext(ShopContext);
}
