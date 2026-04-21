"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";

export function Footer() {

    return (
        <footer className="bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border mt-20">
            <div className="container mx-auto py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">B</span>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                BookStore
                            </span>
                        </div>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
                            Về công ty - Dịch vụ khách hàng
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-light-text-tertiary hover:text-primary transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-light-text-tertiary hover:text-primary transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-light-text-tertiary hover:text-primary transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-light-text-tertiary hover:text-primary transition-colors">
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                            Liên kết nhanh
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    Về chúng tôi
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    Liên hệ
                                </Link>
                            </li>
                            <li>
                                <Link href="/shipping" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    Phí vận chuyển
                                </Link>
                            </li>
                            <li>
                                <Link href="/returns" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    Chính sách đổi trả
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                            Danh mục
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/categories/van-hoc" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    Văn học
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories/kinh-te" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    Kinh tế
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories/ky-nang-song" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    Kỹ năng sống
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories/thieu-nhi" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    Thiếu nhi
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                            Đăng ký nhận tin
                        </h3>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-4">
                            Đăng ký để nhận tin tức và ưu đãi mới nhất
                        </p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Email"
                                className="flex-1 px-4 py-2 rounded-l-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                            <button className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-r-lg transition-colors">
                                <Mail className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-light-border dark:border-dark-border">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">
                            © 2025 Bookstore. Tất cả quyền được bảo lưu.
                        </p>
                        <div className="flex space-x-6 text-sm">
                            <Link href="/privacy" className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-primary transition-colors">
                                Chính sách bảo mật
                            </Link>
                            <Link href="/terms" className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-primary transition-colors">
                                Điều khoản dịch vụ
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                                Phương thức thanh toán:
                            </span>

                            <div className="flex space-x-2">
                                {/* VNPay logo */}
                                <img
                                    src="vnpay.png"
                                    alt="VNPay"
                                    className="h-8 object-contain"
                                />

                                {/* MoMo logo */}
                                <img
                                    src="momo.png"
                                    alt="MoMo"
                                    className="h-8 object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
