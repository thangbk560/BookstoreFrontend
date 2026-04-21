import apiClient from "./client";

export const ordersApi = {
    createOrder: async (orderData: any) => {
        const response = await apiClient.post("/orders", orderData);
        return response.data;
    },

    getMyOrders: async () => {
        const response = await apiClient.get("/orders/my-orders");
        return response.data;
    },

    getOrderById: async (orderId: string) => {
        const response = await apiClient.get(`/orders/${orderId}`);
        return response.data;
    },

    cancelOrder: async (orderId: string) => {
        const response = await apiClient.patch(`/orders/${orderId}/cancel`);
        return response.data;
    },

    getAllOrders: async () => {
        const response = await apiClient.get("/orders/admin/all");
        return response.data;
    },

    updateOrderStatus: async (orderId: string, status: string) => {
        const response = await apiClient.patch(`/orders/${orderId}/status`, {
            status,
        });
        return response.data;
    },
};
