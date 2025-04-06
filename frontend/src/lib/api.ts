import axios from "axios";
import { toast } from "sonner";

// 1. Capture token from URL if present
if (window.location.search) {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (token) {
    // Store the token in localStorage
    localStorage.setItem('token', token);
    // Remove token from URL so it doesn't linger
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

const api = axios.create({
  // Using a relative URL if you're using a reverse proxy in development,
  // otherwise, use the environment variable as needed.
  baseURL: import.meta.env.VITE_API_URL + "/api", 
  withCredentials: true,
});

// 2. Request interceptor: Attach the JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response interceptor: Handle errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        toast.error("Session expired, please log back in.");
        window.location.href = "/login";
      } else {
        toast.error(error.response.data.message || "An error occurred.");
      }
    } else if (error.request) {
      toast.error("Network error, please try again.");
    } else {
      toast.error("An unexpected error occurred.");
    }
    return Promise.reject(error);
  }
);

export { api };
