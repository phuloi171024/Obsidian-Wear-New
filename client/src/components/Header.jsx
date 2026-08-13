import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiUser, FiShoppingCart, FiLogOut, FiHeart, FiTrash2, FiX } from "react-icons/fi";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { authService } from "../services/authService";

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  
  // Quản lý từ khóa tìm kiếm
  const [searchKeyword, setSearchKeyword] = useState("");

  // ==========================================
  // STATE MỚI: QUẢN LÝ POPUP SẢN PHẨM YÊU THÍCH
  // ==========================================
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("access_token");
      setIsLoggedIn(!!token); 
    };

    checkLoginStatus();
    window.addEventListener("loginSuccess", checkLoginStatus);

    return () => {
      window.removeEventListener("loginSuccess", checkLoginStatus);
    };
  }, []);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsLoggedIn(false);
      setShowUserMenu(false);
      toast.success("Đăng xuất thành công!");
      navigate("/");
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      setIsLoggedIn(false);
      setShowUserMenu(false);
      toast.error("Đã đăng xuất khỏi thiết bị.");
      navigate("/");
    }
  };

  // Xử lý khi nhấn tìm kiếm
  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      if (searchKeyword.trim() !== "") {
        navigate(`/products?search=${encodeURIComponent(searchKeyword.trim())}`);
        setSearchKeyword(""); 
      }
    }
  };

  // ==========================================
  // HÀM MỚI: GỌI API LẤY DANH SÁCH YÊU THÍCH
  // ==========================================
  const fetchWishlist = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      setLoadingWishlist(true);
      const res = await fetch("http://localhost:8000/api/user/wishlist", {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.status) {
        setWishlistItems(data.data);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách yêu thích!");
    } finally {
      setLoadingWishlist(false);
    }
  };

  // Hàm mở Popup yêu thích
  const handleOpenWishlist = () => {
    setShowUserMenu(false); // Đóng menu user
    fetchWishlist();        // Gọi API lấy dữ liệu
    setShowWishlistModal(true); // Bật Popup
  };

  // Hàm xóa khỏi danh sách yêu thích
  const handleRemoveFavorite = async (productId) => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch("http://localhost:8000/api/user/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId })
      });
      const data = await res.json();
      if (res.ok && data.status) {
        // Cập nhật lại mảng hiện tại để mất sản phẩm trên giao diện
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
        toast.success(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa sản phẩm!");
    }
  };

  return (
    <>
      <header className="header">
        <Link to="/" className="logo">
          <img src="/src/public/images/logo.png" alt="Logo" />
        </Link>

        <nav className="navbar">
          <ul className="nav-menu">
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/products">Sản phẩm</Link></li>
            <li><Link to="/products/pants">Quần</Link></li>
            <li><Link to="/products/ao">Áo</Link></li>
            <li><Link to="/products/phu-kien">Túi</Link></li>
            <li><Link to="/products/giay">Giày</Link></li>
          </ul>
        </nav>

        <div className="header-right">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Bạn đang tìm kiếm gì?" 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={handleSearch}
            />
            <FiSearch 
              className="search-icon" 
              onClick={handleSearch} 
              style={{ cursor: "pointer" }} 
            />
          </div>

          {/* User Menu Dropdown */}
          <div className="user-menu-wrapper">
            <button
              className="icon-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <FiUser />
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                {isLoggedIn ? (
                  <>
                    <Link to="/profile" onClick={() => setShowUserMenu(false)}>Trang cá nhân</Link>
                    <Link to="/orders" onClick={() => setShowUserMenu(false)}>Lịch sử đơn hàng</Link>
                    
                    {/* NÚT SẢN PHẨM YÊU THÍCH */}
                    <button 
                      onClick={handleOpenWishlist}
                      style={{
                        background: "none", border: "none", color: "#e11d48",
                        padding: "8px 12px", textAlign: "left", cursor: "pointer",
                        width: "100%", fontWeight: "500", display: "flex", alignItems: "center", gap: "5px"
                      }}
                    >
                      <FiHeart /> Sản phẩm yêu thích
                    </button>

                    <button 
                      onClick={handleLogout} 
                      style={{
                        background: "none", border: "none", color: "#475569",
                        padding: "8px 12px", textAlign: "left", cursor: "pointer",
                        width: "100%", fontWeight: "500", display: "flex", alignItems: "center", gap: "5px"
                      }}
                    >
                      <FiLogOut /> Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setShowUserMenu(false)}>Đăng nhập</Link>
                    <Link to="/register" onClick={() => setShowUserMenu(false)}>Đăng ký</Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link to="/cart" className="icon-btn">
            <FiShoppingCart />
          </Link>
        </div>
      </header>

      {/* ==========================================
          POPUP MODAL: SẢN PHẨM YÊU THÍCH 
          ========================================== */}
      {showWishlistModal && (
        <div className="wishlist-modal-overlay" onClick={() => setShowWishlistModal(false)}>
          <div className="wishlist-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="wishlist-header">
              <h3><FiHeart /> Sản Phẩm Yêu Thích Của Tôi</h3>
              <button className="close-btn" onClick={() => setShowWishlistModal(false)}>
                <FiX />
              </button>
            </div>

            <div className="wishlist-content">
              {loadingWishlist ? (
                <p className="wishlist-msg">Đang tải dữ liệu...</p>
              ) : wishlistItems.length === 0 ? (
                <div className="wishlist-empty">
                  <FiHeart className="empty-icon" />
                  <p>Bạn chưa có sản phẩm yêu thích nào.</p>
                  <button className="shop-now-btn" onClick={() => {
                    setShowWishlistModal(false);
                    navigate("/products");
                  }}>
                    Khám phá ngay
                  </button>
                </div>
              ) : (
                <div className="wishlist-grid">
                  {wishlistItems.map((item) => (
                    <div className="wishlist-item" key={item.id}>
                      <img 
                        src={item.product?.thumbnail || item.product?.images?.[0]?.image_url || "https://placehold.co/100"} 
                        alt={item.product?.name} 
                        onClick={() => {
                          setShowWishlistModal(false);
                          navigate(`/product/${item.product?.id}`);
                        }}
                      />
                      <div className="wishlist-info">
                        <h4 onClick={() => {
                          setShowWishlistModal(false);
                          navigate(`/product/${item.product?.id}`);
                        }}>
                          {item.product?.name}
                        </h4>
                        <p className="price">{new Intl.NumberFormat('vi-VN').format(item.product?.price)} đ</p>
                      </div>
                      <button 
                        className="remove-wishlist-btn" 
                        title="Bỏ yêu thích"
                        onClick={() => handleRemoveFavorite(item.product_id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}