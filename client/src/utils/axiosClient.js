import axios from "axios";
import {
  API_BASE_URL,
} from "../config/api";
import {
  attachUnauthorizedInterceptor,
} from "./authInterceptor";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

attachUnauthorizedInterceptor(axiosClient);

export default axiosClient;