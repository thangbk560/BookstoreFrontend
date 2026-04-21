import apiClient from "./client";

export const promoCodesApi = {
    validate: async (code: string, orderValue: number) => {
        const response = await apiClient.get(`/promo-codes/validate?code=${code}&orderValue=${orderValue}`);
        return response.data;
    },
    getAll: async () => {
        const response = await apiClient.get('/promo-codes');
        return response.data;
    },
    create: async (data: any) => {
        const response = await apiClient.post('/promo-codes', data);
        return response.data;
    },
    delete: async (id: string) => {
        // Note: The backend controller doesn't seem to have a delete endpoint yet based on previous context.
        // I should check the backend controller first or implement it if missing.
        // Checking the plan, I only implemented create, findAll, validate in backend.
        // I need to add delete/deactivate to backend controller first if I want to use it.
        // For now, I'll add the method but it might fail if backend isn't ready.
        // Wait, the plan says "Implement Delete/Deactivate Promo Code" in task.md.
        // I should check the backend controller again.
        // Assuming I'll implement backend delete next.
        // actually, let's stick to what's in the backend for now or update backend first.
        // The backend controller I wrote has: create, findAll, validate.
        // I need to update backend controller to support delete/deactivate.
        // Let's update the API client assuming the backend will be updated.
        const response = await apiClient.delete(`/promo-codes/${id}`);
        return response.data;
    }
};
