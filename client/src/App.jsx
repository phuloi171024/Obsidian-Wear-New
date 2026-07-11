import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/products" element={<ProductPage />} />

        <Route path="/cart" element={<CartPage />} />  

        <Route path="/product/:id" element={<ProductDetail />} />

        <Route path="/login" element={<Login />} />

<Route path="/register" element={<Register />} />

<Route path="/forgot-password" element={<ForgotPassword />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
