import apiClient from "./client";

export const favoritesApi = {
    getFavorites: async () => {
        const response = await apiClient.get("/api/users/favorites");
        return response.data;
    },

    addToFavorites: async (bookId: string) => {
        const response = await apiClient.post(`/api/users/favorites/${bookId}`);
        return response.data;
    },

    removeFromFavorites: async (bookId: string) => {
        const response = await apiClient.delete(`/api/users/favorites/${bookId}`);
        return response.data;
    },
};
