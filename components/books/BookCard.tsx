"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/store/cartStore";

interface Book {
    _id: string;
    title: string;
    author: string;
    price: number;
    images?: string[];
    rating?: number;
    soldCount?: number;
    slug?: string;
}

interface BookCardProps {
    book: Book;
    index?: number;
    action?: React.ReactNode;
}

export function BookCard({ book, index = 0, action }: BookCardProps) {
    const { addItem } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem({
            id: book._id,
            title: book.title,
            author: book.author,
            price: book.price,
            image: book.images?.[0] || "",
        });
    };

    return (
        <Link href={`/books/${book._id}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="h-full"
            >
                <Card hover className="overflow-hidden h-full flex flex-col bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="p-4 flex items-center justify-center bg-white dark:bg-dark-surface">
                        <div className="relative w-full aspect-[1/1.2]">
                            {book.images && book.images[0] ? (
                                <img
                                    src={book.images[0]}
                                    alt={book.title}
                                    className="absolute inset-0 w-full h-full object-contain"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gray-50 dark:bg-gray-800 rounded">
                                    📖
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-3 flex flex-col flex-grow">
                        {/* Title - Shortened to 1 line */}
                        <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1 line-clamp-1" title={book.title}>
                            {book.title}
                        </h3>

                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center text-yellow-400">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="text-xs ml-0.5 text-gray-600 dark:text-gray-400">{book.rating || 0}</span>
                            </div>
                            <span className="text-xs text-gray-400">|</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Đã bán {book.soldCount || 0}</span>
                        </div>

                        <div className="mt-auto">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-base font-bold text-red-600 dark:text-red-400">
                                    {book.price.toLocaleString('vi-VN')} ₫
                                </span>
                            </div>
                            {action ? action : (
                                <Button
                                    size="sm"
                                    className="w-full text-xs py-1.5"
                                    onClick={handleAddToCart}
                                >
                                    Thêm vào giỏ
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            </motion.div>
        </Link>
    );
}
