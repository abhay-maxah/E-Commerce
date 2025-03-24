import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useOrderStore = create((set) => ({
    orders: [],
    loading: false,

    // Fetch orders for a user
    fetchOrdersForUser: async (userId) => {
        if (!userId) return toast.error("User ID is required");

        set({ loading: true });
        try {
            const res = await axios.get(`/orders/${userId}`);
            set({ orders: res.data, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },
    fetchOrdersForAdmin: async () => {
        set({ loading: true });
        try {
            const res = await axios.get("/orders/all-order");
            console.log(res.data)
            set({ orders: res.data, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "An error occurred while fetching orders");
        }
    },    
    updateStatus: async (orderId, status) => {
        try {
            await axios.put(`/orders/${orderId}/status`, { status });
            toast.success("Order status updated successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating order status");
        }
    },
    
    // Download invoice
    downloadInvoice: async (orderId) => {
        try {
            const response = await axios.get(`/orders/${orderId}/invoice`, {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `invoice-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            toast.error("Error downloading invoice");
        }
    },
}));
