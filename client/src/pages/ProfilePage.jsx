import Header from "../components/Header";
import Footer from "../components/Footer";
import "./OrdersPage.css";
import "./ProfilePage.css";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiClipboard,
  FiLock,
  FiLogOut,
  FiEdit,
  FiPlus,
  FiTrash2,
  FiX,
  FiMapPin
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  // =====================================
  // STATE: SỔ ĐỊA CHỈ (CẬP NHẬT TRƯỜNG MỚI)
  // =====================================
  const [addresses, setAddresses] = useState([]);
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [addrForm, setAddrForm] = useState({ 
    id: null, 
    type: "Nhà", 
    receiver_name: "", 
    phone: "", 
    province: "", 
    district: "", 
    ward: "", 
    street: "", 
    is_default: false 
  });
  const [isSubmittingAddr, setIsSubmittingAddr] = useState(false);

  // =====================================
  // STATE: ĐỔI MẬT KHẨU
  // =====================================
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current_password: "", new_password: "", new_password_confirmation: "" });
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("Vui lòng đăng nhập để xem thông tin cá nhân!");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);

        const profileRes = await fetch("http://localhost:8000/api/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token.trim()}`
          }
        });

        const addrRes = await fetch("http://localhost:8000/api/user/addresses", {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token.trim()}`
          }
        });

        if (profileRes.ok) {
          const data = await profileRes.json();
          const userData = data.data || data;
          setUser({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || ""
          });
        } else if (profileRes.status === 401) {
          localStorage.removeItem("access_token");
          toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
          navigate("/login");
          return;
        }

        if (addrRes.ok) {
          const addrData = await addrRes.json();
          // Đảm bảo đưa địa chỉ mặc định lên đầu danh sách
          const sortedAddrs = (addrData.data || []).sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
          setAddresses(sortedAddrs);
        }

      } catch (error) {
        console.error("Lỗi kết nối:", error);
        toast.error("Không thể kết nối đến máy chủ!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    toast.success("Đăng xuất thành công!");
    navigate("/login");
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch("http://localhost:8000/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token.trim()}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: user.name,
          phone: user.phone
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Cập nhật thông tin thành công!");
        if (data.data || data) {
          localStorage.setItem("user_info", JSON.stringify(data.data || data));
        }
      } else {
        toast.error(data.message || "Cập nhật thất bại!");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      toast.error("Không thể kết nối đến máy chủ!");
    }
  };

  // HÀM MỞ MODAL ĐỊA CHỈ ĐÃ ĐƯỢC MAP ĐÚNG DỮ LIỆU MỚI
  const openAddressModal = (addr = null) => {
    if (addr) {
      setAddrForm({ 
        id: addr.id, 
        type: addr.type || "Nhà", 
        receiver_name: addr.receiver_name || "",
        phone: addr.phone || "",
        province: addr.province || "",
        district: addr.district || "",
        ward: addr.ward || "",
        street: addr.street || addr.address || "", // Fallback nếu chưa xóa cột address
        is_default: addr.is_default === 1 || addr.is_default === true
      });
    } else {
      setAddrForm({ id: null, type: "Nhà", receiver_name: "", phone: "", province: "", district: "", ward: "", street: "", is_default: false });
    }
    setShowAddrModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addrForm.receiver_name || !addrForm.phone || !addrForm.province || !addrForm.district || !addrForm.ward || !addrForm.street) {
      toast.error("Vui lòng nhập đầy đủ các trường thông tin!");
      return;
    }

    const token = localStorage.getItem("access_token");
    const method = addrForm.id ? "PUT" : "POST";
    const url = addrForm.id 
      ? `http://localhost:8000/api/user/addresses/${addrForm.id}`
      : `http://localhost:8000/api/user/addresses`;

    // CẬP NHẬT PAYLOAD
    const payload = {
      type: addrForm.type,
      receiver_name: addrForm.receiver_name,
      phone: addrForm.phone,
      province: addrForm.province,
      district: addrForm.district,
      ward: addrForm.ward,
      street: addrForm.street,
      is_default: addrForm.is_default
    };

    try {
      setIsSubmittingAddr(true);
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token.trim()}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (res.ok && (data.status || data.success)) {
        toast.success(addrForm.id ? "Cập nhật địa chỉ thành công!" : "Thêm địa chỉ thành công!");
        
        // Refresh
        const addrRes = await fetch("http://localhost:8000/api/user/addresses", {
          headers: { "Accept": "application/json", "Authorization": `Bearer ${token.trim()}` }
        });
        const addrData = await addrRes.json();
        const sortedAddrs = (addrData.data || []).sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
        setAddresses(sortedAddrs);
        setShowAddrModal(false);
      } else {
        if (data.errors) {
           const errorMessages = Object.values(data.errors).flat().join("\n");
           toast.error(`Lỗi dữ liệu: ${errorMessages}`);
        } else {
           toast.error(data.message || "Không thể lưu địa chỉ!");
        }
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    } finally {
      setIsSubmittingAddr(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8000/api/user/addresses/${id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token.trim()}` }
      });
      if (res.ok) {
        toast.success("Đã xóa địa chỉ!");
        setAddresses(prev => prev.filter(a => a.id !== id));
      }
    } catch (error) {
      toast.error("Không thể xóa địa chỉ!");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.new_password_confirmation) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (pwdForm.new_password.length < 8) {
      toast.error("Mật khẩu mới phải từ 8 ký tự trở lên!");
      return;
    }

    const token = localStorage.getItem("access_token");
    try {
      setIsSubmittingPwd(true);
      const res = await fetch("http://localhost:8000/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token.trim()}`
        },
        body: JSON.stringify(pwdForm)
      });
      const data = await res.json();
      
      if (res.ok && (data.status || data.success)) {
        toast.success("Đổi mật khẩu thành công!");
        setShowPwdModal(false);
        setPwdForm({ current_password: "", new_password: "", new_password_confirmation: "" });
      } else {
        toast.error(data.message || "Mật khẩu cũ không chính xác!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    } finally {
      setIsSubmittingPwd(false);
    }
  };

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "100px" }}>Đang tải thông tin...</div>;
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="orders-page">
        <div className="account-layout">
          
          <div className="account-sidebar">
            <h2>Tài khoản của tôi</h2>
            <div className="user-info">
              <div className="avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h4>{user.name || "Khách hàng"}</h4>
                <span>{user.email}</span>
              </div>
            </div>

            <ul className="account-menu">
              <li className="active"><Link to="/profile"><FiUser />Thông tin cá nhân</Link></li>
              <li><Link to="/orders"><FiClipboard />Đơn hàng của tôi</Link></li>
              <li onClick={() => setShowPwdModal(true)} style={{ cursor: "pointer" }}><FiLock />Đổi mật khẩu</li>
              <li className="logout" onClick={handleLogout} style={{ cursor: "pointer" }}><FiLogOut />Đăng xuất</li>
            </ul>
          </div>

          <div className="profile-content">
            <div className="profile-header">
              <h2><FiEdit /> Thông tin cá nhân</h2>
              <span>* Thông tin bắt buộc</span>
            </div>

            <div className="profile-form">
              <div className="form-group">
                <label>Họ và tên *</label>
                <input name="name" value={user.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input name="email" value={user.email} disabled style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed" }} />
              </div>
              <div className="form-group">
                <label>Số điện thoại chính *</label>
                <input name="phone" value={user.phone} onChange={handleChange} placeholder="Số điện thoại cá nhân" />
              </div>
            </div>

            <div className="profile-btn" style={{ marginBottom: "30px" }}>
              <button onClick={handleUpdate}>Cập nhật thông tin</button>
            </div>

            <hr style={{ border: "0", borderTop: "1px solid #e5e7eb", margin: "30px 0" }} />

            <div className="profile-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h4><FiMapPin style={{ marginRight: '8px' }} />Sổ địa chỉ </h4>
              {addresses.length < 5 && (
                <button 
                  onClick={() => openAddressModal()}
                  style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <FiPlus /> Thêm địa chỉ mới
                </button>
              )}
            </div>

            <div className="address-list" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {addresses.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", background: "#f9fafb", borderRadius: "8px", color: "#6b7280" }}>
                  Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ để thuận tiện đặt hàng nhé!
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} style={{ border: "1px solid #e5e7eb", padding: "15px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: addr.is_default ? "#fef2f2" : "#fff" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <span style={{ fontWeight: "700", color: "#111827", fontSize: "16px" }}>{addr.receiver_name || user.name}</span>
                        <span style={{ color: "#6b7280", fontSize: "14px" }}>| {addr.phone}</span>
                        
                        {/* HIỂN THỊ BADGE MẶC ĐỊNH */}
                        {(addr.is_default === 1 || addr.is_default === true) && (
                          <span style={{ border: "1px solid #ef4444", color: "#ef4444", padding: "2px 8px", fontSize: "11px", borderRadius: "4px", fontWeight: "600", marginLeft: "10px" }}>
                            Mặc định
                          </span>
                        )}
                      </div>
                      
                      <p style={{ margin: "0 0 4px 0", color: "#4b5563", fontSize: "14px" }}>{addr.street}</p>
                      <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>{addr.ward}, {addr.district}, {addr.province}</p>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
                      <div style={{ display: "flex", gap: "15px" }}>
                        <button onClick={() => openAddressModal(addr)} style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontSize: "14px", fontWeight: "500", padding: 0 }}>Sửa</button>
                        <button onClick={() => handleDeleteAddress(addr.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "18px", padding: 0 }} title="Xóa"><FiTrash2 /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>

      <Footer />

      {/* ==========================================
          MODAL: THÊM / SỬA ĐỊA CHỈ ĐÃ ĐƯỢC CHIA NHỎ
      ========================================== */}
      {showAddrModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "550px", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button onClick={() => setShowAddrModal(false)} style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}><FiX /></button>
            <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px" }}>{addrForm.id ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</h3>
            
            <form onSubmit={handleSaveAddress} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              
              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "500" }}>Họ tên người nhận *</label>
                  <input type="text" required value={addrForm.receiver_name} onChange={(e) => setAddrForm({...addrForm, receiver_name: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }} />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "500" }}>Số điện thoại *</label>
                  <input type="text" required value={addrForm.phone} onChange={(e) => setAddrForm({...addrForm, phone: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "500" }}>Tỉnh/Thành phố *</label>
                  <input type="text" required placeholder="VD: TP. Hồ Chí Minh" value={addrForm.province} onChange={(e) => setAddrForm({...addrForm, province: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }} />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "500" }}>Quận/Huyện *</label>
                  <input type="text" required placeholder="VD: Quận 1" value={addrForm.district} onChange={(e) => setAddrForm({...addrForm, district: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "500" }}>Phường/Xã *</label>
                  <input type="text" required placeholder="VD: Phường Bến Nghé" value={addrForm.ward} onChange={(e) => setAddrForm({...addrForm, ward: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }} />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "500" }}>Loại địa chỉ</label>
                  <select value={addrForm.type} onChange={(e) => setAddrForm({...addrForm, type: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }}>
                    <option value="Nhà">Nhà riêng</option>
                    <option value="Công ty">Công ty</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500" }}>Địa chỉ chi tiết (Số nhà, Tên đường) *</label>
                <textarea required rows={2} placeholder="VD: 123 Đường Lê Lợi..." value={addrForm.street} onChange={(e) => setAddrForm({...addrForm, street: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none", resize: "vertical" }} />
              </div>

              {/* CHECKBOX MẶC ĐỊNH CHUẨN USECASE */}
              <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "5px", cursor: "pointer", fontSize: "14px", color: "#374151" }}>
                <input 
                  type="checkbox" 
                  checked={addrForm.is_default} 
                  onChange={(e) => setAddrForm({...addrForm, is_default: e.target.checked})}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                Đặt làm địa chỉ mặc định
              </label>

              <button disabled={isSubmittingAddr} type="submit" style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "10px", opacity: isSubmittingAddr ? 0.7 : 1 }}>
                {isSubmittingAddr ? "Đang lưu..." : "Lưu địa chỉ"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ĐỔI MẬT KHẨU GIỮ NGUYÊN */}
      {showPwdModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "400px", position: "relative" }}>
            <button onClick={() => setShowPwdModal(false)} style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}><FiX /></button>
            <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px" }}>Đổi mật khẩu</h3>
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500" }}>Mật khẩu hiện tại *</label>
                <input type="password" required value={pwdForm.current_password} onChange={(e) => setPwdForm({...pwdForm, current_password: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500" }}>Mật khẩu mới *</label>
                <input type="password" required minLength={8} value={pwdForm.new_password} onChange={(e) => setPwdForm({...pwdForm, new_password: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500" }}>Xác nhận mật khẩu mới *</label>
                <input type="password" required minLength={8} value={pwdForm.new_password_confirmation} onChange={(e) => setPwdForm({...pwdForm, new_password_confirmation: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }} />
              </div>
              <button disabled={isSubmittingPwd} type="submit" style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "10px", opacity: isSubmittingPwd ? 0.7 : 1 }}>
                {isSubmittingPwd ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}