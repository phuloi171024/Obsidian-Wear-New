import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios"; // Đảm bảo đã cài axios

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/products/${id}`);
        setProduct(response.data.data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div>Đang tải sản phẩm...</div>;
  if (!product) return <div>Không tìm thấy sản phẩm!</div>;

  return (
    <div className="product-detail">
      <h1>{product.name}</h1>
      <img src={product.thumbnail} alt={product.name} />
      <p>{product.price.toLocaleString("vi-VN")} đ</p>
      <button className="add-cart">Thêm vào giỏ hàng</button>
    </div>
  );
}