import { useState, useEffect } from "react";
import Header from "../components/Header";
import Banner from "../components/Banner";
import Policy from "../components/Policy";
import Categories from "../components/Categories";
import ProductSection from "../components/ProductSection";
import Brands from "../components/Brands";
import Promotion from "../components/Promotion";
import Footer from "../components/Footer";
import { productService } from "../services/productService"; //[cite: 35]

export default function Home() {
    const [newestProducts, setNewestProducts] = useState([]); //[cite: 35]
    const [bestSellingProducts, setBestSellingProducts] = useState([]); //[cite: 35]

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const data = await productService.getHomeData(); //[cite: 35]
                setNewestProducts(data.newest_products || []); //[cite: 35]
                setBestSellingProducts(data.best_selling_products || []); //[cite: 35]
            } catch (error) {
                console.error("Lỗi lấy dữ liệu trang chủ:", error); //[cite: 35]
            }
        };
        fetchHomeData(); //[cite: 35]
    }, []);

    return (
        <>
         
            <Banner />
            <Policy />
            <Categories />

            {/* Dùng slice(0, 3) để ép Component chỉ nhận và hiển thị đúng 3 sản phẩm đầu tiên */}
            <ProductSection title="Sản phẩm mới" products={newestProducts.slice(0, 3)} />

            {/* Tương tự cho phần Bán chạy */}
            <ProductSection title="Sản phẩm bán chạy" products={bestSellingProducts.slice(0, 3)} />

            <Brands />
            <Promotion />
            <Footer />
        </>
    );
}