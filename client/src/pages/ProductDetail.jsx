import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import Footer from "../components/Footer";
import "./ProductDetail.css";
import ProductCard from "../components/ProductCard";

import { productService } from "../services/productService";
import { API_BASE_URL } from "../config/api";

import toast, {
  Toaster,
} from "react-hot-toast";


/* =========================================================
   SIZE GUIDE DATA
========================================================= */

const SIZE_GUIDES = {

  /* =======================================================
     ÁO NAM / UNISEX
  ======================================================= */

  shirt: {
    title: "SIZE ÁO NAM/UNISEX",

    sizes: [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
    ],

    columns: [
      "Size",
      "Vòng ngực (cm)",
      "Vai (cm)",
      "Cân nặng (kg)",
      "Chiều cao (cm)",
    ],

    rows: [
      [
        "XS",
        "84",
        "42.4",
        "50 - 55",
        "160 - 165",
      ],

      [
        "S",
        "88",
        "43.6",
        "55 - 60",
        "165 - 170",
      ],

      [
        "M",
        "92",
        "44.8",
        "60 - 65",
        "170 - 175",
      ],

      [
        "L",
        "96",
        "46",
        "65 - 70",
        "175 - 180",
      ],

      [
        "XL",
        "100",
        "47.2",
        "70 - 75",
        "180 - 185",
      ],

      [
        "2XL",
        "104",
        "48.4",
        "75 - 80",
        "185 - 190",
      ],

      [
        "3XL",
        "108",
        "49.6",
        "80 - 90",
        "190 - 195",
      ],
    ],
  },


  /* =======================================================
     QUẦN NAM
  ======================================================= */

  pantsMen: {
    title: "SIZE QUẦN NAM",

    sizes: [
      "XXS",
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL",
    ],

    columns: [
      "Size",
      "Vòng eo (cm)",
      "Vòng hông (cm)",
      "Chiều dài ống quần (cm)",
      "Chiều cao (cm)",
    ],

    rows: [
      [
        "XXS",
        "57 - 65",
        "72 - 80",
        "81.5",
        "< 170",
      ],

      [
        "XS",
        "65 - 73",
        "80 - 88",
        "82",
        "170 - 183",
      ],

      [
        "S",
        "73 - 81",
        "88 - 96",
        "82.5",
        "170 - 183",
      ],

      [
        "M",
        "81 - 89",
        "96 - 104",
        "83",
        "170 - 183",
      ],

      [
        "L",
        "89 - 97",
        "104 - 112",
        "83.5",
        "170 - 183",
      ],

      [
        "XL",
        "97 - 109",
        "112 - 120",
        "84",
        "170 - 183",
      ],

      [
        "2XL",
        "109 - 121",
        "120 - 128",
        "84.5",
        "170 - 183",
      ],

      [
        "3XL",
        "121 - 133",
        "128 - 136",
        "85",
        "170 - 183",
      ],

      [
        "4XL",
        "133 - 145",
        "136 - 148",
        "85.5",
        "170 - 183",
      ],
    ],
  },


  /* =======================================================
     QUẦN NỮ
  ======================================================= */

  pantsWomen: {
    title: "SIZE QUẦN NỮ",

    sizes: [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
    ],

    columns: [
      "Size",
      "US",
      "Vòng ngực (cm)",
      "Vòng eo (cm)",
      "Vòng mông (cm)",
      "Chiều cao (cm)",
    ],

    rows: [
      [
        "XS",
        "0 - 2",
        "80 - 85",
        "61 - 66",
        "87.5 - 92.5",
        "142 - 149",
      ],

      [
        "S",
        "4 - 6",
        "85 - 90",
        "66 - 71",
        "92.5 - 98",
        "149 - 155",
      ],

      [
        "M",
        "8 - 10",
        "90 - 95.5",
        "71 - 76",
        "98 - 103",
        "155 - 163",
      ],

      [
        "L",
        "12 - 14",
        "95.5 - 103",
        "76 - 84",
        "103 - 110.5",
        "163 - 169.5",
      ],

      [
        "XL",
        "16 - 18",
        "103 - 110.5",
        "84 - 91.5",
        "110.5 - 118",
        "169.5 - 176",
      ],

      [
        "2XL",
        "20 - 22",
        "110.5 - 118",
        "91.5 - 99",
        "118 - 125.5",
        "176 - 182",
      ],
    ],
  },


  /* =======================================================
     GIÀY NAM
  ======================================================= */

  shoes: {
    title: "SIZE GIÀY NAM",

    sizes: [
      "7",
      "7.5",
      "8",
      "8.5",
      "9",
      "9.5",
      "10",
      "10.5",
      "11",
      "11.5",
      "12",
      "12.5",
      "13",
      "14",
    ],

    columns: [
      "US",
      "EU",
      "JP/CM",
      "UK",
    ],

    rows: [
      ["7", "40", "25", "6.5"],
      ["7.5", "40.5", "25.5", "7"],
      ["8", "41", "26", "7.5"],
      ["8.5", "42", "26.5", "8"],
      ["9", "42.5", "27", "8.5"],
      ["9.5", "43", "27.5", "9"],
      ["10", "44", "28", "9.5"],
      ["10.5", "44.5", "28.5", "10"],
      ["11", "45", "29", "10.5"],
      ["11.5", "46", "29.5", "11"],
      ["12", "47", "30", "11.5"],
      ["12.5", "47.5", "30.5", "12"],
      ["13", "48", "31", "12.5"],
      ["14", "49", "31.5", "13.5"],
    ],
  },
};


const getCategoryText = (product) =>
  `${product?.category?.name || ""} ${product?.category?.slug || ""}`
    .toLowerCase()
    .trim();

const isBagCategory = (product) => {
  const categoryId = Number(
    product?.category_id || product?.category?.id || 0
  );
  const categoryText = getCategoryText(product);

  return (
    categoryId === 4 ||
    /túi|tui|bag|balo|phụ kiện|phu-kien|accessor/.test(categoryText)
  );
};

/* =========================================================
   XÁC ĐỊNH BẢNG SIZE THEO SẢN PHẨM
   Ưu tiên tên/slug danh mục; category_id chỉ là fallback.
========================================================= */

