import axios from "axios";
import Cookies from "js-cookie";

// Get environment-specific API URL
const API_URL = process.env.NODE_ENV === "production"
    ? "http://123.63.252.138:5001"
    : "http://localhost:5001";

// Token management functions
//const getToken = () => Cookies.get("_smartweld_Cookie");

const axiosInstance = axios.create({
  baseURL: API_URL,
  // timeout: 10000, // Add timeout for better error handling
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth header to requests
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = getToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     console.error("Request error:", error);
//     return Promise.reject(error);
//   }
// );

// Response interceptor - Handle auth errors and other responses
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Handle 401 Unauthorized errors
//     if (
//       error.response &&
//       error.response.status === 401 &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;

//       // Clear auth data
//       Cookies.remove("_smartweld_Cookie");
//       sessionStorage.removeItem("_smartWeldUser");
//       sessionStorage.removeItem("sessionExpire");

//       // Dispatch an event to notify the app about authentication failure
//       window.dispatchEvent(
//         new CustomEvent("authError", {
//           detail: { message: "Your session has expired. Please log in again." },
//         })
//       );

//       // Redirect to login page
//       window.location.href = "/login";

//       return Promise.reject(error);
//     }

//     // Handle network errors
//     if (error.message === "Network Error") {
//       console.error("Network error - please check your connection");
//       // You could dispatch a custom event for network errors too
//     }

//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
