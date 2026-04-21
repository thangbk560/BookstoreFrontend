"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Star, SlidersHorizontal } from "lucide-react";
import { BookCard } from "@/components/books/BookCard";

interface Book {
    _id: string;
    title: string;
    author: string;
    price: number;
    rating: number;
    images: string[];
    category: string;
    inStock: boolean;
    soldCount?: number;
}

interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
}

export default function CategoryPage() {
    const params = useParams();
    const [books, setBooks] = useState<Book[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("-rating");
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(1000000);
    const [minRating, setMinRating] = useState(0);

    const slug = typeof params.slug === 'string' ? params.slug : '';

    useEffect(() => {
        fetchCategoryAndBooks();
    }, [slug, sortBy]);

    const fetchCategoryAndBooks = async () => {
        try {
            setLoading(true);

            // Fetch category details
            const categoryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/slug/${slug}`);
            if (categoryResponse.ok) {
                const categoryData = await categoryResponse.json();
                setCategory(categoryData);

                // Fetch books by category name
                const booksResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/books?category=${encodeURIComponent(categoryData.name)}&sortBy=${sortBy}`
                );
                if (booksResponse.ok) {
                    const booksData = await booksResponse.json();
                    setBooks(booksData.books || booksData);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };



    // Filter books based on price and rating
    const filteredBooks = books.filter(book => {
        const priceInRange = book.price >= minPrice && book.price <= maxPrice;
        const ratingMatch = book.rating >= minRating;
        return priceInRange && ratingMatch;
    });

    const categoryName = category?.name || (typeof params.slug === 'string'
        ? params.slug.charAt(0).toUpperCase() + params.slug.slice(1).replace(/-/g, ' ')
        : 'Books');

    return (
        <div className="min-h-screen">
            <Header />

            <div className="container mx-auto py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-light-text-tertiary dark:text-dark-text-tertiary mb-6">
                    <Link href="/" className="hover:text-primary">Trang chủ</Link>
                    <span>/</span>
                    <Link href="/categories" className="hover:text-primary">Danh mục</Link>
                    <span>/</span>
                    <span className="text-light-text-primary dark:text-dark-text-primary font-medium">{categoryName}</span>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                        {categoryName}
                    </h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                        {category?.description || 'Khám phá những cuốn sách tuyệt vời trong danh mục này'}
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-1">
                        <Card className="p-6 sticky top-24">
                            <div className="flex items-center gap-2 mb-6">
                                <SlidersHorizontal className="w-5 h-5" />
                                <h2 className="font-bold text-lg">Bộ lọc</h2>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <h3 className="font-semibold mb-3">Giá</h3>
                                <div className="space-y-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000000"
                                        step="10000"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        <span>{minPrice.toLocaleString('vi-VN')} ₫</span>
                                        <span>{maxPrice.toLocaleString('vi-VN')} ₫</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rating Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold mb-3">Đánh giá</h3>
                                <div className="space-y-2">
                                    {[5, 4, 3].map((rating) => (
                                        <label key={rating} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="rating"
                                                checked={minRating === rating}
                                                onChange={() => setMinRating(rating)}
                                                className="rounded"
                                            />
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: rating }).map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                                                ))}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setMinPrice(0);
                                    setMaxPrice(1000000);
                                    setMinRating(0);
                                }}
                            >
                                Xóa bộ lọc
                            </Button>
                        </Card>
                    </aside>

                    {/* Books Grid */}
                    <div className="lg:col-span-3">
                        {/* Sort Options */}
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-light-text-secondary dark:text-dark-text-secondary">
                                Hiển thị kết quả {filteredBooks.length}
                            </p>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-surface dark:bg-dark-surface"
                            >
                                <option value="-rating">Đánh giá</option>
                                <option value="price">Giá: Thấp đến cao</option>
                                <option value="-price">Giá: Cao đến thấp</option>
                                <option value="title">Tên sách</option>
                                <option value="-publishDate">Mới nhất</option>
                            </select>
                        </div>

                        {/* Books Grid */}
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="text-2xl text-light-text-secondary dark:text-dark-text-secondary">
                                    Đang tải sách...
                                </div>
                            </div>
                        ) : filteredBooks.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="text-2xl text-light-text-secondary dark:text-dark-text-secondary">
                                    Không tìm thấy sách
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredBooks.map((book) => (
                                    <BookCard key={book._id} book={book} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
