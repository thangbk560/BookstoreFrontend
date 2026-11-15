import apiClient from "./client";

export const reviewsApi = {
    createReview: async (bookId: string, rating: number, comment: string) => {
        const response = await apiClient.post("/api/reviews", {
            bookId,
            rating,
            comment,
        });
        return response.data;
    },

    getBookReviews: async (bookId: string) => {
        const response = await apiClient.get(`/api/reviews/book/${bookId}`);
        return response.data;
    },

    getMyReviews: async () => {
        const response = await apiClient.get("/api/reviews/my-reviews");
        return response.data;
    },

    deleteReview: async (reviewId: string) => {
        const response = await apiClient.delete(`/api/reviews/${reviewId}`);
        return response.data;
    },
};
