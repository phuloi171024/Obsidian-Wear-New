import Header from "../components/Header";
import Banner from "../components/Banner";
import Policy from "../components/Policy";
import Categories from "../components/Categories";
import ProductSection from "../components/ProductSection";
import Brands from "../components/Brands";
import Promotion from "../components/Promotion";
import Footer from "../components/Footer";

export default function Home() {
    return (
        <>
            <Header />

            <Banner />

            <Policy />

            <Categories />

            <ProductSection title="Sản phẩm mới" />

            <Brands />

            <Promotion />

            <Footer />
        </>
    );
}
