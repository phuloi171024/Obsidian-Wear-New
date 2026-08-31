import { API_BASE_URL } from "../config/api";
import Footer from "../components/Footer";
import "./OrdersPage.css";
import "./ProfilePage.css";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
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
    province_code: "",
    province: "", 
    district: "", 
    ward_code: "",
    ward: "", 
    street: "", 
    is_default: false 
  });
  const [isSubmittingAddr, setIsSubmittingAddr] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  // =====================================
  // STATE: ĐỔI MẬT KHẨU
  // =====================================
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current_password: "", new_password: "", new_password_confirmation: "" });
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);

  const sortAddresses = (items = []) =>
    [...items].sort(
      (a, b) => Number(Boolean(b.is_default)) - Number(Boolean(a.is_default))
    );

  const notifyAuthChanged = () => {
    window.dispatchEvent(new Event("loginSuccess"));
  };

  const fetchAddresses = async (token) => {
    const response = await fetch(`${API_BASE_URL}/user/addresses`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token.trim()}`,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Không thể tải danh sách địa chỉ!");
    }

    const nextAddresses = sortAddresses(data.data || []);
    setAddresses(nextAddresses);

    return nextAddresses;
  };

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

        const profileRes = await fetch(`${API_BASE_URL}/user/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token.trim()}`
          }
        });

        const addrRes = await fetch(`${API_BASE_URL}/user/addresses`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token.trim()}`
          }
        });

        const provinceRes = await fetch(
          `${API_BASE_URL}/locations/provinces`,
          { headers: { Accept: "application/json" } }
        );

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
          setAddresses(sortAddresses(addrData.data || []));
        }

        if (provinceRes.ok) {
          const provinceData = await provinceRes.json();
          setProvinces(provinceData.data || []);
        } else {
          toast.error("Không thể tải danh sách tỉnh/thành phố!");
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

  const handleLogout = async () => {
    const token = localStorage.getItem("access_token");

    try {
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.trim()}`,
          },
        });
      }
    } catch (error) {
      console.error("Không thể thu hồi token đăng nhập:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      localStorage.removeItem("user_info");
      notifyAuthChanged();
      toast.success("Đăng xuất thành công!");
      navigate("/login", { replace: true });
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("Phiên đăng nhập đã hết hạn!");
      notifyAuthChanged();
      navigate("/login", { replace: true });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
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
        const updatedUser = data.data || data;

        setUser({
          name: updatedUser.name || "",
          email: updatedUser.email || user.email,
          phone: updatedUser.phone || "",
        });

        localStorage.setItem("user_info", JSON.stringify(updatedUser));
        notifyAuthChanged();
      } else {
  const validationMessage = data.errors
    ? Object.values(data.errors).flat()[0]
    : null;

  toast.error(
    validationMessage ||
      data.message ||
      "Cập nhật thông tin thất bại!"
  );
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      toast.error("Không thể kết nối đến máy chủ!");
    }
  };

  const loadWards = async (provinceCode) => {
    if (!provinceCode) {
      setWards([]);
      return;
    }

    try {
      setIsLoadingWards(true);
      const response = await fetch(
        `${API_BASE_URL}/locations/provinces/${provinceCode}/wards`,
        { headers: { Accept: "application/json" } }
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Không thể tải danh sách phường/xã!");
      }

      setWards(data.data || []);
    } catch (error) {
      console.error("Lỗi tải phường/xã:", error);
      setWards([]);
      toast.error(error.message || "Không thể tải danh sách phường/xã!");
    } finally {
      setIsLoadingWards(false);
    }
  };

  const handleProvinceChange = async (event) => {
    const provinceCode = event.target.value;
    const selectedProvince = provinces.find(
      (item) => String(item.code) === String(provinceCode)
    );

    setAddrForm((previous) => ({
      ...previous,
      province_code: provinceCode,
      province: selectedProvince?.name || "",
      district: "",
      ward_code: "",
      ward: "",
    }));

    await loadWards(provinceCode);
  };

  const handleWardChange = (event) => {
    const wardCode = event.target.value;
    const selectedWard = wards.find(
      (item) => String(item.code) === String(wardCode)
    );

    setAddrForm((previous) => ({
      ...previous,
      ward_code: wardCode,
      ward: selectedWard?.name || "",
    }));
  };

  // Mở modal và giữ đúng cả mã lẫn tên tỉnh/phường.
  const openAddressModal = async (addr = null) => {
    if (addr) {
      setAddrForm({ 
        id: addr.id, 
        type: addr.type || "Nhà", 
        receiver_name: addr.receiver_name || "",
        phone: addr.phone || "",
        province_code: String(addr.province_code || ""),
        province: addr.province || "",
        district: addr.district || "",
        ward_code: String(addr.ward_code || ""),
        ward: addr.ward || "",
        street: addr.street || addr.address || "", // Fallback nếu chưa xóa cột address
        is_default: addr.is_default === 1 || addr.is_default === true
      });

      if (addr.province_code) {
        await loadWards(String(addr.province_code));
      } else {
        setWards([]);
      }
    } else {
      setAddrForm({
        id: null,
        type: "Nhà",
        receiver_name: "",
        phone: "",
        province_code: "",
        province: "",
        district: "",
        ward_code: "",
        ward: "",
        street: "",
        is_default: false,
      });
      setWards([]);
    }
    setShowAddrModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (
      !addrForm.receiver_name.trim() ||
      !addrForm.phone.trim() ||
      !addrForm.province_code ||
      !addrForm.province ||
      !addrForm.ward_code ||
      !addrForm.ward ||
      !addrForm.street.trim()
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin địa chỉ!");
      return;
    }

    const token = localStorage.getItem("access_token");
    const method = addrForm.id ? "PUT" : "POST";
    const url = addrForm.id 
      ? `${API_BASE_URL}/user/addresses/${addrForm.id}`
      : `${API_BASE_URL}/user/addresses`;

    // CẬP NHẬT PAYLOAD
    const payload = {
      type: addrForm.type,
      receiver_name: addrForm.receiver_name.trim(),
      phone: addrForm.phone.trim(),
      province_code: String(addrForm.province_code),
      province: addrForm.province,
      district: addrForm.district || null,
      ward_code: String(addrForm.ward_code),
      ward: addrForm.ward,
      street: addrForm.street.trim(),
      is_default: Boolean(addrForm.is_default)
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
      
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.status || data.success)) {
        toast.success(addrForm.id ? "Cập nhật địa chỉ thành công!" : "Thêm địa chỉ thành công!");

        await fetchAddresses(token);
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
      const res = await fetch(`${API_BASE_URL}/user/addresses/${id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token.trim()}` }
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Đã xóa địa chỉ!");

        /*
         * Backend có thể tự chọn một địa chỉ mặc định mới sau khi xóa.
         * Gọi lại API để dấu "Mặc định" được cập nhật ngay, không cần F5.
         */
        await fetchAddresses(token);
      } else {
        toast.error(data.message || "Không thể xóa địa chỉ!");
      }
    } catch (error) {
      toast.error("Không thể xóa địa chỉ!");
    }
  };

 const handleChangePassword = async (e) => {
  e.preventDefault();

  if (pwdForm.new_password.length < 8) {
    toast.error("Mật khẩu mới phải có ít nhất 8 ký tự!");
    return;
  }

  if (pwdForm.new_password !== pwdForm.new_password_confirmation) {
    toast.error("Xác nhận mật khẩu mới không khớp!");
    return;
  }

  const token = localStorage.getItem("access_token");

  if (!token) {
    toast.error("Phiên đăng nhập đã hết hạn!");
    navigate("/login");
    return;
  }

  try {
    setIsSubmittingPwd(true);

    const response = await fetch(
      `${API_BASE_URL}/user/password`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: pwdForm.current_password,
          new_password: pwdForm.new_password,
          new_password_confirmation:
            pwdForm.new_password_confirmation,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const validationMessage = data.errors
        ? Object.values(data.errors).flat()[0]
        : null;

      toast.error(
        validationMessage ||
          data.message ||
          "Không thể đổi mật khẩu!"
      );
      return;
    }

    setShowPwdModal(false);
    setPwdForm({
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    });

    // Backend đã xóa toàn bộ Sanctum token.
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user_info");
    notifyAuthChanged();

    toast.success(
      data.message ||
        "Đổi mật khẩu thành công. Vui lòng đăng nhập lại!"
    );

    navigate("/login", { replace: true });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    toast.error("Không thể kết nối đến máy chủ!");
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

      <div className="ash-account-page">
        <div className="ash-account-shell">
          <aside className="ash-account-side-nav">
            <Link to="/orders">Orders</Link>
            <Link to="/profile" className="active">Profile</Link>
          </aside>

          <main className="ash-profile-main">
            <section className="ash-profile-section ash-profile-contact-section">
              <div className="ash-profile-section-head">
                <h2>Liên hệ</h2>
                <button type="button" className="ash-outline-btn" onClick={handleUpdate}>
                  Cập nhật
                </button>
              </div>

              <div className="ash-profile-card ash-contact-card">
                <div className="ash-profile-row">
                  <span className="ash-profile-label">Họ và tên</span>
                  <input name="name" value={user.name} onChange={handleChange} aria-label="Họ và tên" />
                </div>
                <div className="ash-profile-row">
                  <span className="ash-profile-label">Email</span>
                  <input name="email" value={user.email} disabled aria-label="Email" />
                </div>
                <div className="ash-profile-row">
                  <span className="ash-profile-label">Điện thoại</span>
                  <input name="phone" value={user.phone} onChange={handleChange} placeholder="Chưa cập nhật" aria-label="Số điện thoại" />
                </div>
              </div>
            </section>

            <section className="ash-profile-section ash-address-section">
              <div className="ash-profile-section-head">
                <h2>Địa chỉ</h2>
                {addresses.length < 5 && (
                  <button type="button" className="ash-outline-btn" onClick={() => openAddressModal()}>
                    Thêm
                  </button>
                )}
              </div>

              <div className="ash-address-list">
                {addresses.length === 0 ? (
                  <div className="ash-profile-card ash-address-empty">
                    <span className="ash-address-icon"><FiMapPin /></span>
                    <span>Chưa thêm địa chỉ nào</span>
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr.id} className="ash-profile-card ash-address-card">
                      <span className="ash-address-icon"><FiMapPin /></span>
                      <div className="ash-address-copy">
                        <div className="ash-address-name-line">
                          <strong>{addr.receiver_name || user.name}</strong>
                          {addr.phone && <span>{addr.phone}</span>}
                          {(addr.is_default === 1 || addr.is_default === true) && <em>Mặc định</em>}
                        </div>
                        <p>{addr.street}</p>
                        <p>{[addr.ward, addr.district, addr.province].filter(Boolean).join(", ")}</p>
                      </div>
                      <div className="ash-address-actions">
                        <button type="button" onClick={() => openAddressModal(addr)}>Sửa</button>
                        <button type="button" className="delete" onClick={() => handleDeleteAddress(addr.id)} aria-label="Xóa địa chỉ">
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="ash-profile-section">
              <h2>Tùy chọn tiếp thị</h2>
              <div className="ash-profile-card ash-marketing-card">
                <div className="ash-marketing-left">
                  <span className="ash-mail-icon">✉</span>
                  <span>Email</span>
                </div>
                <span className="ash-static-switch" aria-hidden="true"><span>✓</span></span>
              </div>
            </section>

            <section className="ash-profile-actions">
              <button type="button" className="ash-outline-btn ash-logout-btn" onClick={handleLogout}>Đăng xuất</button>
              <button type="button" className="ash-link-btn ash-password-link" onClick={() => setShowPwdModal(true)}>Đổi mật khẩu</button>
            </section>
          </main>
        </div>
      </div>

      <Footer />

      {/* ==========================================
          MODAL: THÊM / SỬA ĐỊA CHỈ ĐÃ ĐƯỢC CHIA NHỎ
      ========================================== */}
      {showAddrModal && (
        <div style={{ position: "fixed", inset: 0, padding: "16px", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "550px", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button onClick={() => setShowAddrModal(false)} style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}><FiX /></button>
            <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px" }}>{addrForm.id ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</h3>
            
            <form onSubmit={handleSaveAddress} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "15px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "500" }}>Họ tên người nhận *</label>
                  <input type="text" required value={addrForm.receiver_name} onChange={(e) => setAddrForm({...addrForm, receiver_name: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }} />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "500" }}>Số điện thoại *</label>
                  <input type="text" required value={addrForm.phone} onChange={(e) => setAddrForm({...addrForm, phone: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "15px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "500" }}>Tỉnh/Thành phố *</label>
                  <select required value={addrForm.province_code} onChange={handleProvinceChange} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none", background: "#fff" }}>
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>{province.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "500" }}>Phường/Xã *</label>
                  <select required value={addrForm.ward_code} onChange={handleWardChange} disabled={!addrForm.province_code || isLoadingWards} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none", background: !addrForm.province_code || isLoadingWards ? "#f3f4f6" : "#fff" }}>
                    <option value="">{isLoadingWards ? "Đang tải phường/xã..." : "Chọn phường/xã"}</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>{ward.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "15px" }}>
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
        <div style={{ position: "fixed", inset: 0, padding: "16px", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "400px", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <button onClick={() => setShowPwdModal(false)} style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}><FiX /></button>
            <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px" }}>Đổi mật khẩu</h3>
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500" }}>Mật khẩu hiện tại *</label>
                <input
                  type="password"
                  name="current_password"
                  autoComplete="current-password"
                  required
                  value={pwdForm.current_password}
                  onChange={(e) => setPwdForm({...pwdForm, current_password: e.target.value})}
                  style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500" }}>Mật khẩu mới *</label>
                <input
                  type="password"
                  name="new_password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={pwdForm.new_password}
                  onChange={(e) => setPwdForm({...pwdForm, new_password: e.target.value})}
                  style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500" }}>Xác nhận mật khẩu mới *</label>
                <input
                  type="password"
                  name="new_password_confirmation"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={pwdForm.new_password_confirmation}
                  onChange={(e) => setPwdForm({...pwdForm, new_password_confirmation: e.target.value})}
                  style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }}
                />
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
