export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/api"
).replace(/\/+$/, "");

export const apiUrl = (path = "") => {
  const normalizedPath = String(path).replace(/^\/+/, "");

  return normalizedPath
    ? `${API_BASE_URL}/${normalizedPath}`
    : API_BASE_URL;
};