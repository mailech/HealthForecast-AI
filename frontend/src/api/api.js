import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", 
  headers: {
    "Content-Type": "application/json",
  },
});


// ============================================================
// ADD JWT TOKEN TO EVERY REQUEST
// ============================================================

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hf_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// ============================================================
// HANDLE EXPIRED / INVALID TOKEN
// ============================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {

    if (error.response?.status === 401) {

      localStorage.removeItem("user");
      localStorage.removeItem("hf_token");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);


export default api; 