import axios from "axios";

/* =========================================================
   AXIOS INSTANCE
========================================================= */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",

  timeout: 30000,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* =========================================================
   REQUEST INTERCEPTOR
   Attach JWT token automatically
========================================================= */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

api.interceptors.response.use(
  /* Successful response */
  (response) => response,

  /* Error response */
  (error) => {
    const status = error.response?.status;

    const requestUrl = error.config?.url || "";

    /* =====================================================
       HANDLE 401 — UNAUTHORIZED
    ===================================================== */

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      /*
       * Don't force another redirect if:
       * - already on login page
       * - the failed request itself is the login request
       */

      const alreadyOnLogin = window.location.pathname.includes("/login");

      const isLoginRequest = requestUrl.includes("/auth/login");

      if (!alreadyOnLogin && !isLoginRequest) {
        window.location.href = "/login";
      }
    }

    /* =====================================================
       NORMALIZE ERROR MESSAGE
    ===================================================== */

    let message = "An unexpected error occurred";

    if (error.response) {
      /*
       * Backend responded with an error.
       *
       * Example:
       * {
       *   success: false,
       *   message: "Region not found"
       * }
       */

      message =
        error.response.data?.message || `Request failed with status ${status}`;
    } else if (error.request) {
      /*
       * Request was sent but backend
       * did not respond.
       */

      message =
        "Unable to connect to ForestGuard server. Please check whether the backend is running.";
    } else if (error.message) {
      /*
       * Axios/request configuration error.
       */

      message = error.message;
    }

    /*
     * Components can now consistently use:
     *
     * error.normalizedMessage
     */

    error.normalizedMessage = message;

    return Promise.reject(error);
  },
);

export default api;
