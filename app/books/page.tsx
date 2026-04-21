"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { BookCard } from "@/components/books/BookCard";
import { motion } from "framer-motion";

interface Book {
    _id: string;
    title: string;
    author: string;
    description: string;
    price: number;
    category: string;
    rating: number;
    reviewCount: number;
    images: string[];
    inStock: boolean;
    slug: string;
    soldCount?: number;
}

function BooksContent() {
    const searchParams = useSearchParams();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("title");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);

    const searchQuery = searchParams.get('search');

    useEffect(() => {
        // Reset to page 1 when filters change
        setCurrentPage(1);
    }, [selectedCategory, sortBy, searchQuery]);

    useEffect(() => {
        fetchBooks();
    }, [currentPage, selectedCategory, sortBy, searchQuery]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (searchQuery) {
                params.append("search", searchQuery);
            } else if (selectedCategory !== "all") {
                params.append("category", selectedCategory);
            }

            params.append("sortBy", sortBy);
            params.append("page", currentPage.toString());
            params.append("limit", "20"); // Increased limit since cards are smaller

            const response = await fetch(
                `http://localhost:3001/api/books?${params.toString()}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setBooks(data.books || data);

            // Update pagination data
            if (data.pagination) {
                setTotalPages(data.pagination.totalPages);
                setTotal(data.pagination.total);
            }
        } catch (error) {
            console.error("Error fetching books:", error);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        "all",
        "Văn học",
        "Kinh tế",
        "Kỹ năng sống",
        "Thiếu nhi",
        "Lịch sử",
    ];

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        scrollToTop();
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };



    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />

            {/* Page Header */}
            <section className="bg-white dark:bg-dark-surface border-b dark:border-dark-border py-8">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-2xl md:text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                            {searchQuery ? `Tìm kiếm: "${searchQuery}"` : 'Khám phá bộ sưu tập của chúng tôi'}
                        </h1>
                    </motion.div>
                </div>
            </section>

            {/* Filters */}
            <section className="py-4 bg-white dark:bg-dark-surface border-b dark:border-dark-border sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
                            <span className="font-semibold text-sm text-light-text-primary dark:text-dark-text-primary">
                                Danh mục:
                            </span>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedCategory === category
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 dark:bg-gray-800 text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    {category === "all" ? ('Tất cả') : category}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-light-text-primary dark:text-dark-text-primary">
                                Sắp xếp theo:
                            </span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-light-text-primary dark:text-dark-text-primary border-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="title">Tên sách</option>
                                <option value="price">Giá thấp đến cao</option>
                                <option value="-price">Giá cao đến thấp</option>
                                <option value="-rating">Đánh giá cao nhất</option>
                                <option value="-publishDate">Mới nhất</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Books Grid */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
                                Đang tải sách...
                            </div>
                        </div>
                    ) : books.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
                                Không tìm thấy sách
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {books.map((book, index) => (
                                    <BookCard key={book._id} book={book} index={index} />
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4"
                                >
                                    {/* Page info */}
                                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        Hiển thị {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, total)} trong {total} sách
                                    </div>

                                    {/* Pagination buttons */}
                                    <div className="flex items-center gap-2">
                                        {/* Previous button */}
                                        <Button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            variant="outline"
                                            className="px-3 py-2"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                            <span className="hidden sm:inline ml-1">Trước</span>
                                        </Button>

                                        {/* Page numbers */}
                                        <div className="flex items-center gap-1">
                                            {getPageNumbers().map((page, index) => (
                                                page === '...' ? (
                                                    <span
                                                        key={`ellipsis-${index}`}
                                                        className="px-3 py-2 text-light-text-tertiary dark:text-dark-text-tertiary"
                                                    >
                                                        ...
                                                    </span>
                                                ) : (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page as number)}
                                                        className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-colors ${currentPage === page
                                                            ? 'bg-primary text-white'
                                                            : 'bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary hover:bg-primary/10'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            ))}
                                        </div>

                                        {/* Next button */}
                                        <Button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            variant="outline"
                                            className="px-3 py-2"
                                        >
                                            <span className="hidden sm:inline mr-1">Tiếp</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default function AllBooksPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                        Đang tải...
                    </p>
                </div>
            </div>
        }>
            <BooksContent />
        </Suspense>
    );
}
