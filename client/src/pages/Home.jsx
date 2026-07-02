import React from 'react';
// Import đầy đủ các component bản đẹp từ thư mục components
import Header from "../components/Header";
import Banner from "../components/Banner";
import Policy from "../components/Policy"; // Giữ lại phần Chính sách từ file gốc để tăng độ uy tín
import Categories from "../components/Categories";
import ProductSection from "../components/ProductSection";
import Brands from "../components/Brands";
import Promotion from "../components/Promotion";
import Footer from "../components/Footer";

export default function Home() {
    // Đoạn CSS thừa hưởng từ Home1 giúp gom nội dung chính vào giữa màn hình (max-width 1200px)
    const mainContainerStyle = {
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px",
        boxSizing: "border-box"
    };

    return (
        /* Thẻ div ngoài cùng tràn 100% màn hình giúp Header và Footer tràn viền dọc hai bên */
        <div style={{ width: "100%", display: "flex", flexDirection: "column", minHeight: "100vh", overflowX: "hidden" }}>
            
            {/* 1. Header: Nằm ngoài main nên tự động tràn toàn bộ viền màn hình */}
            <Header />

            {/* Vùng nội dung chính: Được gom gọn gàng vào khung Grid chuẩn 12 cột ở giữa */}
            <main style={mainContainerStyle}>
                
                {/* Banner lớn đầu trang */}
                <Banner />
                
                {/* Thêm lại Policy (Cam kết 100% chính hãng, Miễn phí ship...) từ bản gốc sang */}
                <Policy /> 
                
                {/* Danh mục sản phẩm hot */}
                <Categories />
                
                {/* Khu vực hiển thị danh sách sản phẩm thể thao */}
                <ProductSection title="Sản phẩm mới nhất" />
                
                {/* Khối logo các thương hiệu nổi tiếng (Nike, Adidas, Puma...) */}
                <Brands />
                
                {/* Ô đăng ký nhận email khuyến mãi */}
                <Promotion />
                
            </main>

            {/* 2. Footer: Nằm ngoài main nên tự động tràn toàn bộ viền màn hình */}
            <Footer />
            
        </div>
    );
}