const getSizeGuideKey = (product) => {
  if (!product) {
    return null;
  }

  const categoryId = Number(
    product.category_id ||
      product.category?.id ||
      0
  );

  const productText = `
    ${product.name || ""}
    ${product.slug || ""}
    ${product.description || ""}
  `.toLowerCase();
  const categoryText = getCategoryText(product);

  /* GIÀY */
  if (categoryId === 3 || /giày|giay|shoe|sneaker/.test(categoryText)) {
    return "shoes";
  }

  /* QUẦN */
  if (categoryId === 2 || /quần|quan|pants|short|legging/.test(categoryText)) {
    const isWomenProduct =
      /nữ|nu-|legging|women|woman/.test(
        productText
      );

    return isWomenProduct
      ? "pantsWomen"
      : "pantsMen";
  }

  /* ÁO */
  if (categoryId === 1 || /áo|ao|shirt|hoodie|jacket/.test(categoryText)) {
    return "shirt";
  }

  /* Túi / phụ kiện / danh mục khác không dùng bảng áo giả */
  return null;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();


  /* =========================================================
     STATE
  ========================================================= */

  const [product, setProduct] =
    useState(null);

  const [
    relatedProducts,
    setRelatedProducts,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);


  const [quantity, setQuantity] =
    useState(1);

  const [size, setSize] =
    useState("");

  const [color, setColor] =
    useState("");

  const [
    displayImage,
    setDisplayImage,
  ] = useState("");

  const [
    availableColors,
    setAvailableColors,
  ] = useState([]);


  const [activeTab, setActiveTab] =
    useState("size-guide");


  const [reviews, setReviews] =
    useState([]);

  const [newReview, setNewReview] =
    useState({
      rating: 5,
      comment: "",
    });

  const [
    submittingReview,
    setSubmittingReview,
  ] = useState(false);


  const [submitting, setSubmitting] =
    useState(false);


  const [
    isFavorite,
    setIsFavorite,
  ] = useState(false);

  const [
    favoriteLoading,
    setFavoriteLoading,
  ] = useState(false);



  /* =========================================================
     LOAD PRODUCT
  ========================================================= */

  useEffect(() => {
    const fetchProductDetail =
      async () => {
        try {
          setLoading(true);

          window.scrollTo(0, 0);

          setQuantity(1);

          setActiveTab(
            "size-guide"
          );


          /* ================= PRODUCT ================= */

          const data =
            await productService.getProductById(
              id
            );


          setProduct(data);


          /* ==============================================
             TAB MẶC ĐỊNH THEO LOẠI SẢN PHẨM
             - Túi (category_id = 4): không có bảng số đo
             - Các nhóm còn lại: giữ bảng số đo như hiện tại
          ============================================== */

          const loadedProductIsBag =
            isBagCategory(data);

          setActiveTab(
            loadedProductIsBag
              ? "description"
              : "size-guide"
          );


          const firstImage =
            data.thumbnail ||
            data.images?.[0]
              ?.image_url ||
            "/images/placeholder.png";

          setDisplayImage(
            firstImage
          );


          /* ================= COLORS ================= */

          const colors = [
            ...new Set(
              (data.variants || [])
                .map(
                  (variant) =>
                    variant.color
                )
                .filter(Boolean)
            ),
          ];

          setAvailableColors(
            colors
          );


          if (
            colors.length > 0
          ) {
            setColor(
              colors[0]
            );
          } else {
            setColor("");
          }


          /* ================= FIRST SIZE ================= */

          /*
            Không set size trực tiếp từ variant đầu tiên ở đây.
            Sau khi product + color cập nhật,
            useEffect bên dưới sẽ chọn đúng size hợp lệ
            theo bảng size của từng loại sản phẩm.
          */
          setSize("");


          /* ================= WISHLIST ================= */

          const token =
            localStorage.getItem(
              "access_token"
            );


          if (token) {
            try {
              const wishlistRes =
                await fetch(
                  `${API_BASE_URL}/user/wishlist`,
                  {
                    headers: {
                      Accept:
                        "application/json",

                      Authorization:
                        `Bearer ${token}`,
                    },
                  }
                );


              const wishlistData =
                await wishlistRes.json();


              if (
                wishlistRes.ok &&
                wishlistData.status &&
                Array.isArray(
                  wishlistData.data
                )
              ) {
                const exists =
                  wishlistData.data.some(
                    (item) =>
                      item.product_id ===
                      data.id
                  );


                setIsFavorite(
                  exists
                );
              }
            } catch (error) {
              console.error(
                "Không thể kiểm tra wishlist:",
                error
              );
            }
          }


          /* ================= REVIEWS ================= */

          try {
            const reviewRes =
              await fetch(
                `${API_BASE_URL}/products/${id}/reviews`,
                {
                  method: "GET",

                  headers: {
                    Accept:
                      "application/json",
                  },
                }
              );


            const reviewData =
              await reviewRes.json();


            if (
              reviewRes.ok &&
              reviewData.status
            ) {
              setReviews(
                reviewData.data ||
                  []
              );
            }
          } catch (error) {
            console.error(
              "Lỗi lấy đánh giá:",
              error
            );
          }


          /* ================= RELATED ================= */

          const allProducts =
            await productService.getProducts();


          if (
            Array.isArray(
              allProducts
            )
          ) {
            const filtered =
              allProducts
                .filter(
                  (item) =>
                    item.id !==
                      data.id &&
                    (
                      item.brand_id ===
                        data.brand_id ||
                      item.category_id ===
                        data.category_id
                    )
                )
                .slice(
                  0,
                  5
                );


            if (
              filtered.length <
              5
            ) {
              const extra =
                allProducts
                  .filter(
                    (item) =>
                      item.id !==
                        data.id &&
                      !filtered.some(
                        (
                          filteredItem
                        ) =>
                          filteredItem.id ===
                          item.id
                      )
                  )
                  .slice(
                    0,
                    5 -
                      filtered.length
                  );


              setRelatedProducts([
                ...filtered,
                ...extra,
              ]);
            } else {
              setRelatedProducts(
                filtered
              );
            }
          }
        } catch (error) {
          console.error(
            "Lỗi tải chi tiết sản phẩm:",
            error
          );

          toast.error(
            "Không thể tải thông tin sản phẩm!"
          );
        } finally {
          setLoading(false);
        }
      };


    if (id) {
      fetchProductDetail();
    }
  }, [id]);



  /* =========================================================
     IMAGE HELPERS
  ========================================================= */

  const normalizeImage = (
    image
  ) => {
    if (!image) {
      return "";
    }


    if (
      typeof image ===
      "string"
    ) {
      return image;
    }


    return (
      image.image_url ||
      image.image ||
      image.thumbnail ||
      ""
    );
  };



  /* =========================================================
     GALLERY
     luôn ít nhất 8 ô
  ========================================================= */

  const realGalleryImages =
    useMemo(() => {
      if (!product) {
        return [];
      }


      return Array.from(
        new Set(
          [
            product.thumbnail,

            ...(product.images ||
              []).map(
              normalizeImage
            ),

            ...(product.variants ||
              []).map(
              (variant) =>
                variant.image ||
                variant.image_url ||
                variant.thumbnail
            ),
          ].filter(Boolean)
        )
      );
    }, [product]);


const galleryImages = realGalleryImages;



  /* =========================================================
     COLOR CODE
  ========================================================= */

  const getColorCode = (
    colorName = ""
  ) => {
    const value =
      colorName
        .toLowerCase()
        .trim();


    const colorMap = {
      đen: "#111111",
      black: "#111111",

      trắng: "#ffffff",
      white: "#ffffff",

      xám: "#9e9e9e",
      gray: "#9e9e9e",
      grey: "#9e9e9e",

      be: "#d9c7a2",
      beige: "#d9c7a2",

      đỏ: "#b51f2e",
      red: "#b51f2e",

      xanh: "#315f98",
      blue: "#315f98",

      nâu: "#67493c",
      brown: "#67493c",

      hồng: "#d79aaa",
      pink: "#d79aaa",
    };


    return (
      colorMap[value] ||
      "#d7d7d7"
    );
  };



/* =========================================================
   VARIANTS CỦA MÀU ĐANG CHỌN
========================================================= */

const variantsForCurrentColor =
  useMemo(() => {
    if (!product) {
      return [];
    }

    if (!color) {
      return product.variants || [];
    }

    return (product.variants || []).filter(
      (variant) =>
        variant.color === color
    );
  }, [product, color]);


/* =========================================================
   LOẠI BẢNG SIZE CỦA SẢN PHẨM
========================================================= */

const sizeGuideKey =
  useMemo(() => {
    return getSizeGuideKey(product);
  }, [product]);


const currentSizeGuide =
  sizeGuideKey
    ? SIZE_GUIDES[sizeGuideKey]
    : null;


/* =========================================================
   TÚI / BALO

   Túi vẫn dùng size thật từ API (ví dụ: Freesize),
   nhưng KHÔNG hiển thị Bảng số đo.
========================================================= */

const isBagProduct =
  isBagCategory(product);


/* =========================================================
   CHUẨN HÓA SIZE
========================================================= */

const normalizeSize = (value) => {
  return String(value ?? "")
    .trim()
    .toUpperCase();
};


/* =========================================================
   SIZE API THẬT CỦA MÀU ĐANG CHỌN
========================================================= */

const apiSizesForCurrentColor =
  useMemo(() => {
    return Array.from(
      new Set(
        variantsForCurrentColor
          .map((variant) =>
            String(
              variant.size ?? ""
            ).trim()
          )
          .filter(Boolean)
      )
    );
  }, [variantsForCurrentColor]);


/* =========================================================
   XÁC ĐỊNH HỆ SIZE GIÀY

   - Database hiện tại chủ yếu lưu EU: 40 / 41 / 42...
   - Nếu sau này API trả US: 7 / 8 / 8.5... thì tự nhận US.
   - Không trộn EU và US trong cùng một danh sách size.
========================================================= */

const shoeSizeSystem =
  useMemo(() => {
    if (
      sizeGuideKey !== "shoes"
    ) {
      return null;
    }

    const allShoeSizes =
      (product?.variants || [])
        .map((variant) =>
          Number(
            String(
              variant.size ?? ""
            ).trim()
          )
        )
        .filter(
          (value) =>
            !Number.isNaN(value)
        );

    const euCount =
      allShoeSizes.filter(
        (value) =>
          value >= 35
      ).length;

    const usCount =
      allShoeSizes.filter(
        (value) =>
          value >= 5 &&
          value < 20
      ).length;

    /*
      Không có dữ liệu để nhận biết:
      ưu tiên EU vì SQL hiện tại đang lưu size giày theo EU.
    */
    return euCount >= usCount
      ? "EU"
      : "US";
  }, [
    product,
    sizeGuideKey,
  ]);


/* =========================================================
   SIZE CHUẨN PHẢI HIỂN THỊ

   Quy tắc thống nhất:
   - Áo: hiện đủ size của bảng áo.
   - Quần nam: hiện đủ size của bảng quần nam.
   - Quần nữ: hiện đủ size của bảng quần nữ.
   - Giày: hiện đủ đúng hệ size mà API của sản phẩm đang dùng.
   - Size chưa có variant API vẫn hiện nhưng bị gạch chéo.
========================================================= */

const canonicalSizes =
  useMemo(() => {
    if (!currentSizeGuide) {
      return apiSizesForCurrentColor;
    }

    if (
      sizeGuideKey === "shoes"
    ) {
      if (
        shoeSizeSystem === "EU"
      ) {
        return currentSizeGuide.rows.map(
          (row) =>
            String(row[1])
        );
      }

      return currentSizeGuide.rows.map(
        (row) =>
          String(row[0])
      );
    }

    return (
      currentSizeGuide.sizes ||
      []
    ).map(String);
  }, [
    currentSizeGuide,
    sizeGuideKey,
    shoeSizeSystem,
    apiSizesForCurrentColor,
  ]);


/* =========================================================
   KIỂM TRA SIZE API CÓ CÙNG HỆ VỚI SẢN PHẨM KHÔNG

   Mục đích:
   - Không để áo/quần bị lẫn size 40/41/42 do dữ liệu cũ.
   - Giày EU không bị lẫn thêm US 7/8.
========================================================= */

const isCompatibleApiSize = (
  itemSize
) => {
  const normalized =
    normalizeSize(
      itemSize
    );

  if (!normalized) {
    return false;
  }

  if (
    sizeGuideKey === "shirt" ||
    sizeGuideKey === "pantsMen" ||
    sizeGuideKey === "pantsWomen"
  ) {
    return canonicalSizes.some(
      (guideSize) =>
        normalizeSize(
          guideSize
        ) === normalized
    );
  }

  if (
    sizeGuideKey === "shoes"
  ) {
    const numberSize =
      Number(itemSize);

    if (
      Number.isNaN(
        numberSize
      )
    ) {
      return false;
    }

    return shoeSizeSystem === "EU"
      ? numberSize >= 35
      : (
          numberSize >= 5 &&
          numberSize < 20
        );
  }

  return true;
};


/* =========================================================
   DANH SÁCH SIZE HIỂN THỊ CUỐI CÙNG

   - Luôn có đủ bảng size chuẩn.
   - Size API hợp lệ nhưng nằm ngoài bảng chuẩn vẫn được giữ lại.
   - Size không có trong API sẽ được gạch chéo ở phần render.
========================================================= */

const displaySizes =
  useMemo(() => {
    const compatibleApiSizes =
      apiSizesForCurrentColor.filter(
        isCompatibleApiSize
      );

    const merged =
      Array.from(
        new Set([
          ...canonicalSizes,
          ...compatibleApiSizes,
        ])
      );

    const letterOrder = [
      "XXS",
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL",
    ];

    return merged.sort(
      (a, b) => {
        if (
          sizeGuideKey ===
          "shoes"
        ) {
          return (
            Number(a) -
            Number(b)
          );
        }

        const upperA =
          normalizeSize(a);

        const upperB =
          normalizeSize(b);

        const letterA =
          letterOrder.indexOf(
            upperA
          );

        const letterB =
          letterOrder.indexOf(
            upperB
          );

        if (
          letterA !== -1 &&
          letterB !== -1
        ) {
          return (
            letterA -
            letterB
          );
        }

        const numberA =
          Number(a);

        const numberB =
          Number(b);

        if (
          !Number.isNaN(
            numberA
          ) &&
          !Number.isNaN(
            numberB
          )
        ) {
          return (
            numberA -
            numberB
          );
        }

        return String(a)
          .localeCompare(
            String(b),
            "vi"
          );
      }
    );
  }, [
    apiSizesForCurrentColor,
    canonicalSizes,
    sizeGuideKey,
    shoeSizeSystem,
  ]);


/* =========================================================
   TÌM VARIANT ĐÚNG SIZE + MÀU TỪ API
========================================================= */

const getVariantBySize = (
  itemSize
) => {
  return (
    variantsForCurrentColor.find(
      (variant) =>
        normalizeSize(
          variant.size
        ) ===
        normalizeSize(
          itemSize
        )
    ) || null
  );
};


/* =========================================================
   TRẠNG THÁI SIZE

   missing:
   - size thuộc bảng chuẩn nhưng API chưa có variant.

   soldOut:
   - API có variant nhưng stock <= 0.

   Cả 2 trường hợp đều gạch chéo.
========================================================= */

const getSizeStatus = (
  itemSize
) => {
  const variant =
    getVariantBySize(
      itemSize
    );

  if (!variant) {
    return {
      variant: null,
      missing: true,
      soldOut: false,
      unavailable: true,
      stock: 0,
    };
  }

  const stock =
    Number(
      variant.stock || 0
    );

  return {
    variant,
    missing: false,
    soldOut:
      stock <= 0,
    unavailable:
      stock <= 0,
    stock,
  };
};


/* =========================================================
   BẢNG SIZE HIỂN THỊ BÊN DƯỚI

   Với giày:
   - Nếu sản phẩm dùng EU thì đưa EU lên cột đầu.
   - Nếu sản phẩm dùng US thì giữ US ở cột đầu.
========================================================= */

const sizeGuideDisplay =
  useMemo(() => {
    if (!currentSizeGuide) {
      return null;
    }

    if (
      sizeGuideKey === "shoes" &&
      shoeSizeSystem === "EU"
    ) {
      return {
        ...currentSizeGuide,

        title:
          "SIZE GIÀY NAM (EU)",

        columns: [
          "EU",
          "US",
          "JP/CM",
          "UK",
        ],

        rows:
          currentSizeGuide.rows.map(
            (
              [
                us,
                eu,
                jp,
                uk,
              ]
            ) => [
              eu,
              us,
              jp,
              uk,
            ]
          ),
      };
    }

    if (
      sizeGuideKey === "shoes"
    ) {
      return {
        ...currentSizeGuide,
        title:
          "SIZE GIÀY NAM (US)",
      };
    }

    return currentSizeGuide;
  }, [
    currentSizeGuide,
    sizeGuideKey,
    shoeSizeSystem,
  ]);


/* =========================================================
   AUTO CHỌN SIZE KHI ĐỔI SẢN PHẨM / MÀU

   Chỉ tự chọn size:
   - có variant thật trong API
   - stock > 0
   - đang nằm trong danh sách size hợp lệ của sản phẩm
========================================================= */

useEffect(() => {
  if (!product) {
    return;
  }

  if (
    displaySizes.length === 0
  ) {
    setSize("");
    setQuantity(1);
    return;
  }

  const currentIsDisplayed =
    displaySizes.some(
      (itemSize) =>
        normalizeSize(
          itemSize
        ) ===
        normalizeSize(
          size
        )
    );

  const currentVariant =
    currentIsDisplayed &&
    size
      ? getVariantBySize(size)
      : null;

  if (
    currentVariant &&
    Number(
      currentVariant.stock || 0
    ) > 0
  ) {
    return;
  }

  const firstAvailableSize =
    displaySizes.find(
      (itemSize) => {
        const variant =
          getVariantBySize(
            itemSize
          );

        return (
          variant &&
          Number(
            variant.stock || 0
          ) > 0
        );
      }
    );

  if (firstAvailableSize) {
    setSize(
      firstAvailableSize
    );

    setQuantity(1);

    return;
  }

  /*
    Nếu tất cả đều hết hàng:
    chọn size đầu tiên có variant thật để phần stock hiển thị đúng.
  */
  const firstConfiguredSize =
    displaySizes.find(
      (itemSize) =>
        Boolean(
          getVariantBySize(
            itemSize
          )
        )
    );

  setSize(
    firstConfiguredSize ||
      ""
  );

  setQuantity(1);
}, [
  product,
  color,
  displaySizes,
  variantsForCurrentColor,
]);


/* =========================================================
   VARIANT ĐANG CHỌN = VARIANT THẬT TỪ API
========================================================= */

const selectedVariant =
  useMemo(() => {
    if (!size) {
      return null;
    }

    return (
      variantsForCurrentColor.find(
        (variant) =>
          normalizeSize(
            variant.size
          ) ===
          normalizeSize(size)
      ) || null
    );
  }, [
    variantsForCurrentColor,
    size,
  ]);


/* =========================================================
   STOCK CỦA SIZE + MÀU ĐANG CHỌN
========================================================= */

const currentStock =
  selectedVariant
    ? Number(
        selectedVariant.stock || 0
      )
    : 0;


/* =========================================================
     COLOR CHANGE
  ========================================================= */

  const handleColorChange = (
    selectedColor
  ) => {
    setColor(
      selectedColor
    );

    setQuantity(1);
  };



  /* =========================================================
     SIZE GUIDE
  ========================================================= */

  const handleGoToSizeGuide =
    () => {
      setActiveTab(
        "size-guide"
      );


      setTimeout(() => {
        const element =
          document.getElementById(
            "product-size-guide"
          );


        if (element) {
          element.scrollIntoView(
            {
              behavior:
                "smooth",

              block:
                "start",
            }
          );
        }
      }, 50);
    };



  /* =========================================================
     WISHLIST
  ========================================================= */

  const handleToggleWishlist =
    async () => {
      const token =
        localStorage.getItem(
          "access_token"
        );


      if (!token) {
        toast.error(
          "Vui lòng đăng nhập để thêm vào yêu thích!"
        );

        navigate(
          "/login"
        );

        return;
      }


      try {
        setFavoriteLoading(
          true
        );


        const res =
          await fetch(
            `${API_BASE_URL}/user/wishlist/toggle`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  product_id:
                    product.id,
                }),
            }
          );


        const data =
          await res.json();


        if (
          res.ok &&
          data.status
        ) {
          setIsFavorite(
            data.is_favorite
          );


          toast.success(
            data.message ||
              (
                data.is_favorite
                  ? "Đã thêm vào danh sách yêu thích!"
                  : "Đã bỏ khỏi danh sách yêu thích!"
              )
          );

          return;
        }


        if (
          res.status ===
          401
        ) {
          localStorage.removeItem(
            "access_token"
          );
          localStorage.removeItem(
            "user_info"
          );

          toast.error(
            "Phiên đăng nhập đã hết hạn!"
          );

          navigate(
            "/login"
          );

          return;
        }


        toast.error(
          data.message ||
            "Không thể cập nhật danh sách yêu thích"
        );
      } catch (error) {
        console.error(
          "Wishlist:",
          error
        );

        toast.error(
          "Không thể kết nối đến máy chủ"
        );
      } finally {
        setFavoriteLoading(
          false
        );
      }
    };



  /* =========================================================
     ADD TO CART
     GIỮ NGUYÊN API
  ========================================================= */

  const handleAddToCart =
    async () => {
      const token =
        localStorage.getItem(
          "access_token"
        );


      if (!token) {
        toast.error(
          "Vui lòng đăng nhập để thêm vào giỏ hàng!"
        );

        navigate(
          "/login"
        );

        return false;
      }


      if (
        displaySizes.length >
          0 &&
        !size
      ) {
        toast.error(
          "Vui lòng chọn kích thước!"
        );

        return false;
      }


      if (
        availableColors.length >
          0 &&
        !color
      ) {
        toast.error(
          "Vui lòng chọn màu sắc!"
        );

        return false;
      }


      try {
        setSubmitting(
          true
        );


        /*
          selectedVariant là đúng variant API đang trả về.
          Không quy đổi size ở frontend.
        */
        const matchedVariant =
          selectedVariant;


        if (
          !matchedVariant
        ) {
          toast.error(
            "Phiên bản sản phẩm này hiện không có sẵn!"
          );

          return false;
        }


        const stock =
          Number(
            matchedVariant.stock ||
              0
          );


        if (
          stock <= 0
        ) {
          toast.error(
            "Sản phẩm đã hết hàng."
          );

          return false;
        }


        if (
          quantity > stock
        ) {
          toast.error(
            `Chỉ còn ${stock} sản phẩm trong kho.`
          );

          return false;
        }


        const res =
          await fetch(
            `${API_BASE_URL}/cart/add`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",

                Authorization:
                  `Bearer ${token.trim()}`,
              },

              body:
                JSON.stringify({
                  product_variant_id:
                    matchedVariant.id,

                  quantity:
                    quantity,
                }),
            }
          );


        const data =
          await res.json();


        if (
          res.ok &&
          data.success
        ) {
          toast.success(
            data.message ||
              "Đã thêm sản phẩm vào giỏ hàng!"
          );

          return true;
        }


        if (
          res.status ===
          401
        ) {
          localStorage.removeItem(
            "access_token"
          );
          localStorage.removeItem(
            "user_info"
          );

          toast.error(
            "Phiên đăng nhập đã hết hạn!"
          );

          navigate(
            "/login"
          );

          return false;
        }


        toast.error(
          data.message ||
            "Không thể thêm vào giỏ hàng"
        );

        return false;
      } catch (error) {
        console.error(
          "Lỗi giỏ hàng:",
          error
        );

        toast.error(
          "Lỗi kết nối đến máy chủ"
        );

        return false;
      } finally {
        setSubmitting(
          false
        );
      }
    };



  /* =========================================================
     BUY NOW
  ========================================================= */

  const handleBuyNow =
    async () => {
      const success =
        await handleAddToCart();


      if (success) {
        setTimeout(() => {
          navigate(
            "/shipping-info"
          );
        }, 400);
      }
    };



  /* =========================================================
     REVIEW
  ========================================================= */

  const handleReviewSubmit =
    async (event) => {
      event.preventDefault();


      if (
        !newReview.comment.trim()
      ) {
        toast.error(
          "Vui lòng nhập nội dung đánh giá!"
        );

        return;
      }


      const token =
        localStorage.getItem(
          "access_token"
        );


      if (!token) {
        toast.error(
          "Vui lòng đăng nhập để đánh giá!"
        );

        navigate(
          "/login"
        );

        return;
      }


      try {
        setSubmittingReview(
          true
        );


        const res =
          await fetch(
            `${API_BASE_URL}/products/${product.id}/reviews`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  rating:
                    Number(
                      newReview.rating
                    ),

                  comment:
                    newReview.comment,
                }),
            }
          );


        const data =
          await res.json();


        if (
          res.ok &&
          data.status
        ) {
          toast.success(
            data.message ||
              "Cảm ơn bạn đã gửi đánh giá!"
          );


          if (
            data.review
          ) {
            setReviews(
              (
                previousReviews
              ) => [
                data.review,
                ...previousReviews,
              ]
            );
          }


          setNewReview({
            rating: 5,
            comment: "",
          });
        } else if (res.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_info");
          toast.error("Phiên đăng nhập đã hết hạn!");
          navigate("/login");
        } else {
          toast.error(
            data.message ||
              "Không thể gửi đánh giá!"
          );
        }
      } catch (error) {
        console.error(
          error
        );

        toast.error(
          "Lỗi kết nối máy chủ!"
        );
      } finally {
        setSubmittingReview(
          false
        );
      }
    };



  /* =========================================================
     REPORT REVIEW
  ========================================================= */

  const handleReportReview =
    async (reviewId) => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        toast.error("Vui lòng đăng nhập để báo cáo bình luận!");
        navigate("/login");
        return;
      }

      const confirmed =
        window.confirm(
          "Bạn có chắc chắn muốn báo cáo bình luận này không?"
        );


      if (!confirmed) {
        return;
      }


      try {
        const res =
          await fetch(
            `${API_BASE_URL}/reviews/${reviewId}/report`,
            {
              method:
                "POST",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const data =
          await res.json();


        if (res.ok) {
          toast.success(
            data.message ||
              "Đã gửi báo cáo thành công!"
          );
        } else if (res.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_info");
          toast.error("Phiên đăng nhập đã hết hạn!");
          navigate("/login");
        } else {
          toast.error(
            "Không thể báo cáo bình luận này."
          );
        }
      } catch (error) {
        console.error(
          error
        );

        toast.error(
          "Lỗi kết nối máy chủ!"
        );
      }
    };



  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="product-detail-loading">
        Đang tải sản phẩm...
      </div>
    );
  }


  if (!product) {
    return (
      <div className="product-detail-loading">
        Sản phẩm không tồn tại!
      </div>
    );
  }

  const regularPrice = Number(product.price || 0);
  const currentPrice = Number(
    product.current_price ??
      product.sale_price ??
      product.price ??
      0
  );
  const hasActiveSale =
    currentPrice > 0 &&
    regularPrice > currentPrice;



  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <Toaster position="top-right" />


      {/* =====================================================
          BREADCRUMB
      ====================================================== */}

      <div className="breadcrumb">

        <Link to="/">
          Trang chủ
        </Link>

        <span className="separator">
          &gt;
        </span>

        <Link to="/products">
          Sản phẩm
        </Link>

        <span className="separator">
          &gt;
        </span>

        <span className="current-page">
          {product.name}
        </span>

      </div>



      {/* =====================================================
          MAIN PRODUCT
      ====================================================== */}

      <div className="product-detail">


        {/* ===================================================
            LEFT
        ==================================================== */}

        <div className="product-gallery">

          <div className="product-image">

            {displayImage?.startsWith(
              "empty-"
            ) ? (

              <div className="product-main-no-image">

                <i className="fa-regular fa-image"></i>

                <span>
                  CHƯA CÓ HÌNH
                </span>

              </div>

            ) : (

              <img
                src={
                  displayImage ||
                  "/images/placeholder.png"
                }
                alt={product.name}
                className="product-main-image"
              />

            )}

          </div>



          {/* THUMBNAILS */}

          <div className="product-thumbnails">

            {galleryImages.map(
              (
                image,
                index
              ) => {

                const hasImage =
                  Boolean(
                    image
                  );


                const emptyKey =
                  `empty-${index}`;


                const active =
                  hasImage
                    ? displayImage ===
                      image
                    : displayImage ===
                      emptyKey;


                return (
                  <button
                    key={`gallery-${index}`}
                    type="button"
                    className={`product-thumbnail ${
                      active
                        ? "active"
                        : ""
                    } ${
                      !hasImage
                        ? "product-thumbnail-empty"
                        : ""
                    }`}
                    onClick={() => {
                      if (
                        hasImage
                      ) {
                        setDisplayImage(
                          image
                        );
                      } else {
                        setDisplayImage(
                          emptyKey
                        );
                      }
                    }}
                  >

                    {hasImage ? (

                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                      />

                    ) : (

                      <div className="thumbnail-no-image">

                        <i className="fa-regular fa-image"></i>

                        <span>
                          CHƯA CÓ HÌNH
                        </span>

                      </div>

                    )}

                  </button>
                );
              }
            )}

          </div>

        </div>



        {/* ===================================================
            RIGHT
        ==================================================== */}

        <div className="product-info">


          <div className="product-brand-name">
            {product.brand?.name ||
              "ASH"}
          </div>


          <h1 className="product-title">
            {product.name}
          </h1>


          <p className="product-sku">
            Mã sản phẩm:{" "}
            {product.sku ||
              "Chưa cập nhật"}
          </p>


          <div className="product-price-row">
            <div className="product-price">
              {currentPrice.toLocaleString("vi-VN")} đ
            </div>

            {hasActiveSale && (
              <>
                <span className="product-original-price">
                  {regularPrice.toLocaleString("vi-VN")} đ
                </span>
                <span className="product-sale-badge">
                  -{Math.round(
                    ((regularPrice - currentPrice) / regularPrice) * 100
                  )}%
                </span>
              </>
            )}
          </div>



          {/* =================================================
              PROMOTION
          ================================================== */}

          <div className="product-promotion-box">

            <ul className="ash-promotion-list">

              <li>
                <strong>
                  MỪNG 2-9 🎆 GIẢM THÊM 10%
                </strong>{" "}
                khi mua từ 02 sản phẩm 🌟{" "}

                <strong>
                  GIẢM THÊM 5%
                </strong>{" "}
                khi mua 01 sản phẩm. ĐẾN HẾT 3.9.{" "}

                <button
                  type="button"
                  className="promotion-link"
                >
                  Click mua ngay
                </button>
              </li>


              <li>
                <strong>
                  👟 CRAFT 🎁 TẶNG THÊM 250.000Đ
                </strong>{" "}
                cho tất cả giày Craft. Đến hết 3.9.{" "}

                <strong>
                  ĐỪNG BỎ LỠ!!!
                </strong>{" "}

                <button
                  type="button"
                  className="promotion-link"
                >
                  Click mua ngay
                </button>
              </li>


              <li>
                <strong>
                  💙💗 LƯU Ý KHI CHỌN MÀU SẢN PHẨM:
                </strong>{" "}
                Vui lòng căn cứ theo hình ảnh sản phẩm hiển thị khi{" "}

                <strong>
                  bấm vào từng ô màu
                </strong>{" "}

                để chọn màu bạn cần!
              </li>


              <li>
                <strong>
                  Website đang hiển thị SIZE US (MỸ) - Bấm vào bảng size để xem size quy đổi
                </strong>
              </li>


              <li>
                <strong>
                  ❗ KHÔNG ĐỔI/ TRẢ đối với sản phẩm giảm giá, đồ lót, Adidas Underwear, phụ kiện, quần bơi bó sát, áo bơi liền quần với mọi lí do.
                </strong>
              </li>


              <li>
                <strong>
                  ❗ Quý khách vui lòng xem qua chính sách Đổi trả - Bảo hành của ASH trước khi đặt hàng tại
                </strong>{" "}

                <button
                  type="button"
                  className="promotion-link"
                  onClick={() => {
                    setActiveTab(
                      "return-policy"
                    );

                    setTimeout(
                      () => {
                        document
                          .getElementById(
                            "product-size-guide"
                          )
                          ?.scrollIntoView(
                            {
                              behavior:
                                "smooth",
                            }
                          );
                      },
                      50
                    );
                  }}
                >
                  link này
                </button>

                <strong>
                  {" "}
                  ĐỂ ĐẢM BẢO ĐẦY ĐỦ QUYỀN LỢI KHI MUA HÀNG.
                </strong>
              </li>


              <li>
                <strong>
                  🌟 BẠN CÓ THỂ MUA TRƯỚC TRẢ SAU 0% LÃI SUẤT
                </strong>

                <em>
                  {" "}
                  (Qua cổng Onepay - Chọn Buy Now Pay Later)
                </em>
              </li>

            </ul>

          </div>



          {/* =================================================
              COLORS
          ================================================== */}

          {availableColors.length >
            0 && (

            <div className="option product-options">

              <div className="option-title-row">

                <h4>
                  Màu Sắc:
                </h4>

                <span>
                  {color}
                </span>

              </div>


              <div className="color-options ash-color-options">

                {availableColors.map(
                  (
                    itemColor
                  ) => (

                    <button
                      key={
                        itemColor
                      }
                      type="button"
                      title={
                        itemColor
                      }
                      className={`ash-detail-color ${
                        color ===
                        itemColor
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleColorChange(
                          itemColor
                        )
                      }
                    >

                      <span
                        style={{
                          backgroundColor:
                            getColorCode(
                              itemColor
                            ),
                        }}
                      />

                    </button>

                  )
                )}

              </div>

            </div>
          )}



          {/* =================================================
              SIZE
          ================================================== */}

          {displaySizes.length > 0 && (
            <div className="option product-options product-size-section">

              <div className="product-size-heading">

                <div className="product-size-current">
                  <strong>
                    Size:
                  </strong>

                  <span>
                    {size || "Chưa chọn"}
                  </span>
                </div>


                {currentSizeGuide && (
                  <button
                    type="button"
                    className="size-guide-link"
                    onClick={
                      handleGoToSizeGuide
                    }
                  >
                    Bảng số đo
                  </button>
                )}

              </div>


              <div className="size-list size-options">

                {displaySizes.map(
                  (itemSize) => {
                    const sizeStatus =
                      getSizeStatus(
                        itemSize
                      );

                    const unavailable =
                      sizeStatus.unavailable;

                    const isActive =
                      !unavailable &&
                      normalizeSize(size) ===
                      normalizeSize(
                        itemSize
                      );

                    let sizeTitle =
                      `Chọn size ${itemSize}`;

                    if (
                      sizeStatus.missing
                    ) {
                      sizeTitle =
                        `Size ${itemSize} hiện chưa có biến thể`;
                    } else if (
                      sizeStatus.soldOut
                    ) {
                      sizeTitle =
                        `Size ${itemSize} đã hết hàng`;
                    }

                    return (
                      <button
                        key={itemSize}
                        type="button"
                        disabled={
                          unavailable
                        }
                        title={
                          sizeTitle
                        }
                        className={`size-btn ${
                          isActive
                            ? "active"
                            : ""
                        } ${
                          unavailable
                            ? "unavailable"
                            : ""
                        } ${
                          sizeStatus.missing
                            ? "missing-size"
                            : ""
                        }`}
                        onClick={() => {
                          if (
                            unavailable
                          ) {
                            return;
                          }

                          setSize(
                            itemSize
                          );

                          setQuantity(1);
                        }}
                      >
                        {itemSize}
                      </button>
                    );
                  }
                )}

              </div>

            </div>
          )}


          {/* =================================================
              QUANTITY
          ================================================== */}

          <div className="option quantity-section">

            <div className="quantity-title-row">

              <h4>
                Số lượng
              </h4>


              <span
                className={
                  currentStock >
                  0
                    ? "stock-in"
                    : "stock-out"
                }
              >

                {currentStock > 0
                  ? `Còn ${currentStock} sản phẩm`
                  : "Tạm thời hết hàng"}

              </span>

            </div>


            <div className="quantity-box">

              <button
                type="button"
                className="qty-btn"
                onClick={() =>
                  setQuantity(
                    (
                      previous
                    ) =>
                      Math.max(
                        1,
                        previous -
                          1
                      )
                  )
                }
              >
                −
              </button>


              <input
                type="text"
                value={
                  quantity
                }
                readOnly
              />


              <button
                type="button"
                className="qty-btn"
                onClick={() => {
                  if (
                    quantity <
                    currentStock
                  ) {
                    setQuantity(
                      (
                        previous
                      ) =>
                        previous +
                        1
                    );
                  } else {
                    toast.error(
                      `Chỉ còn ${currentStock} sản phẩm trong kho!`
                    );
                  }
                }}
              >
                +
              </button>

            </div>

          </div>



          {/* =================================================
              CART
          ================================================== */}

          <div className="cart-action action-buttons">

            <button
              type="button"
              className="add-cart add-to-cart"
              onClick={
                handleAddToCart
              }
              disabled={
                submitting ||
                currentStock <=
                  0
              }
            >
              {submitting
                ? "ĐANG XỬ LÝ..."
                : "THÊM VÀO GIỎ HÀNG"}
            </button>


            <button
              type="button"
              className="buy-now-btn"
              onClick={
                handleBuyNow
              }
              disabled={
                submitting ||
                currentStock <=
                  0
              }
            >
              {currentStock > 0
                ? "MUA NGAY"
                : "BÁN HẾT"}
            </button>

          </div>



          {/* =================================================
              WISHLIST
          ================================================== */}

          <button
            type="button"
            className={`product-wishlist-button ${
              isFavorite
                ? "active"
                : ""
            }`}
            onClick={
              handleToggleWishlist
            }
            disabled={
              favoriteLoading
            }
          >

            <i
              className={
                isFavorite
                  ? "fa-solid fa-heart"
                  : "fa-regular fa-heart"
              }
            ></i>


            <span>
              {isFavorite
                ? "Đã thêm vào danh sách yêu thích"
                : "Thêm vào danh sách yêu thích"}
            </span>

          </button>


        </div>

      </div>



      {/* =====================================================
          TABS
      ====================================================== */}

      <section
        id="product-size-guide"
        className="product-tabs-section"
      >

        <div className="tab tab-header">

          {!isBagProduct && (
            <button
              type="button"
              className={
                activeTab ===
                "size-guide"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab(
                  "size-guide"
                )
              }
            >
              BẢNG SỐ ĐO
            </button>
          )}


          <button
            type="button"
            className={
              activeTab ===
              "description"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "description"
              )
            }
          >
            MÔ TẢ
          </button>


          <button
            type="button"
            className={
              activeTab ===
              "return-policy"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "return-policy"
              )
            }
          >
            CHÍNH SÁCH ĐỔI TRẢ - BẢO HÀNH
          </button>


          <button
            type="button"
            className={
              activeTab ===
              "reviews"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "reviews"
              )
            }
          >
            ĐÁNH GIÁ ({reviews.length})
          </button>

        </div>



        {/* ===================================================
            SIZE GUIDE
        =================================================== */}

        {activeTab === "size-guide" &&
          !isBagProduct && (
          <div className="tab-content size-guide-content">

            {sizeGuideDisplay ? (
              <>
                <p className="size-guide-warning">
                  <strong>
                    <em>
                      *LƯU Ý KHI CHỌN SIZE:
                    </em>
                  </strong>{" "}

                  {sizeGuideKey === "shoes"
                    ? (
                      <>
                        SẢN PHẨM NÀY ĐANG DÙNG HỆ SIZE{" "}
                        <strong>
                          {shoeSizeSystem}
                        </strong>
                        {" "}Ở PHẦN CHỌN SIZE. BẢNG BÊN DƯỚI ĐÃ ĐƯA HỆ{" "}
                        <strong>
                          {shoeSizeSystem}
                        </strong>
                        {" "}LÊN CỘT ĐẦU ĐỂ ĐỐI CHIẾU DỄ HƠN.
                      </>
                    )
                    : (
                      <>
                        BẢNG SỐ ĐO ĐƯỢC CHỌN THEO ĐÚNG LOẠI SẢN PHẨM{" "}
                        <strong>
                          {product?.name?.toUpperCase() || "SẢN PHẨM"}
                        </strong>
                        . SIZE KHÔNG CÓ BIẾN THỂ TRONG API VẪN HIỂN THỊ Ở PHẦN CHỌN SIZE NHƯNG SẼ BỊ GẠCH CHÉO.
                      </>
                    )}
                </p>


                <div className="size-guide-table-wrap">

                  <table className="size-guide-table">

                    <thead>

                      <tr className="size-guide-main-title">
                        <th
                          colSpan={
                            sizeGuideDisplay.columns.length
                          }
                        >
                          BẢNG SIZE - {product?.name?.toUpperCase() || sizeGuideDisplay.title}
                        </th>
                      </tr>


                      <tr className="size-guide-columns">
                        {sizeGuideDisplay.columns.map(
                          (column) => (
                            <th key={column}>
                              {column}
                            </th>
                          )
                        )}
                      </tr>

                    </thead>


                    <tbody>
                      {sizeGuideDisplay.rows.map(
                        (row, rowIndex) => (
                          <tr
                            key={`size-row-${rowIndex}`}
                          >
                            {row.map(
                              (
                                cell,
                                cellIndex
                              ) => (
                                <td
                                  key={`size-cell-${rowIndex}-${cellIndex}`}
                                >
                                  {cell}
                                </td>
                              )
                            )}
                          </tr>
                        )
                      )}
                    </tbody>

                  </table>

                </div>
              </>
            ) : (
              <p className="size-guide-note">
                Sản phẩm này không sử dụng bảng số đo theo Áo / Quần / Giày. Vui lòng chọn biến thể kích thước đang có trên sản phẩm.
              </p>
            )}

          </div>
        )}

{/* ===================================================
    DESCRIPTION
=================================================== */}

{activeTab === "description" && (
  <div className="tab-content description-content">

    <div className="product-description-block">

      <h3 className="description-product-name">
        {product.name}
      </h3>


      <div className="description-meta">

        <p>
          <strong>Thương hiệu:</strong>{" "}
          {product.brand?.name || "Đang cập nhật"}
        </p>

        <p>
          <strong>Mã sản phẩm:</strong>{" "}
          {product.sku || "Đang cập nhật"}
        </p>

        <p>
          <strong>Danh mục:</strong>{" "}
          {product.category?.name || "Đang cập nhật"}
        </p>

      </div>


      <div className="description-section">

        <h4>MÔ TẢ SẢN PHẨM</h4>

        <p>
          {product.description ||
            `${product.name} là sản phẩm được thiết kế theo phong cách hiện đại, dễ phối đồ và phù hợp với nhiều hoạt động hằng ngày.`}
        </p>

      </div>


      <div className="description-section">

        <h4>ĐẶC ĐIỂM NỔI BẬT</h4>

        <ul>
          <li>
            Thiết kế hiện đại, dễ sử dụng và phối cùng nhiều phong cách khác nhau.
          </li>

          <li>
            Form sản phẩm được hoàn thiện theo hướng thoải mái và phù hợp cho nhu cầu sử dụng hằng ngày.
          </li>

          <li>
            Chất liệu được lựa chọn nhằm mang lại cảm giác dễ chịu trong quá trình sử dụng.
          </li>

          <li>
            Phù hợp cho nhiều hoàn cảnh như đi học, đi làm, đi chơi hoặc vận động nhẹ.
          </li>
        </ul>

      </div>


      <div className="description-section">

        <h4>THÔNG TIN SẢN PHẨM</h4>

        <div className="description-info-grid">

          <div>
            <span>Thương hiệu</span>
            <strong>
              {product.brand?.name || "Đang cập nhật"}
            </strong>
          </div>

          <div>
            <span>Mã sản phẩm</span>
            <strong>
              {product.sku || "Đang cập nhật"}
            </strong>
          </div>

          <div>
            <span>Màu sắc</span>
            <strong>
              {color || "Đang cập nhật"}
            </strong>
          </div>

          <div>
            <span>Size</span>
            <strong>
              {size || "Đang cập nhật"}
            </strong>
          </div>

        </div>

      </div>


      <div className="description-section">

        <h4>HƯỚNG DẪN BẢO QUẢN</h4>

        <ul>
          <li>
            Bảo quản sản phẩm tại nơi khô ráo, thoáng mát.
          </li>

          <li>
            Tránh tiếp xúc trực tiếp với nhiệt độ cao trong thời gian dài.
          </li>

          <li>
            Nên vệ sinh sản phẩm theo hướng dẫn phù hợp với chất liệu.
          </li>

          <li>
            Không sử dụng hóa chất tẩy rửa mạnh.
          </li>
        </ul>

      </div>


      <p className="description-note">
        <strong>Lưu ý:</strong>{" "}
        Màu sắc thực tế của sản phẩm có thể chênh lệch nhẹ so với hình ảnh do điều kiện ánh sáng và thiết bị hiển thị.
      </p>

    </div>

  </div>
)}


        {/* POLICY */}
{activeTab === "return-policy" && (
  <div className="tab-content policy-content">

    <div className="policy-block">

      <h3 className="policy-main-title">
        CHÍNH SÁCH ĐỔI TRẢ - BẢO HÀNH
      </h3>


      <div className="policy-section">

        <h4>1. ĐIỀU KIỆN ĐỔI TRẢ</h4>

        <ul>
          <li>
            Sản phẩm còn nguyên tem, nhãn và chưa qua sử dụng.
          </li>

          <li>
            Sản phẩm không bị dơ, trầy xước, biến dạng hoặc có dấu hiệu đã qua sử dụng.
          </li>

          <li>
            Khách hàng cần cung cấp hóa đơn hoặc thông tin đơn hàng khi thực hiện đổi trả.
          </li>

          <li>
            Sản phẩm đổi trả phải đáp ứng đầy đủ điều kiện theo chính sách hiện hành của cửa hàng.
          </li>
        </ul>

      </div>


      <div className="policy-section">

        <h4>2. THỜI GIAN ĐỔI TRẢ</h4>

        <p>
          Thời gian hỗ trợ đổi trả được áp dụng theo quy định hiện hành của cửa hàng kể từ ngày nhận sản phẩm.
        </p>

        <p>
          Quý khách vui lòng kiểm tra sản phẩm ngay khi nhận hàng để được hỗ trợ nhanh nhất nếu phát sinh vấn đề.
        </p>

      </div>


      <div className="policy-section">

        <h4>3. SẢN PHẨM KHÔNG ÁP DỤNG ĐỔI TRẢ</h4>

        <ul>
          <li>
            Sản phẩm giảm giá hoặc thuộc chương trình khuyến mãi đặc biệt.
          </li>

          <li>
            Đồ lót, đồ bơi, phụ kiện và các sản phẩm có yêu cầu vệ sinh đặc biệt.
          </li>

          <li>
            Sản phẩm đã qua sử dụng, giặt, sửa chữa hoặc làm mất tem nhãn.
          </li>

          <li>
            Sản phẩm bị hư hỏng do người sử dụng hoặc bảo quản không đúng cách.
          </li>
        </ul>

      </div>


      <div className="policy-section">

        <h4>4. CHÍNH SÁCH BẢO HÀNH</h4>

        <ul>
          <li>
            Bảo hành được áp dụng đối với các lỗi kỹ thuật phát sinh từ nhà sản xuất.
          </li>

          <li>
            Thời gian và phạm vi bảo hành tùy thuộc vào từng sản phẩm.
          </li>

          <li>
            Các lỗi do sử dụng không đúng hướng dẫn, va đập, ngấm nước hoặc hao mòn tự nhiên không thuộc phạm vi bảo hành.
          </li>
        </ul>

      </div>


      <div className="policy-section">

        <h4>5. QUY TRÌNH HỖ TRỢ</h4>

        <ol>
          <li>
            Liên hệ bộ phận chăm sóc khách hàng và cung cấp thông tin đơn hàng.
          </li>

          <li>
            Gửi hình ảnh hoặc video tình trạng sản phẩm nếu được yêu cầu.
          </li>

          <li>
            Nhân viên xác nhận điều kiện đổi trả hoặc bảo hành.
          </li>

          <li>
            Thực hiện gửi sản phẩm về cửa hàng theo hướng dẫn.
          </li>
        </ol>

      </div>


      <div className="policy-product-info">

        <div>
          <span>Sản phẩm</span>

          <strong>
            {product?.name || "Đang cập nhật"}
          </strong>
        </div>


        <div>
          <span>Mã sản phẩm</span>

          <strong>
            {product?.sku || "Đang cập nhật"}
          </strong>
        </div>


        <div>
          <span>Thương hiệu</span>

          <strong>
            {product?.brand?.name || "Đang cập nhật"}
          </strong>
        </div>


        <div>
          <span>Danh mục</span>

          <strong>
            {product?.category?.name || "Đang cập nhật"}
          </strong>
        </div>

      </div>


      <div className="policy-warning">
        <strong>LƯU Ý:</strong>{" "}
        Quý khách vui lòng kiểm tra kỹ sản phẩm, màu sắc và kích thước trước khi đặt hàng. Chính sách áp dụng có thể thay đổi tùy từng sản phẩm và chương trình khuyến mãi.
      </div>

    </div>

  </div>
)}


        {/* REVIEWS */}

        {activeTab ===
          "reviews" && (

          <div className="tab-content reviews-content reviews-section">

            <form
              className="review-form"
              onSubmit={
                handleReviewSubmit
              }
            >

              <h4>
                Viết đánh giá của bạn
              </h4>


              <div className="rating-select">

                <label>
                  Số sao:
                </label>


                <select
                  value={
                    newReview.rating
                  }
                  onChange={(
                    event
                  ) =>
                    setNewReview(
                      {
                        ...newReview,

                        rating:
                          event
                            .target
                            .value,
                      }
                    )
                  }
                >

                  <option value={5}>
                    5 sao
                  </option>

                  <option value={4}>
                    4 sao
                  </option>

                  <option value={3}>
                    3 sao
                  </option>

                  <option value={2}>
                    2 sao
                  </option>

                  <option value={1}>
                    1 sao
                  </option>

                </select>

              </div>


              <textarea
                placeholder="Nội dung đánh giá..."
                value={
                  newReview.comment
                }
                onChange={(
                  event
                ) =>
                  setNewReview(
                    {
                      ...newReview,

                      comment:
                        event.target
                          .value,
                    }
                  )
                }
              />


              <button
                type="submit"
                className="submit-review-btn"
                disabled={
                  submittingReview
                }
              >
                {submittingReview
                  ? "Đang gửi..."
                  : "Gửi đánh giá"}
              </button>

            </form>



            <div className="review-list">

              {reviews.length >
              0 ? (

                reviews.map(
                  (
                    review
                  ) => (

                    <div
                      className="review-item"
                      key={
                        review.id
                      }
                    >

                      <div className="review-header">

                        <div>

                          <span className="review-name">
                            {review.name}
                          </span>

                          <span className="review-date">
                            {review.date}
                          </span>

                        </div>


                        <button
                          type="button"
                          className="report-btn"
                          onClick={() =>
                            handleReportReview(
                              review.id
                            )
                          }
                        >
                          <i className="fa-solid fa-flag"></i>
                          Báo cáo
                        </button>

                      </div>


                      <div className="review-stars review-rating">

                        {Array.from({
                          length: 5,
                        }).map(
                          (
                            _,
                            index
                          ) => (

                            <i
                              key={
                                index
                              }
                              className={
                                index <
                                Number(
                                  review.rating
                                )
                                  ? "fa-solid fa-star"
                                  : "fa-regular fa-star"
                              }
                            ></i>

                          )
                        )}

                      </div>


                      <p className="review-comment">
                        {review.comment}
                      </p>

                    </div>

                  )
                )

              ) : (

                <p className="review-empty">
                  Chưa có đánh giá nào.
                </p>

              )}

            </div>

          </div>
        )}

      </section>



      {/* =====================================================
    RELATED PRODUCTS
====================================================== */}

<section className="related-products">

  <h3>
    BẠN CŨNG CÓ THỂ QUAN TÂM
  </h3>

  <div className="related-list">

    {relatedProducts.length > 0 ? (

      relatedProducts.map((item) => (

        <ProductCard
          key={item.id}
          product={item}
        />

      ))

    ) : (

      <p className="related-empty">
        Không có sản phẩm liên quan nào.
      </p>

    )}

  </div>

</section>


      <Footer />

    </>
  );
}
