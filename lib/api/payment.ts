import apiClient from "./client";

export interface PaymentRequest {
    orderId: string;
    amount: number;
    returnUrl: string;
}

export const paymentApi = {
    createVNPayPayment: async (data: PaymentRequest) => {
        const response = await apiClient.post("/payment/vnpay/create", data);
        return response.data;
    },

    createMomoPayment: async (data: PaymentRequest) => {
        const response = await apiClient.post("/payment/momo/create", data);
        return response.data;
    },

    verifyPayment: async (provider: "vnpay" | "momo", params: any) => {
        const response = await apiClient.post(`/payment/${provider}/verify`, params);
        return response.data;
    },
};
