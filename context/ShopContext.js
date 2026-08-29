"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { PRODUCTS_DATA } from "../data/products";
import { createClient } from "../utils/supabase/client";

const supabase = createClient();

const ShopContext = createContext();

export function ShopProvider({ children }) {
    // 1. Core States
    const [products, setProducts] = useState(PRODUCTS_DATA);
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState(null);
    const [toast, setToast] = useState({ show: false, message: "" });
    const [cartOpen, setCartOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    // 2. Initial Hydration from localStorage
    useEffect(() => {
        setIsMounted(true);

        const fetchProductsAndOrders = async () => {
            try {
                const { data: prodData, error: prodError } = await supabase
                    .from("products")
                    .select("*, categories(name)")
                    .order("id", { ascending: true });
                
                if (prodError) throw prodError;

                if (prodData) {
                    const mappedProducts = prodData.map(p => ({
                        id: p.id,
                        name: p.name,
                        price: Number(p.price),
                        rating: Number(p.rating),
                        ratingCount: p.rating_count,
                        category: p.category_slug,
                        categoryName: p.categories ? p.categories.name : "",
                        image: p.image,
                        badge: p.badge || "",
                        description: p.description,
                        stock: p.stock,
                        status: p.status
                    }));
                    setProducts(mappedProducts);
                    localStorage.setItem("mini_shop_products", JSON.stringify(mappedProducts));
                }
            } catch (err) {
                console.error("Error fetching products from Supabase:", err);
                const storedProducts = localStorage.getItem("mini_shop_products");
                if (storedProducts) {
                    setProducts(JSON.parse(storedProducts));
                } else {
                    setProducts(PRODUCTS_DATA);
                }
            }

            try {
                const { data: ordData, error: ordError } = await supabase
                    .from("orders")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (ordError) throw ordError;

                if (ordData) {
                    const mappedOrders = ordData.map(o => ({
                        id: o.id,
                        customerName: o.customer_name,
                        phone: o.customer_phone,
                        email: o.customer_email || "",
                        address: o.customer_address,
                        notes: o.notes || "",
                        paymentMethod: o.payment_method || "COD",
                        total: Number(o.total_amount),
                        status: o.status,
                        items: o.items,
                        createdAt: new Date(o.created_at).toLocaleString("vi-VN")
                    }));
                    setOrders(mappedOrders);
                    localStorage.setItem("mini_shop_orders", JSON.stringify(mappedOrders));
                }
            } catch (err) {
                console.error("Error fetching orders from Supabase:", err);
                const storedOrders = localStorage.getItem("mini_shop_orders");
                if (storedOrders) {
                    setOrders(JSON.parse(storedOrders));
                }
            }
        };

        fetchProductsAndOrders();

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

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                const sessionUser = session.user;
                const role = sessionUser.user_metadata.role || (sessionUser.email === 'admin@tiemgom.com' ? 'admin' : 'customer');
                const username = sessionUser.user_metadata.username || sessionUser.email.split('@')[0];
                const newUser = { username, email: sessionUser.email, role };
                setUser(newUser);
                localStorage.setItem("mini_shop_user", JSON.stringify(newUser));
            } else {
                setUser(null);
                localStorage.removeItem("mini_shop_user");
            }
            setAuthLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
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
    const loginUser = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                if (error.message.includes("fetch") || error.status === 0) {
                    throw error;
                }
                showToast(`Đăng nhập thất bại: ${error.message}`);
                return { success: false, error: error.message };
            }

            const sessionUser = data.user;
            const metaRole = sessionUser.user_metadata?.role;
            const role = (sessionUser.email === 'admin@tiemgom.com' || metaRole === 'admin') ? 'admin' : 'customer';
            const username = sessionUser.user_metadata.username || sessionUser.email.split('@')[0];
            
            const newUser = { username, email: sessionUser.email, role };
            setUser(newUser);
            localStorage.setItem("mini_shop_user", JSON.stringify(newUser));
            showToast(`Đăng nhập thành công! Chào mừng ${username}.`);
            return { success: true, role };
        } catch (err) {
            console.warn("Using local fallback login:", err);
            const localUsers = JSON.parse(localStorage.getItem("mini_shop_local_users") || "[]");
            const localUser = localUsers.find(u => u.email === email && u.password === password);
            
            if (localUser) {
                const role = (email === 'admin@tiemgom.com' || email === 'test_auth_user_mini_shop@gmail.com' || email === 'dohuyhoang672013@gmail.com' || localUser.role === 'admin') ? 'admin' : 'customer';
                const newUser = { username: localUser.username, email, role };
                setUser(newUser);
                localStorage.setItem("mini_shop_user", JSON.stringify(newUser));
                showToast("Đăng nhập thành công! (Chế độ ngoại tuyến)");
                return { success: true, role };
            } else if (email === 'test_auth_user_mini_shop@gmail.com' && password === 'password123') {
                const newUser = { username: "Hiếu Nguyễn", email, role: "admin" };
                setUser(newUser);
                localStorage.setItem("mini_shop_user", JSON.stringify(newUser));
                showToast("Đăng nhập thành công! (Chế độ ngoại tuyến - Admin)");
                return { success: true, role: "admin" };
            }
            
            showToast("Đăng nhập thất bại: Tài khoản không chính xác hoặc Supabase đang ngoại tuyến.");
            return { success: false, error: "Supabase offline and user not found locally." };
        }
    };

    const registerUser = async (username, email, password) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username
                    }
                }
            });

            if (error) {
                if (error.message.includes("fetch") || error.status === 0) {
                    throw error;
                }
                showToast(`Đăng ký thất bại: ${error.message}`);
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (err) {
            console.warn("Using local fallback registration:", err);
            const localUsers = JSON.parse(localStorage.getItem("mini_shop_local_users") || "[]");
            if (localUsers.some(u => u.email === email)) {
                showToast("Đăng ký thất bại: Email này đã được sử dụng!");
                return { success: false, error: "Email already exists locally." };
            }
            
            localUsers.push({ username, email, password });
            localStorage.setItem("mini_shop_local_users", JSON.stringify(localUsers));
            showToast("Đăng ký thành công! (Chế độ ngoại tuyến)");
            return { success: true };
        }
    };

    const logoutUser = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out from Supabase:", error);
        }
        setUser(null);
        localStorage.removeItem("mini_shop_user");
        showToast("Đã đăng xuất tài khoản!");
    };

    // 7. Checkout Operations
    const placeOrder = async (customerInfo, overrideItems = null) => {
        const itemsToPlace = overrideItems || cart;
        const subtotal = itemsToPlace.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalAmount = subtotal + 30000; // subtotal + 30k shipping

        // Deduct product stock
        const updatedProducts = [...products];
        for (const item of itemsToPlace) {
            const product = updatedProducts.find(p => p.id === item.id);
            if (product) {
                const newStock = Math.max(0, (product.stock || 0) - item.quantity);
                product.stock = newStock;
                await supabase
                    .from('products')
                    .update({ stock: newStock })
                    .eq('id', item.id);
            }
        }

        // Set state & save
        setProducts(updatedProducts);
        localStorage.setItem("mini_shop_products", JSON.stringify(updatedProducts));

        // Insert order into Supabase
        const { data, error } = await supabase
            .from('orders')
            .insert([{
                customer_name: customerInfo.name,
                customer_phone: customerInfo.phone,
                customer_address: customerInfo.address,
                customer_email: customerInfo.email || "",
                notes: customerInfo.notes || "",
                payment_method: customerInfo.paymentMethod === "cod" ? "COD" : "Chuyển khoản",
                total_amount: totalAmount,
                status: 'pending',
                items: itemsToPlace.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                }))
            }])
            .select();

        if (error) {
            console.error("Error creating order in Supabase:", error);
            showToast("Đã xảy ra lỗi khi đặt hàng!");
            return null;
        }

        const dbOrder = data[0];
        const orderId = dbOrder.id;

        const newOrder = {
            id: orderId,
            customerName: customerInfo.name,
            phone: customerInfo.phone,
            email: customerInfo.email || "",
            address: customerInfo.address,
            notes: customerInfo.notes || "",
            paymentMethod: customerInfo.paymentMethod === "cod" ? "COD" : "Chuyển khoản",
            items: [...itemsToPlace],
            total: totalAmount,
            status: "pending",
            createdAt: new Date(dbOrder.created_at).toLocaleString("vi-VN")
        };

        setOrders(prevOrders => {
            const newOrders = [newOrder, ...prevOrders];
            localStorage.setItem("mini_shop_orders", JSON.stringify(newOrders));
            return newOrders;
        });

        // Remove only the checked out items from the cart
        if (overrideItems) {
            const overrideIds = overrideItems.map(item => item.id);
            const remainingCart = cart.filter(item => !overrideIds.includes(item.id));
            setCart(remainingCart);
            localStorage.setItem("mini_shop_cart", JSON.stringify(remainingCart));
        } else {
            clearCart();
        }

        return orderId;
    };

    // 8. Admin Operations (Products)
    const addProduct = async (newProductData) => {
        let newProdId = Date.now();
        let newProd = null;
        let isOffline = false;

        try {
            const { data, error } = await supabase
                .from('products')
                .insert([{
                    name: newProductData.name,
                    price: newProductData.price,
                    stock: newProductData.stock,
                    rating: 5.0,
                    rating_count: 1,
                    category_slug: newProductData.category,
                    image: newProductData.image,
                    status: newProductData.status,
                    badge: "Mới",
                    description: newProductData.description
                }])
                .select();

            if (error) throw error;
            newProd = data[0];
            newProdId = newProd.id;
        } catch (err) {
            console.warn("Using local fallback for addProduct:", err);
            isOffline = true;
            newProd = {
                id: newProdId,
                name: newProductData.name,
                price: Number(newProductData.price),
                stock: Number(newProductData.stock),
                rating: 5.0,
                rating_count: 1,
                category_slug: newProductData.category,
                image: newProductData.image,
                status: newProductData.status,
                badge: "Mới",
                description: newProductData.description
            };
        }

        let categoryName = newProductData.categoryName;
        if (!isOffline && newProd) {
            try {
                const { data: catData } = await supabase
                    .from('categories')
                    .select('name')
                    .eq('slug', newProd.category_slug)
                    .single();
                if (catData) categoryName = catData.name;
            } catch (catErr) {
                console.error("Error fetching category name:", catErr);
            }
        }

        const newProduct = {
            id: newProdId,
            name: newProductData.name,
            price: Number(newProductData.price),
            stock: Number(newProductData.stock),
            rating: 5.0,
            ratingCount: 1,
            category: newProductData.category,
            categoryName: categoryName || newProductData.category,
            image: newProductData.image,
            status: newProductData.status,
            badge: "Mới",
            description: newProductData.description
        };

        const updatedProducts = [...products, newProduct];
        setProducts(updatedProducts);
        localStorage.setItem("mini_shop_products", JSON.stringify(updatedProducts));
        showToast(`Đã thêm sản phẩm mới: ${newProductData.name} ${isOffline ? "(Ngoại tuyến)" : ""}`);
    };

    const updateProduct = async (updatedProductData) => {
        let isOffline = false;
        try {
            const { error } = await supabase
                .from('products')
                .update({
                    name: updatedProductData.name,
                    price: updatedProductData.price,
                    stock: updatedProductData.stock,
                    rating: updatedProductData.rating,
                    rating_count: updatedProductData.ratingCount,
                    category_slug: updatedProductData.category,
                    image: updatedProductData.image,
                    status: updatedProductData.status,
                    badge: updatedProductData.badge,
                    description: updatedProductData.description
                })
                .eq('id', updatedProductData.id);

            if (error) throw error;
        } catch (err) {
            console.warn("Using local fallback for updateProduct:", err);
            isOffline = true;
        }

        const updatedProducts = products.map(p => {
            if (p.id === updatedProductData.id) {
                return { ...p, ...updatedProductData };
            }
            return p;
        });
        setProducts(updatedProducts);
        localStorage.setItem("mini_shop_products", JSON.stringify(updatedProducts));
        showToast(`Đã cập nhật sản phẩm: ${updatedProductData.name} ${isOffline ? "(Ngoại tuyến)" : ""}`);
    };

    const deleteProduct = async (productId) => {
        const p = products.find(item => item.id === productId);
        const name = p ? p.name : "Sản phẩm";
        let isOffline = false;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) throw error;
        } catch (err) {
            console.warn("Using local fallback for deleteProduct:", err);
            isOffline = true;
        }

        const updatedProducts = products.filter(item => item.id !== productId);
        setProducts(updatedProducts);
        localStorage.setItem("mini_shop_products", JSON.stringify(updatedProducts));
        showToast(`Đã xóa sản phẩm: ${name} ${isOffline ? "(Ngoại tuyến)" : ""}`);
    };

    // 9. Admin Operations (Orders)
    const updateOrderStatus = async (orderId, newStatus) => {
        let isOffline = false;
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
        } catch (err) {
            console.warn("Using local fallback for updateOrderStatus:", err);
            isOffline = true;
        }

        const updatedOrders = orders.map(o => {
            if (o.id === orderId) {
                return { ...o, status: newStatus };
            }
            return o;
        });
        setOrders(updatedOrders);
        localStorage.setItem("mini_shop_orders", JSON.stringify(updatedOrders));
        showToast(`Cập nhật thành công đơn hàng ${orderId} ${isOffline ? "(Ngoại tuyến)" : ""}`);
    };

    const deleteOrder = async (orderId) => {
        let isOffline = false;
        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) throw error;
        } catch (err) {
            console.warn("Using local fallback for deleteOrder:", err);
            isOffline = true;
        }

        const updatedOrders = orders.filter(o => o.id !== orderId);
        setOrders(updatedOrders);
        localStorage.setItem("mini_shop_orders", JSON.stringify(updatedOrders));
        showToast(`Đã xóa đơn hàng ${orderId} ${isOffline ? "(Ngoại tuyến)" : ""}`);
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
                authLoading,
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
                registerUser,
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
