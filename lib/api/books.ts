import apiClient from "./client";

export interface Book {
    id: string;
    title: string;
    author: string;
    description: string;
    price: number;
    category: string;
    isbn: string;
    pages: number;
    language: string;
    publisher: string;
    publishDate: string;
    inStock: boolean;
    rating: number;
    reviewCount: number;
    soldCount: number;
    image: string;
}

export const bookApi = {
    getBooks: async (params?: {
        category?: string;
        search?: string;
        sortBy?: string;
        page?: number;
        limit?: number;
    }) => {
        const response = await apiClient.get("/books", { params });
        return response.data;
    },

    getBookById: async (id: string) => {
        const response = await apiClient.get(`/books/${id}`);
        return response.data;
    },

    searchBooks: async (query: string) => {
        const response = await apiClient.get("/books/search", {
            params: { q: query },
        });
        return response.data;
    },

    // Admin endpoints
    createBook: async (bookData: Partial<Book>) => {
        const response = await apiClient.post("/books", bookData);
        return response.data;
    },

    updateBook: async (id: string, bookData: Partial<Book>) => {
        const response = await apiClient.put(`/books/${id}`, bookData);
        return response.data;
    },

    deleteBook: async (id: string) => {
        const response = await apiClient.delete(`/books/${id}`);
        return response.data;
    },
};
