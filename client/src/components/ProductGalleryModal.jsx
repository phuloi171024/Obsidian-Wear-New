import { useEffect, useRef, useState } from "react";
import {
  FiImage,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config/api";

const MAX_GALLERY_IMAGES = 8;

export default function ProductGalleryModal({
  product,
  onClose,
  onUpdated,
}) {
  const inputRef = useRef(null);

  const [images, setImages] = useState(
    product?.images || []
  );
  const [selectedFiles, setSelectedFiles] =
    useState([]);
  const [uploading, setUploading] =
    useState(false);
  const [deletingId, setDeletingId] =
    useState(null);

  useEffect(() => {
    setImages(product?.images || []);
    setSelectedFiles([]);
  }, [product]);

  if (!product) {
    return null;
  }

  const remainingSlots = Math.max(
    0,
    MAX_GALLERY_IMAGES - images.length
  );

  const getImageUrl = (image) =>
    image?.image_url ||
    image?.image_path ||
    "/images/placeholder.png";

  const handleSelectFiles = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      setSelectedFiles([]);
      return;
    }

    if (files.length > remainingSlots) {
      toast.error(
        `Sản phẩm chỉ còn được thêm ${remainingSlots} ảnh.`
      );

      event.target.value = "";
      setSelectedFiles([]);
      return;
    }

    const invalidFile = files.find(
      (file) =>
        ![
          "image/jpeg",
          "image/png",
          "image/webp",
        ].includes(file.type)
    );

    if (invalidFile) {
      toast.error(
        "Chỉ chấp nhận ảnh JPEG, JPG, PNG hoặc WEBP."
      );

      event.target.value = "";
      setSelectedFiles([]);
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (oversizedFile) {
      toast.error(
        "Mỗi ảnh không được vượt quá 5MB."
      );

      event.target.value = "";
      setSelectedFiles([]);
      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Vui lòng chọn ảnh cần tải lên!");
      return;
    }

    const token = localStorage.getItem(
      "access_token"
    );

    if (!token) {
      toast.error("Phiên đăng nhập đã hết hạn!");
      return;
    }

    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("images[]", file);
    });

    try {
      setUploading(true);

      const response = await fetch(
        `${API_BASE_URL}/admin/products/${product.id}/images`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const validationMessage = data.errors
          ? Object.values(data.errors).flat()[0]
          : null;

        throw new Error(
          validationMessage ||
            data.message ||
            "Không thể tải ảnh lên!"
        );
      }

      const updatedImages =
        data.images || [];

      setImages(updatedImages);
      setSelectedFiles([]);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      onUpdated?.({
        ...product,
        images: updatedImages,
      });

      toast.success(
        data.message ||
          "Thêm ảnh gallery thành công!"
      );
    } catch (error) {
      toast.error(
        error.message ||
          "Không thể tải ảnh lên Cloudinary!"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa ảnh này?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem(
      "access_token"
    );

    if (!token) {
      toast.error("Phiên đăng nhập đã hết hạn!");
      return;
    }

    try {
      setDeletingId(imageId);

      const response = await fetch(
        `${API_BASE_URL}/admin/products/${product.id}/images/${imageId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Không thể xóa ảnh!"
        );
      }

      const updatedImages = images.filter(
        (image) => image.id !== imageId
      );

      setImages(updatedImages);

      onUpdated?.({
        ...product,
        images: updatedImages,
      });

      toast.success(
        data.message ||
          "Xóa ảnh gallery thành công!"
      );
    } catch (error) {
      toast.error(
        error.message ||
          "Không thể xóa ảnh!"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button
          type="button"
          onClick={onClose}
          style={styles.closeButton}
          aria-label="Đóng"
        >
          <FiX />
        </button>

        <h2 style={styles.title}>
          Quản lý ảnh gallery
        </h2>

        <p style={styles.productName}>
          {product.name}
        </p>

        <p style={styles.counter}>
          Đã có {images.length}/
          {MAX_GALLERY_IMAGES} ảnh
        </p>

        <div style={styles.grid}>
          {images.map((image) => (
            <div
              key={image.id}
              style={styles.imageCard}
            >
              <img
                src={getImageUrl(image)}
                alt={product.name}
                style={styles.image}
              />

              <button
                type="button"
                onClick={() =>
                  handleDelete(image.id)
                }
                disabled={
                  deletingId === image.id
                }
                style={styles.deleteButton}
                title="Xóa ảnh"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}

          {images.length === 0 && (
            <div style={styles.empty}>
              <FiImage size={34} />

              <span>
                Sản phẩm chưa có ảnh gallery
              </span>
            </div>
          )}
        </div>

        <div style={styles.uploadArea}>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={
              uploading ||
              remainingSlots === 0
            }
            onChange={handleSelectFiles}
          />

          <p style={styles.helpText}>
            Còn {remainingSlots} vị trí.
            Mỗi ảnh tối đa 5MB.
          </p>

          {selectedFiles.length > 0 && (
            <p style={styles.selectedText}>
              Đã chọn {selectedFiles.length}
              {" "}ảnh
            </p>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={
              uploading ||
              selectedFiles.length === 0
            }
            style={{
              ...styles.uploadButton,
              opacity:
                uploading ||
                selectedFiles.length === 0
                  ? 0.6
                  : 1,
            }}
          >
            <FiUpload />

            {uploading
              ? "Đang tải lên..."
              : "Tải ảnh lên"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 10000,
    background: "rgba(15, 23, 42, 0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },

  modal: {
    position: "relative",
    width: "min(850px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
  },

  closeButton: {
    position: "absolute",
    top: "16px",
    right: "16px",
    border: 0,
    background: "#f1f5f9",
    borderRadius: "8px",
    width: "36px",
    height: "36px",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  },

  title: {
    margin: "0 45px 5px 0",
  },

  productName: {
    margin: 0,
    color: "#475569",
  },

  counter: {
    color: "#64748b",
    fontSize: "14px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "14px",
    margin: "20px 0",
  },

  imageCard: {
    position: "relative",
    aspectRatio: "1 / 1",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#f8fafc",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  deleteButton: {
    position: "absolute",
    top: "7px",
    right: "7px",
    width: "32px",
    height: "32px",
    border: 0,
    borderRadius: "8px",
    background: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  },

  empty: {
    gridColumn: "1 / -1",
    minHeight: "160px",
    border: "2px dashed #cbd5e1",
    borderRadius: "12px",
    color: "#94a3b8",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  uploadArea: {
    paddingTop: "20px",
    borderTop: "1px solid #e2e8f0",
  },

  helpText: {
    color: "#64748b",
    fontSize: "13px",
  },

  selectedText: {
    color: "#0f172a",
    fontWeight: 600,
  },

  uploadButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    border: 0,
    borderRadius: "9px",
    background: "#0f172a",
    color: "#ffffff",
    padding: "11px 17px",
    cursor: "pointer",
    fontWeight: 600,
  },
};