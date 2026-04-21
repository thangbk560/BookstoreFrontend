import apiClient from "./client";

export const favoritesApi = {
    getFavorites: async () => {
        const response = await apiClient.get("/users/favorites");
        return response.data;
    },

    addToFavorites: async (bookId: string) => {
        const response = await apiClient.post(`/users/favorites/${bookId}`);
        return response.data;
    },

    removeFromFavorites: async (bookId: string) => {
        const response = await apiClient.delete(`/users/favorites/${bookId}`);
        return response.data;
    },
};
