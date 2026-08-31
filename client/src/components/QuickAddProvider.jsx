import { createContext, useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";
import VariantQuickAddModal from "./VariantQuickAddModal";

const QuickAddContext = createContext(null);

export function QuickAddProvider({ children }) {
  const [product, setProduct] = useState(null);
  const [initialColor, setInitialColor] = useState("");

  const closeQuickAdd = () => {
    setProduct(null);
    setInitialColor("");
  };

  const openQuickAdd = (nextProduct, preferredColor = "") => {
    if (
      !Array.isArray(nextProduct?.variants) ||
      nextProduct.variants.length === 0
    ) {
      toast.error("Sản phẩm này chưa có biến thể để thêm vào giỏ hàng!");
      return;
    }

    setInitialColor(preferredColor);
    setProduct(nextProduct);
  };

  const value = useMemo(
    () => ({ openQuickAdd, closeQuickAdd }),
    []
  );

  return (
    <QuickAddContext.Provider value={value}>
      {children}

      <VariantQuickAddModal
        open={Boolean(product)}
        product={product}
        initialColor={initialColor}
        onClose={closeQuickAdd}
      />
    </QuickAddContext.Provider>
  );
}

export function useQuickAdd() {
  const context = useContext(QuickAddContext);

  if (!context) {
    throw new Error("useQuickAdd phải được dùng bên trong QuickAddProvider");
  }

  return context;
}
