import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/products" element={<ProductPage />} />

        <Route path="/cart" element={<CartPage />} />  
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
