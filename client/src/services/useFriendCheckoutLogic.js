import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { checkoutService } from "./checkoutService";

const emptyForm = {
  name: "", phone: "", address: "", city: "",
  province_code: "", ward_code: "",
};

export function useFriendCheckoutLogic() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const retryOrderId = searchParams.get("order_id");
  const paymentState = searchParams.get("payment");
  const retryMode = Boolean(retryOrderId);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [voucherTab, setVoucherTab] = useState("product");
  const [inputVoucher, setInputVoucher] = useState("");
  const [dbCoupons, setDbCoupons] = useState([]);
  const [appliedProductVoucher, setAppliedProductVoucher] = useState(null);
  const [appliedShippingVoucher, setAppliedShippingVoucher] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [surname, setSurname] = useState("");
  const [wardDistrict, setWardDistrict] = useState("");
  const [note, setNote] = useState("");
  const [shippingMethod, setShippingMethod] = useState("economy");
  const [checkoutPayment, setCheckoutPayment] = useState("cod");
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [quote, setQuote] = useState(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const wardRequestRef = useRef(0);
  const quoteRequestRef = useRef(0);
  const couponRequestRef = useRef(0);
  const couponApplyLockRef = useRef(false);
  const submitLockRef = useRef(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);

        if (retryMode) {
          const response = await checkoutService.getOrder(retryOrderId);
          if (!active) return;
          const currentOrder = response.order;
          setOrder(currentOrder);
          setCartItems(currentOrder.items || []);
          setShippingMethod(currentOrder.shipping_method || "economy");
          setCheckoutPayment(
            currentOrder.payment_method === "vnpay" ? "vnpay" : "cod",
          );
          setForm({
            name: currentOrder.shipping_receiver_name || "",
            phone: currentOrder.shipping_phone || "",
            address: currentOrder.shipping_street || "",
            city: currentOrder.shipping_province || "",
            province_code: currentOrder.shipping_province_code || "",
            ward_code: currentOrder.shipping_ward_code || "",
          });
          setWardDistrict(currentOrder.shipping_ward || "");
          setAppliedProductVoucher(
            currentOrder.order_coupons?.find(
              (item) => item.coupon_kind === "product" && item.status !== "released",
            ) || null,
          );
          setAppliedShippingVoucher(
            currentOrder.order_coupons?.find(
              (item) => item.coupon_kind === "shipping" && item.status !== "released",
            ) || null,
          );
          setQuote({
            subtotal: currentOrder.subtotal,
            shipping_fee: currentOrder.shipping_fee,
            discount_amount: currentOrder.discount_amount,
            shipping_discount: currentOrder.shipping_discount,
            total: currentOrder.total_amount,
          });
          setIsQuoteLoading(false);

          if (currentOrder.payment_status === "paid") {
            navigate(
              `/checkout/success?order_id=${currentOrder.id}&payment=vnpay`,
              { replace: true },
            );
          }
          return;
        }

        const [cart, addresses, provinceData] = await Promise.all([
          checkoutService.cart(),
          checkoutService.addresses(),
          checkoutService.provinces(),
        ]);
        if (!active) return;

        let couponData = { data: [] };

        try {
          couponData = await checkoutService.coupons();
        } catch (error) {
          // Voucher lỗi không được làm hỏng toàn bộ trang thanh toán.
          console.error("Không thể tải voucher:", error);
        }

        if (!active) return;

        setCartItems(cart.data || []);
        const sortedAddresses = [...(addresses.data || [])].sort(
          (a, b) => Number(b.is_default) - Number(a.is_default),
        );
        setSavedAddresses(sortedAddresses);
        setProvinces(provinceData.data || []);
        setDbCoupons(couponData.data || []);

        if (sortedAddresses[0]) {
          selectAddress(sortedAddresses[0], sortedAddresses);
        }

        try {
          const stored = JSON.parse(
            localStorage.getItem("applied_vouchers") || "{}",
          );
          setAppliedProductVoucher(stored.product || null);
          setAppliedShippingVoucher(stored.shipping || null);
        } catch {
          localStorage.removeItem("applied_vouchers");
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [navigate, retryMode, retryOrderId]);

  useEffect(() => {
    const requestId = ++wardRequestRef.current;

    if (selectedAddressId || !form.province_code || retryMode) {
      setWards([]);
      return undefined;
    }

    setWards([]);

    checkoutService.wards(form.province_code)
      .then((response) => {
        if (requestId === wardRequestRef.current) {
          setWards(response.data || []);
        }
      })
      .catch((error) => {
        if (requestId === wardRequestRef.current) {
          setWards([]);
          toast.error(error.message);
        }
      });

    return () => {
      if (requestId === wardRequestRef.current) {
        wardRequestRef.current += 1;
      }
    };
  }, [form.province_code, retryMode, selectedAddressId]);

  useEffect(() => {
    if (retryMode || loading || cartItems.length === 0) {
      setIsQuoteLoading(false);
      return undefined;
    }

    const requestId = ++quoteRequestRef.current;

    // Không hiển thị báo giá cũ trong lúc chờ báo giá mới.
    setQuote(null);
    setIsQuoteLoading(true);

    const timer = window.setTimeout(() => {
      checkoutService.quote({
        address_id: selectedAddressId || null,
        province: selectedAddressId ? null : form.city,
        shipping_method: shippingMethod,
        product_coupon_id: appliedProductVoucher?.id || null,
        shipping_coupon_id: appliedShippingVoucher?.id || null,
      }).then((response) => {
        if (requestId === quoteRequestRef.current) {
          setQuote(response.data);
          setIsQuoteLoading(false);
        }
      })
        .catch((error) => {
          if (requestId === quoteRequestRef.current) {
            setQuote(null);
            setIsQuoteLoading(false);
            toast.error(error.message);
          }
        });
    }, 200);

    return () => {
      window.clearTimeout(timer);

      if (requestId === quoteRequestRef.current) {
        quoteRequestRef.current += 1;
      }
    };
  }, [
    retryMode, loading, cartItems.length, selectedAddressId, form.city,
    shippingMethod, appliedProductVoucher?.id, appliedShippingVoucher?.id,
  ]);

  useEffect(() => {
    if (paymentState !== "verifying" || !retryOrderId) return;
    let checks = 0;
    const timer = window.setInterval(async () => {
      checks += 1;
      try {
        const response = await checkoutService.getOrder(retryOrderId);
        if (response.order.payment_status === "paid") {
          window.clearInterval(timer);
          navigate(
            `/checkout/success?order_id=${retryOrderId}&payment=vnpay`,
            { replace: true },
          );
        }
      } catch {
        // Giữ trang hiện tại để người dùng có thể thử lại.
      }
      if (checks >= 12) window.clearInterval(timer);
    }, 1500);
    return () => window.clearInterval(timer);
  }, [navigate, paymentState, retryOrderId]);

  const selectAddress = (address, list = savedAddresses) => {
    const selected = typeof address === "object"
      ? address
      : list.find((item) => String(item.id) === String(address));
    if (!selected) return;

    const hasLocationCodes = Boolean(
      selected.province_code && selected.ward_code
    );

    setSelectedAddressId(
      hasLocationCodes ? String(selected.id) : ""
    );
    setSurname("");
    setForm({
      name: selected.receiver_name || "",
      phone: selected.phone || "",
      address: selected.street || "",
      city: selected.province || "",
      province_code: selected.province_code || "",
      ward_code: selected.ward_code || "",
    });
    setWardDistrict(selected.ward || "");
    setErrors({});

    if (!hasLocationCodes) {
      toast.error(
        "Địa chỉ cũ thiếu mã tỉnh/phường. Vui lòng chọn lại tỉnh và phường trước khi đặt hàng."
      );
    }
  };

  const handleSelectAddress = (event) => {
    const id = event.target.value;
    if (!id) {
      setSelectedAddressId("");
      setForm(emptyForm);
      setWardDistrict("");
      return;
    }
    selectAddress(id);
  };

  const handleProvinceChange = (event) => {
    const code = event.target.value;
    const province = provinces.find(
      (item) => String(item.code) === String(code),
    );
    setSelectedAddressId("");
    setWardDistrict("");
    setForm((previous) => ({
      ...previous,
      province_code: code,
      city: province?.name || "",
      ward_code: "",
    }));
  };

  const handleWardChange = (event) => {
    const code = event.target.value;
    const ward = wards.find((item) => String(item.code) === String(code));
    setSelectedAddressId("");
    setWardDistrict(ward?.name || "");
    setForm((previous) => ({ ...previous, ward_code: code }));
  };

  const fetchCoupons = async () => {
    const requestId = ++couponRequestRef.current;

    try {
      setIsLoadingCoupons(true);
      setDbCoupons([]);

      const response = await checkoutService.coupons();

      if (requestId === couponRequestRef.current) {
        setDbCoupons(response.data || []);
      }
    } catch (error) {
      if (requestId === couponRequestRef.current) {
        setDbCoupons([]);
        toast.error(error.message);
      }
    } finally {
      if (requestId === couponRequestRef.current) {
        setIsLoadingCoupons(false);
      }
    }
  };

  const openVoucherModal = async () => {
    setShowVoucherModal(true);
    await fetchCoupons();
  };

  const handleApplyCoupon = async (couponCode = null) => {
    if (isApplying || couponApplyLockRef.current) return;

    const normalizedCode = (
      typeof couponCode === "string" ? couponCode : inputVoucher
    ).trim().toUpperCase();

    if (!normalizedCode) {
      toast.error("Vui lòng nhập mã giảm giá!");
      return;
    }

    try {
      couponApplyLockRef.current = true;
      setIsApplying(true);
      const response = await checkoutService.applyCoupon({
        code: normalizedCode,
        shipping_method: shippingMethod,
        province: form.city,
        product_coupon_id: appliedProductVoucher?.id || null,
        shipping_coupon_id: appliedShippingVoucher?.id || null,
      });
      const coupon = response.data;
      if (coupon.type === "shipping") setAppliedShippingVoucher(coupon);
      else setAppliedProductVoucher(coupon);
      setInputVoucher("");
      setShowVoucherModal(false);
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      couponApplyLockRef.current = false;
      setIsApplying(false);
    }
  };

  const handleChange = (field) => (event) => {
    setSelectedAddressId("");
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập tên người nhận";
    if (!/^[0-9]{9,11}$/.test(form.phone.trim())) nextErrors.phone = "Số điện thoại phải có 9–11 số";
    if (!form.address.trim()) nextErrors.address = "Vui lòng nhập số nhà và tên đường";
    if (!form.province_code) nextErrors.city = "Vui lòng chọn tỉnh/thành phố";
    if (!form.ward_code || !wardDistrict) nextErrors.ward = "Vui lòng chọn phường/xã";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const startVnpay = async (orderId) => {
    const response = await checkoutService.createVnpay(orderId);
    window.location.assign(response.url || response.data);
  };

  const handleSubmit = async () => {
    if (submitting || submitLockRef.current) return;

    submitLockRef.current = true;

    try {
      setSubmitting(true);
      const paymentMethod = checkoutPayment === "cod" ? "cod" : "vnpay";

      if (retryMode) {
        await checkoutService.updatePaymentMethod(retryOrderId, paymentMethod);
        if (paymentMethod === "vnpay") await startVnpay(retryOrderId);
        else navigate(`/order-success?order_id=${retryOrderId}`);
        return;
      }

      if (!validate()) {
        toast.error("Vui lòng nhập đầy đủ thông tin giao hàng!");
        return;
      }

      let addressId = selectedAddressId;
      if (!addressId) {
        const created = await checkoutService.createAddress({
          receiver_name: `${surname} ${form.name}`.trim(),
          phone: form.phone,
          type: "Nhà",
          province_code: String(form.province_code),
          province: form.city,
          district: "",
          ward_code: String(form.ward_code),
          ward: wardDistrict,
          street: form.address,
          is_default: savedAddresses.length === 0,
        });
        addressId = created.data.id;
      }

      const createdOrder = await checkoutService.createOrder({
        address_id: Number(addressId),
        shipping_method: shippingMethod,
        product_coupon_id: appliedProductVoucher?.id || null,
        shipping_coupon_id: appliedShippingVoucher?.id || null,
        payment_method: paymentMethod,
        note: note.trim() || null,
      });

      localStorage.removeItem("applied_vouchers");
      if (paymentMethod === "vnpay") await startVnpay(createdOrder.order_id);
      else navigate(`/order-success?order_id=${createdOrder.order_id}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  const subtotal = Number(quote?.subtotal || 0);
  const baseShippingFee = Number(quote?.shipping_fee || 0);
  const productDiscount = Number(quote?.discount_amount || 0);
  const shippingDiscount = Number(quote?.shipping_discount || 0);
  const finalShippingFee = Math.max(0, baseShippingFee - shippingDiscount);
  const total = Number(quote?.total || 0);

  const notice = useMemo(() => {
    if (paymentState === "retry") {
      return "Thanh toán chưa hoàn tất. Đơn hàng và voucher vẫn được giữ để em thanh toán lại.";
    }
    if (paymentState === "verifying") {
      return "Đang chờ IPN từ VNPay xác nhận. Đơn chưa được đánh dấu đã thanh toán.";
    }
    return "";
  }, [paymentState]);

  return {
    form, errors, savedAddresses, selectedAddressId, handleSelectAddress,
    cartItems, loading, showVoucherModal, setShowVoucherModal,
    isLoadingCoupons, openVoucherModal,
    voucherTab, setVoucherTab, inputVoucher, setInputVoucher, dbCoupons,
    appliedProductVoucher, setAppliedProductVoucher,
    appliedShippingVoucher, setAppliedShippingVoucher,
    isApplying, surname, setSurname, wardDistrict, setWardDistrict,
    note, setNote,
    shippingMethod, setShippingMethod, checkoutPayment, setCheckoutPayment,
    fetchCoupons, handleApplyCoupon, handleChange, handleSubmit,
    subtotal, baseShippingFee, productDiscount, shippingDiscount,
    finalShippingFee, total, provinces, wards,
    isQuoteLoading,
    handleProvinceChange, handleWardChange, retryMode, notice,
    submitting, order,
  };
}
