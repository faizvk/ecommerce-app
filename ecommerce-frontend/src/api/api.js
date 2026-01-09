import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true, // REQUIRED for refresh cookie
});

/* Attach Access Token */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* Refresh Token Queue */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

/* Auto Refresh Access Token */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // DO NOT retry refresh requests
    if (original.url.includes("/refresh")) {
      return Promise.reject(error);
    }

    if ((status === 401 || status === 403) && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post("/refresh");
        const newToken = res.data.accessToken;

        localStorage.setItem("accessToken", newToken);

        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        original.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        isRefreshing = false;

        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;

        localStorage.clear();
        window.location.href = "/login";

        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
