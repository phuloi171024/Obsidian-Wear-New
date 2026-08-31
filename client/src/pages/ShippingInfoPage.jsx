import { Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Footer from "../components/Footer";
import { useFriendCheckoutLogic } from "../services/useFriendCheckoutLogic";
import "./CheckoutPage.css";

export default function ShippingInfoPage() {
  const {
    form, errors, savedAddresses, selectedAddressId, handleSelectAddress,
    cartItems, loading, showVoucherModal, setShowVoucherModal,
    isLoadingCoupons, openVoucherModal,
    voucherTab, setVoucherTab, inputVoucher, setInputVoucher, dbCoupons,
    appliedProductVoucher, setAppliedProductVoucher,
    appliedShippingVoucher, setAppliedShippingVoucher,
    isApplying, surname, setSurname, wardDistrict, setWardDistrict,

    note, setNote,
    shippingMethod, setShippingMethod, checkoutPayment, setCheckoutPayment,

    handleApplyCoupon, handleChange, handleSubmit,
    subtotal, baseShippingFee, productDiscount, shippingDiscount,
    finalShippingFee, total, provinces, wards,
    handleProvinceChange, handleWardChange, retryMode, notice,
    submitting, isQuoteLoading,
 } = useFriendCheckoutLogic();

const totalQuantity = cartItems.reduce(
  (sum, item) => sum + Number(item.quantity || 0),
  0
);

const visibleCoupons = dbCoupons.filter((coupon) => {
  if (voucherTab === "shipping") {
    return coupon.discount_type === "shipping";
  }

  return coupon.discount_type !== "shipping";
});

  return (
    <div className="ash-checkout-page">
      <Toaster position="top-right" />



      <main className="ash-checkout-main">
        <div className="ash-checkout-shell">
          {/* ================= Cá»˜T TRÃI ================= */}
          <section className="ash-checkout-left">
            <div className="ash-checkout-content">
              {notice && (
                <div className="ash-checkout-api-notice">{notice}</div>
              )}
              {/* ThÃ´ng tin giao hÃ ng */}
              <section className="ash-checkout-section">
                <h2>
                  ThÃ´ng Tin Giao HÃ ng{" "}
                  <span>(Äá»‹a chá»‰ SAU SÃT NHáº¬P)</span>
                </h2>

                {!retryMode && (
                  <div className="ash-checkout-field">
                    <select
                      value={selectedAddressId}
                      onChange={handleSelectAddress}
                    >
                      <option value="">+ Nháº­p Ä‘á»‹a chá»‰ má»›i</option>
                      {savedAddresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.receiver_name} â€” {address.street}, {address.ward}, {address.province}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="ash-checkout-two-cols">
                  <div className="ash-checkout-field">
                    <input
                      type="text"
                      value={surname}
                      onChange={(event) => setSurname(event.target.value)}
                      placeholder="Há»"
                    />
                  </div>

                  <div className="ash-checkout-field">
                    <input
                      type="text"
                      value={form.name}
                      onChange={handleChange("name")}
                      placeholder="TÃªn ngÆ°á»i nháº­n"
                      className={errors.name ? "is-error" : ""}
                    />
                    {errors.name && (
                      <p className="ash-checkout-error">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="ash-checkout-field">
                  <div className="ash-checkout-input-wrap">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={handleChange("phone")}
                      placeholder="Sá»‘ Ä‘iá»‡n thoáº¡i"
                      className={errors.phone ? "is-error" : ""}
                    />
                    <span className="ash-checkout-input-icon">?</span>
                  </div>
                  {errors.phone && (
                    <p className="ash-checkout-error">{errors.phone}</p>
                  )}
                </div>

                <div className="ash-checkout-field">
                  <select
                    value={form.province_code}
                    onChange={handleProvinceChange}
                    disabled={Boolean(selectedAddressId)}
                    className={errors.city ? "is-error" : ""}
                  >
                    <option value="">Tá»ˆNH / THÃ€NH PHá»</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="ash-checkout-error">{errors.city}</p>
                  )}
                </div>

                <div className="ash-checkout-field">
                  <select
                    value={form.ward_code}
                    onChange={handleWardChange}
                    disabled={Boolean(selectedAddressId) || !form.province_code}
                    className={errors.ward ? "is-error" : ""}
                  >
                    <option value="">PHÆ¯á»œNG / XÃƒ</option>
                    {selectedAddressId && form.ward_code && (
                      <option value={form.ward_code}>{wardDistrict}</option>
                    )}
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                  {errors.ward && (
                    <p className="ash-checkout-error">{errors.ward}</p>
                  )}
                </div>

                <div className="ash-checkout-field">
                  <input
                    type="text"
                    value={form.address}
                    onChange={handleChange("address")}
                    placeholder="Sá»‘ nhÃ  + tÃªn Ä‘Æ°á»ng"
                    className={errors.address ? "is-error" : ""}
                  />
                  {errors.address && (
                    <p className="ash-checkout-error">{errors.address}</p>
                  )}
                </div>
              </section>

              {/* PhÆ°Æ¡ng thá»©c váº­n chuyá»ƒn */}
              <section className="ash-checkout-section">
                <h3>PhÆ°Æ¡ng thá»©c váº­n chuyá»ƒn</h3>

                <div className="ash-checkout-option-box">
                  <label
                    className={`ash-checkout-option ${
                      shippingMethod === "economy"
                        ? "active"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === "economy"}
                      onChange={() =>
                        setShippingMethod("economy")
                      }
                    />
                    <span className="ash-radio-ui" />
                    <span className="ash-option-copy">
                      <strong>
                        Freeship - TikiNOW giao hÃ ng tá»« 3 - 8 ngÃ y
                        lÃ m viá»‡c cho Ä‘Æ¡n tá»« 3,399,000Ä
                      </strong>
                    </span>
                    <b>
                      {subtotal >= 3399000
                        ? "MIá»„N PHÃ"
                        : `${new Intl.NumberFormat("vi-VN").format(
                            30000
                          )} Ä‘`}
                    </b>
                  </label>

                  <label
                    className={`ash-checkout-option ${
                      shippingMethod === "standard"
                        ? "active"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === "standard"}
                      onChange={() =>
                        setShippingMethod("standard")
                      }
                    />
                    <span className="ash-radio-ui" />
                    <span className="ash-option-copy">
                      <strong>
                        TikiNOW - Giao HÃ ng TiÃªu Chuáº©n 2-7 ngÃ y lÃ m
                        viá»‡c tÃ¹y tá»‰nh thÃ nh
                      </strong>
                    </span>
                    <b>50.000 Ä‘</b>
                  </label>

                  <label
                    className={`ash-checkout-option ${
                      shippingMethod === "express"
                        ? "active"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === "express"}
                      onChange={() =>
                        setShippingMethod("express")
                      }
                    />
                    <span className="ash-radio-ui" />
                    <span className="ash-option-copy">
                      <strong>
                        Giao HÃ ng Grab Há»a Tá»‘c (Chá»‰ Ã¡p dá»¥ng ná»™i thÃ nh
                        HCM) trÆ°á»›c 16h ngÃ y trong tuáº§n
                      </strong>
                      <small>
                        LiÃªn há»‡ CSKH Ä‘á»ƒ Ä‘Æ°á»£c há»— trá»£ cá»¥ thá»ƒ vá» phÃ­ ship
                        vÃ  cÃ¡ch thá»©c thanh toÃ¡n
                      </small>
                    </span>
                    <b>200.000 Ä‘</b>
                  </label>
                </div>
              </section>

              {/* Thanh toÃ¡n */}
              <section className="ash-checkout-section">
                <h3>Thanh toÃ¡n</h3>
                <p className="ash-checkout-muted">
                  ToÃ n bá»™ cÃ¡c giao dá»‹ch Ä‘Æ°á»£c báº£o máº­t vÃ  mÃ£ hÃ³a.
                </p>

                <div className="ash-checkout-option-box ash-payment-box">
                  <label
                    className={`ash-checkout-option ${
                      checkoutPayment === "vnpay" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={checkoutPayment === "vnpay"}
                      onChange={() =>
                        setCheckoutPayment("vnpay")
                      }
                    />
                    <span className="ash-radio-ui" />
                    <span className="ash-option-copy">
                      <strong>
                        VNPay - Tháº» ATM/QR/NgÃ¢n hÃ ng
                      </strong>
                    </span>
                    <span className="ash-payment-logos" aria-label="PhÆ°Æ¡ng thá»©c thanh toÃ¡n há»— trá»£">
                      <span className="payment-logo payment-logo-visa">VISA</span>
                      <span className="payment-logo payment-logo-mastercard" aria-label="Mastercard">
                        <span className="mc-circle mc-red" />
                        <span className="mc-circle mc-orange" />
                      </span>
                      <span className="payment-logo payment-logo-jcb" aria-label="JCB">
                        <span>J</span><span>C</span><span>B</span>
                      </span>
                      <span className="payment-logo payment-logo-more">+2</span>
                    </span>
                  </label>

                  {checkoutPayment === "vnpay" && (
                    <div className="ash-payment-description">
                      Báº¡n sáº½ Ä‘Æ°á»£c chuyá»ƒn Ä‘áº¿n cá»•ng thanh toÃ¡n VNPay Ä‘á»ƒ hoÃ n táº¥t giao dá»‹ch.
                    </div>
                  )}

                  <label
                    className={`ash-checkout-option ${
                      checkoutPayment === "cod" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={checkoutPayment === "cod"}
                      onChange={() => setCheckoutPayment("cod")}
                    />
                    <span className="ash-radio-ui" />
                    <span className="ash-option-copy">
                      <strong>
                        Thanh toÃ¡n khi nháº­n hÃ ng (COD)
                      </strong>
                    </span>
                  </label>

                </div>
              </section>

              <section className="ash-checkout-section">
                <h3>Ghi chÃº Ä‘Æ¡n hÃ ng</h3>
                <textarea
                  className="ash-checkout-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={500}
                  placeholder="VÃ­ dá»¥: Gá»i trÆ°á»›c khi giao hÃ ng"
                />
              </section>

              <button
                type="button"
                className="ash-checkout-pay-now"
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  isQuoteLoading ||
                  (!retryMode && !total)
                }
              >
                {submitting
                  ? "ÄANG Xá»¬ LÃ..."
                  : checkoutPayment === "cod"
                    ? "Äáº¶T HÃ€NG COD"
                    : "THANH TOÃN QUA VNPAY"}
              </button>

              <footer className="ash-checkout-mini-footer">
                <Link to="/">ChÃ­nh sÃ¡ch hoÃ n tiá»n</Link>
                <Link to="/">Váº­n chuyá»ƒn</Link>
                <Link to="/">ChÃ­nh sÃ¡ch quyá»n riÃªng tÆ°</Link>
                <Link to="/">Äiá»u khoáº£n dá»‹ch vá»¥</Link>
                <Link to="/contact">LiÃªn há»‡</Link>
              </footer>
            </div>
          </section>

          {/* ================= Cá»˜T PHáº¢I ================= */}
          <aside className="ash-checkout-right">
            <div className="ash-order-summary">
              <div className="ash-order-products">
                {loading ? (
                  <div
                    className="ash-order-skeleton-list"
                    aria-label="Äang táº£i Ä‘Æ¡n hÃ ng"
                  >
                    {[0, 1, 2].map((item) => (
                      <div
                        className="ash-order-item ash-order-item-skeleton"
                        key={item}
                      >
                        <span className="ash-order-skeleton-thumb" />
                        <span className="ash-order-skeleton-copy" />
                        <span className="ash-order-skeleton-price" />
                      </div>
                    ))}
                  </div>
                ) : cartItems.length > 0 ? (
                  cartItems.map((item, index) => {
                    const product =
                      item.product_variant?.product || {};
                    const lineTotal =
                      Number(
                        item.price ||
                          product.current_price ||
                          product.sale_price ||
                          product.price ||
                          0
                      ) *
                      Number(item.quantity || 0);

                    return (
                      <div
                        key={item.id || index}
                        className="ash-order-item"
                      >
                        <div className="ash-order-thumb">
                          <img
                            src={
                              item.product_variant?.image_url ||
                              item.product_variant?.image ||
                              product.thumbnail ||
                              product.image_url ||
                              product.images?.[0]?.image_url ||
                              product.images?.[0]?.image_path ||
                              "/images/placeholder.png"
                            }
                            alt={product.name || "Sáº£n pháº©m"}
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src =
                                "/images/placeholder.png";
                            }}
                          />
                          <span>{item.quantity}</span>
                        </div>

                        <div className="ash-order-item-info">
                          <strong>{product.name}</strong>
                          <small>
                            {item.product_variant?.color || ""}
                            {item.product_variant?.color &&
                            item.product_variant?.size
                              ? " / "
                              : ""}
                            {item.product_variant?.size || ""}
                          </small>

                          {appliedProductVoucher && (
                            <em>
                              â—‡ {appliedProductVoucher.code} - Ä‘Ã£ Ã¡p
                              dá»¥ng Æ°u Ä‘Ã£i
                            </em>
                          )}
                        </div>

                        <div className="ash-order-line-price">
                          {new Intl.NumberFormat("vi-VN").format(
                            lineTotal
                          )}{" "}
                          Ä‘
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="ash-order-loading">
                    Giá» hÃ ng trá»‘ng
                  </div>
                )}
              </div>

              {!retryMode && (
                <>
                  <div className="ash-order-coupon">
                    <input
                      type="text"
                      placeholder="MÃ£ giáº£m giÃ¡ hoáº·c tháº» quÃ  táº·ng"
                      value={inputVoucher}
                      onChange={(e) => setInputVoucher(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      disabled={isApplying}
                    >
                      {isApplying ? "Äang xá»­ lÃ½" : "Ãp dá»¥ng"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={openVoucherModal}
                    disabled={isLoadingCoupons}
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      margin: "-14px 0 26px",
                      border: "1px solid #222",
                      borderRadius: "7px",
                      background: "#fff",
                      color: "#222",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: isLoadingCoupons
                        ? "wait"
                        : "pointer",
                      opacity: isLoadingCoupons ? 0.65 : 1,
                    }}
                  >
                    {isLoadingCoupons
                      ? "ÄANG Táº¢I Æ¯U ÄÃƒI..."
                      : "CHá»ŒN MÃƒ GIáº¢M GIÃ"}
                  </button>
                </>
              )}

              <div className="ash-order-totals">
                <div>
                  <span>
                    Tá»•ng phá»¥
                    {totalQuantity > 1
                      ? ` Â· ${totalQuantity} máº·t hÃ ng`
                      : ""}
                  </span>
                  <b>
                    {new Intl.NumberFormat("vi-VN").format(
                      subtotal
                    )}{" "}
                    Ä‘
                  </b>
                </div>

                <div>
                  <span>Váº­n chuyá»ƒn â“˜</span>
                  <b>
                    {finalShippingFee === 0
                      ? "MIá»„N PHÃ"
                      : `${new Intl.NumberFormat("vi-VN").format(
                          finalShippingFee
                        )} Ä‘`}
                  </b>
                </div>

                {productDiscount > 0 && (
                  <div className="ash-order-discount">
                    <span>Giáº£m giÃ¡ sáº£n pháº©m</span>
                    <b>
                      -
                      {new Intl.NumberFormat("vi-VN").format(
                        productDiscount
                      )}{" "}
                      Ä‘
                    </b>
                  </div>
                )}

                {shippingDiscount > 0 && (
                  <div className="ash-order-discount">
                    <span>Giáº£m phÃ­ váº­n chuyá»ƒn</span>
                    <b>
                      -
                      {new Intl.NumberFormat("vi-VN").format(
                        shippingDiscount
                      )}{" "}
                      Ä‘
                    </b>
                  </div>
                )}
              </div>

              <div className="ash-order-grand-total">
                <div>
                  <strong>Tá»•ng</strong>
                  <small>
                    Bao gá»“m thuáº¿ theo chÃ­nh sÃ¡ch hiá»‡n hÃ nh
                  </small>
                </div>

                <div>
                  <span>VND</span>
                  <b>
                    {isQuoteLoading
                      ? "Äang tÃ­nh..."
                      : `${new Intl.NumberFormat("vi-VN").format(
                          total
                        )} Ä‘`}
                  </b>
                </div>
              </div>

              {(productDiscount > 0 || shippingDiscount > 0) && (
                <div className="ash-order-saved">
                  â—‡ Tá»”NG Sá» TIá»€N TIáº¾T KIá»†M ÄÆ¯á»¢C{" "}
                  {new Intl.NumberFormat("vi-VN").format(
                    productDiscount + shippingDiscount
                  )}{" "}
                  Ä‘
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* POPUP MÃƒ GIáº¢M GIÃ - giá»¯ nguyÃªn logic hiá»‡n táº¡i */}
      {showVoucherModal && (
        <div className="voucher-modal-overlay">
          <div className="voucher-modal-box">
            <div className="voucher-modal-header">
              <h3>MÃƒ GIáº¢M GIÃ & Æ¯U ÄÃƒI</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowVoucherModal(false)}
              >
                âœ•
              </button>
            </div>

            <div className="voucher-input-group">
              <input
                type="text"
                placeholder="Nháº­p mÃ£ giáº£m giÃ¡ cá»§a báº¡n"
                value={inputVoucher}
                onChange={(e) => setInputVoucher(e.target.value)}
              />
              <button
                type="button"
                onClick={() => handleApplyCoupon()}
                disabled={isApplying}
              >
                {isApplying ? "Äang ktra..." : "ÃP Dá»¤NG"}
              </button>
            </div>

            <div className="voucher-tabs">
              <button
                type="button"
                className={
                  voucherTab === "product" ? "active" : ""
                }
                onClick={() => setVoucherTab("product")}
              >
                Æ¯u ÄÃ£i Cho Báº¡n
              </button>
              <button
                type="button"
                className={
                  voucherTab === "shipping" ? "active" : ""
                }
                onClick={() => setVoucherTab("shipping")}
              >
                Æ¯u ÄÃ£i Váº­n Chuyá»ƒn
              </button>
            </div>

            <div className="voucher-list-container">
              {visibleCoupons
                .map((coupon) => {
                  const isSelected =
                    voucherTab === "product"
                      ? appliedProductVoucher?.id === coupon.id
                      : appliedShippingVoucher?.id === coupon.id;

                  return (
                    <div
                      key={coupon.id}
                      className={`voucher-card ${
                        isSelected ? "selected" : ""
                      }`}
                    >
                      <div className="voucher-icon">%</div>
                      <div className="voucher-info">
                        <h4>
                          MÃ£: {coupon.code} - Giáº£m{" "}
                          {Number(
                            coupon.discount_value
                          ).toLocaleString("vi-VN")}{" "}
                          {coupon.discount_type === "percent"
                            ? "%"
                            : "Ä‘"}
                        </h4>
                        <p>
                          ÄÆ¡n tá»‘i thiá»ƒu:{" "}
                          {Number(
                            coupon.min_order_value
                          ).toLocaleString("vi-VN")}{" "}
                          Ä‘
                        </p>
                        <p>
                          Háº¡n sá»­ dá»¥ng: Äáº¿n{" "}
                          {coupon.expires_at || "KhÃ´ng thá»i háº¡n"}
                        </p>
                      </div>
                      <div className="voucher-action">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isApplying}
                          onChange={() => {
                            if (isSelected) {
                              if (voucherTab === "product") {
                                setAppliedProductVoucher(null);
                              } else {
                                setAppliedShippingVoucher(null);
                              }

                              return;
                            }

                            handleApplyCoupon(coupon.code);
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

              {isLoadingCoupons && (
                <p className="voucher-empty">
                  Äang táº£i danh sÃ¡ch Æ°u Ä‘Ã£i...
                </p>
              )}

              {!isLoadingCoupons && visibleCoupons.length === 0 && (
                <p className="voucher-empty">
                  KhÃ´ng cÃ³ mÃ£ giáº£m giÃ¡ phÃ¹ há»£p.
                </p>
              )}
            </div>

            <div className="voucher-modal-footer">
              <button
                type="button"
                className="confirm-voucher-btn"
                onClick={() => setShowVoucherModal(false)}
              >
                XÃC NHáº¬N
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
