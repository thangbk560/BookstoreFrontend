"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu, User, X } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "../ui/Button";
import { useState } from "react";
import { useCart } from "@/lib/store/cartStore";

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { items } = useCart();

    const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="sticky top-0 z-50 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-sm border-b border-light-border dark:border-dark-border">
            <div className="container mx-auto">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">B</span>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            BookStore
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-light-text-primary dark:text-dark-text-primary hover:text-primary transition-colors">
                            Trang chủ
                        </Link>
                        <Link href="/categories" className="text-light-text-primary dark:text-dark-text-primary hover:text-primary transition-colors">
                            Danh mục
                        </Link>
                        <Link href="/books" className="text-light-text-primary dark:text-dark-text-primary hover:text-primary transition-colors">
                            Tất cả sách
                        </Link>
                        <Link href="/about" className="text-light-text-primary dark:text-dark-text-primary hover:text-primary transition-colors">
                            Giới thiệu
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Search and Submit */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const query = formData.get('search') as string;
                                if (query.trim()) {
                                    window.location.href = `/books?search=${encodeURIComponent(query)}`;
                                }
                            }}
                            className="flex items-center gap-2"
                        >
                            <div className="relative w-56">
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Tìm kiếm sách..."
                                    className="w-full pl-4 pr-10 py-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary text-light-text-primary dark:text-dark-text-primary"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-0 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>
                        </form>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Cart */}
                        <Link href="/cart" className="relative">
                            <button className="p-2 rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors">
                                <ShoppingCart className="w-5 h-5" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                )}
                            </button>
                        </Link>

                        {/* User Menu */}
                        <Link href="/dashboard">
                            <button className="hidden md:flex p-2 rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors">
                                <User className="w-5 h-5" />
                            </button>
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-light-border dark:border-dark-border">
                        <nav className="flex flex-col space-y-4">
                            <Link href="/" className="text-light-text-primary dark:text-dark-text-primary hover:text-primary transition-colors">
                                Trang chủ
                            </Link>
                            <Link href="/categories" className="text-light-text-primary dark:text-dark-text-primary hover:text-primary transition-colors">
                                Danh mục
                            </Link>
                            <Link href="/books" className="text-light-text-primary dark:text-dark-text-primary hover:text-primary transition-colors">
                                Tất cả sách
                            </Link>
                            <Link href="/about" className="text-light-text-primary dark:text-dark-text-primary hover:text-primary transition-colors">
                                Giới thiệu
                            </Link>
                            <Link href="/dashboard" className="text-light-text-primary dark:text-dark-text-primary hover:text-primary transition-colors">
                                Tài khoản
                            </Link>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
