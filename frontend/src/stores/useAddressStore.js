import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useAddressStore = create((set, get) => ({
    addresses: [],
    loading: false,

    // Fetch all addresses
    getAllAddresses: async () => {
        set({ loading: true });
        try {
            const res = await axios.get("/address");
            set({ addresses: res.data, loading: false });
            toast.success("Addresses fetched successfully");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

    // Add new address
    addAddress: async (address) => {
        set({ loading: true });
        try {
            const res = await axios.post("/address", address);
            set((state) => ({ 
                addresses: [...state.addresses, res.data], // ✅ Append new address
                loading: false
            }));
            toast.success("Address added successfully");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

    // Delete an address
    deleteAddress: async (id) => {
        set({ loading: true });
        try {
            await axios.delete(`/address/${id}`);
            set((state) => ({
                addresses: state.addresses.filter(addr => addr.id !== id), // ✅ Remove deleted address
                loading: false
            }));
            toast.success("Address deleted successfully");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

    // Update an address
    updateAddress: async (id, updatedAddress) => {
        set({ loading: true });
        try {
            const res = await axios.put(`/address/${id}`, updatedAddress);
            set((state) => ({
                addresses: state.addresses.map(addr => addr.id === id ? res.data : addr), // ✅ Update existing address
                loading: false
            }));
            toast.success("Address updated successfully");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },
}));
