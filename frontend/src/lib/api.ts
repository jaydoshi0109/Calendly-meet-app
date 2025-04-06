import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: "/api", // Use relative URL so it goes through the proxy
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add authorization headers here
    // config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // Handle unauthorized access (e.g., redirect to login)
        toast.error("Session expired, please log back in.");
        window.location.href = "/login";
      } else {
        toast.error(error.response.data.message || "An error occurred.");
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error("Network error, please try again.");
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error("An unexpected error occurred.");
    }
    return Promise.reject(error);
  }
);

export { api };