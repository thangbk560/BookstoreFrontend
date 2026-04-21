import apiClient from "./client";

export interface UpdateProfileData {
    name?: string;
    email?: string;
    phone?: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

export interface Address {
    _id?: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    isDefault?: boolean;
}

export const usersApi = {
    getProfile: async () => {
        const response = await apiClient.get("/users/profile");
        return response.data;
    },

    updateProfile: async (data: UpdateProfileData) => {
        const response = await apiClient.put("/users/profile", data);
        return response.data;
    },

    changePassword: async (data: ChangePasswordData) => {
        const response = await apiClient.post("/users/change-password", data);
        return response.data;
    },

    getAddresses: async () => {
        const response = await apiClient.get("/users/addresses");
        return response.data;
    },

    addAddress: async (data: Address) => {
        const response = await apiClient.post("/users/addresses", data);
        return response.data;
    },

    updateAddress: async (id: string, data: Address) => {
        const response = await apiClient.put(`/users/addresses/${id}`, data);
        return response.data;
    },

    deleteAddress: async (id: string) => {
        const response = await apiClient.delete(`/users/addresses/${id}`);
        return response.data;
    },

    setDefaultAddress: async (id: string) => {
        const response = await apiClient.put(`/users/addresses/${id}/default`, {});
        return response.data;
    }
};
