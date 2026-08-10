import { Suspense } from "react";
import "./globals.css";
import { ShopProvider } from "../context/ShopContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import Toast from "../components/Toast";

export const metadata = {
  title: "Tiệm Gốm & Decor - Thủ Công Mỹ Nghệ",
  description: "Trang trí nhà cửa bằng đồ gốm sứ mộc mạc, mây tre đan và đồ gỗ mộc tự nhiên Bát Tràng.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <ShopProvider>
          {/* Suspense boundary for Header since it uses search query params */}
          <Suspense fallback={
            <header className="site-header">
              <div className="container navbar">
                <div className="logo">Tiệm Gốm & Decor</div>
              </div>
            </header>
          }>
            <Header />
          </Suspense>
          
          <main>{children}</main>
          
          <Footer />
          <CartDrawer />
          <Toast />
        </ShopProvider>
      </body>
    </html>
  );
}
