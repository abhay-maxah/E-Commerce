import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,
  setUser: (user) => set({ user }),


  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });
    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords do not match");
    }
    try {
      const res = await axios.post("/auth/signup", { name, email, password });
      set({ user: res.data.user, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || "An error occurred");
    }
  },
  googleAuth: async (code) => {
    try {
      const res = await axios.get(`/auth/login/google?code=${code}`);
      set({ user: res.data });
      toast.success("Logged in with Google successfully");
    } catch (error) {
      toast.error("Google login failed");
      console.error("Google Login Error:", error);
    }
  },
  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/login", { email, password });
      set({ user: res.data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || "An error occurred");
    }
  },
  sendCode: async (email) => {
    try {
      const res = await axios.post("/auth/send-code", { email });
      toast.success(res.data.message || "Code sent successfully via Mail");
      return res.data.code; // Temporarily return for client-side check
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send code");
      throw error;
    }
  },
  sendCodeForgot: async (email) => {
    try {
      const res = await axios.post("/auth/send-code-forgot", { email });
      toast.success(res.data.message || "Code sent successfully");
      return res.data.code;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send code");
      throw error;
    }
  },

  verifyCode: async (email, enteredCode) => {
    try {
      const res = await axios.post("/auth/verify-code", { email, code: enteredCode });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid verification code");
      throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout");
      set({ user: null });
      toast.success("Logout successful");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred during logout"
      );
    }
  },
  getAllUsers: async () => {
    try {
      const res = await axios.get("/auth");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },
  deleteUser: async (id) => {
    try {
      const res = await axios.delete(`/auth/${id}`);
      return res;
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },
  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axios.get("/auth/profile");
      set({ user: response.data, checkingAuth: false });
    } catch (error) {
      console.log(error.message);
      set({ checkingAuth: false, user: null });
    }
  },

  refreshToken: async () => {
    // Prevent multiple simultaneous refresh attempts
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try {
      const response = await axios.post("/auth/referesh-token");
      set({ checkingAuth: false });
      return response.data;
    } catch (error) {
      set({ user: null, checkingAuth: false });
      throw error;
    }
  },
  resetPassword: async (email, password) => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      const response = await axios.post("/auth/reset-password", {
        email,
        password,
      });
      toast.success(response.data.message || "Password reset successful");
      return true;
    } catch (error) {
      console.error("Reset Password Error:", error);
      toast.error(error.response?.data?.message || "An error occurred while resetting the password");
      return false;
    }
  },

}));

// TODO: Implement the axios interceptors for refreshing access token

// Axios interceptor for token refresh
let refreshPromise = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // If a refresh is already in progress, wait for it to complete
        if (refreshPromise) {
          await refreshPromise;
          return axios(originalRequest);
        }

        // Start a new refresh process
        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login or handle as needed
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
