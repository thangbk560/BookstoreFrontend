"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight } from "lucide-react";

interface Category {
    _id: string;
    name: string;
    slug: string;
    description: string;
    bookCount: number;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:3001/api/categories");

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    // Emoji mapping for categories
    const getCategoryIcon = (name: string) => {
        const iconMap: { [key: string]: string } = {
            "Văn học": "📚",
            "Kinh tế": "💼",
            "Kỹ năng sống": "🌟",
            "Thiếu nhi": "🧸",
            "Lịch sử": "📜",
        };
        return iconMap[name] || "📖";
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
                            Khám phá sách được sắp xếp theo thể loại yêu thích của bạn
                        </h1>
                    </motion.div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <div className="text-light-text-secondary dark:text-dark-text-secondary">
                                Đang tải danh mục...
                            </div>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-2xl text-light-text-secondary dark:text-dark-text-secondary mb-4">
                                Không tìm thấy danh mục
                            </div>
                            <p className="text-light-text-tertiary dark:text-dark-text-tertiary">
                                Danh mục sẽ xuất hiện ở đây khi chúng được thêm vào cơ sở dữ liệu
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                {categories.length} danh mục có sẵn
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {categories.map((category, index) => (
                                    <Link key={category._id} href={`/categories/${category.slug}`}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="h-full"
                                        >
                                            <Card hover className="p-6 h-full flex flex-col">
                                                <div className="flex flex-col items-center text-center flex-grow">
                                                    <div className="text-6xl mb-4">
                                                        {getCategoryIcon(category.name)}
                                                    </div>
                                                    <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                                                        {category.name}
                                                    </h3>
                                                    {category.description && (
                                                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4 line-clamp-2">
                                                            {category.description}
                                                        </p>
                                                    )}
                                                    <div className="mt-auto w-full">
                                                        <div className="flex items-center justify-center gap-2 text-primary mb-4">
                                                            <BookOpen className="w-4 h-4" />
                                                            <span className="font-semibold">
                                                                {category.bookCount || 0} sách
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-center gap-1 text-sm text-primary font-semibold hover:gap-2 transition-all">
                                                            Khám phá
                                                            <ArrowRight className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-white dark:bg-dark-surface border-t dark:border-dark-border">
                <div className="container mx-auto text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                            Không tìm thấy những gì bạn đang tìm kiếm?
                        </h2>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8 max-w-2xl mx-auto">
                            Duyệt qua tất cả sách hoặc sử dụng tính năng tìm kiếm để tìm chính xác những gì bạn cần
                        </p>
                        <Link
                            href="/books"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors shadow-lg shadow-primary/30"
                        >
                            Xem tất cả sách
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
