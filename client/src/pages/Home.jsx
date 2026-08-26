import { useState, useEffect } from "react";

import Banner from "../components/Banner";
import ProductSection from "../components/ProductSection";
import Categories from "../components/Categories";
import Brands from "../components/Brands";
import Footer from "../components/Footer";

import SportsSection from "../components/SportsSection";
import DealSection from "../components/DealSection";
import FeaturedSection from "../components/FeaturedSection";
import { productService } from "../services/productService";

export default function Home() {
  const [newestProducts, setNewestProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [sportSections, setSportSections] = useState([]);
  const [deals, setDeals] = useState([]);
  const [featuredBrands, setFeaturedBrands] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const data = await productService.getHomeData();

        setNewestProducts(data.newest_products || []);
        setBestSellingProducts(data.best_selling_products || []);
        setFeaturedProducts(data.featured_products || []);
        setFeaturedCategories(data.featured_categories || []);
        setSportSections(data.sport_sections || []);
        setDeals(data.deals || []);
        setFeaturedBrands(data.featured_brands || []);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu trang chủ:", error);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <>
      <Banner />

      <Categories categories={featuredCategories} />

      <ProductSection
        title="SẢN PHẨM MỚI THÁNG 8"
        products={newestProducts}
        type="new"
      />

      <SportsSection
        sections={sportSections}
      />

      <DealSection
        deals={deals}
      />

      <FeaturedSection
        products={featuredProducts}
      />

      <Brands brands={featuredBrands} />

      <ProductSection
        title="SẢN PHẨM BÁN CHẠY"
        products={bestSellingProducts}
        type="best-selling"
      />

      <Footer />
    </>
  );
}
