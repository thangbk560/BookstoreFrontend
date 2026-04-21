"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, TrendingUp, Award, Truck } from "lucide-react";
import { BookCard } from "@/components/books/BookCard";
import { motion } from "framer-motion";

interface Book {
  _id: string;
  title: string;
  author: string;
  price: number;
  images?: string[];
  rating: number;
  reviewCount?: number;
  soldCount?: number;
  category: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  bookCount?: number;
}

export default function HomePage() {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch featured books - limit to 5
        const booksResponse = await fetch('http://localhost:3001/api/books?limit=5&sortBy=-rating');
        if (!booksResponse.ok) {
          throw new Error(`HTTP error! status: ${booksResponse.status}`);
        }
        const booksData = await booksResponse.json();
        setFeaturedBooks(booksData.books || booksData);

        // Fetch categories
        const categoriesResponse = await fetch('http://localhost:3001/api/categories');
        if (!categoriesResponse.ok) {
          throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.slice(0, 6)); // Limit to 6 categories
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent dark:from-primary/20 dark:via-secondary/10 py-20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6 leading-tight">
                Khám phá cuốn sách yêu thích tiếp theo của bạn
              </h1>
              <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary mb-8">
                Hàng nghìn cuốn sách thuộc mọi thể loại. Giao hàng nhanh với thanh toán VNPay và Momo bảo mật.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/books">
                  <Button size="lg" className="w-full sm:w-auto">
                    Xem sách <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Xem danh mục
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div>
                  <div className="text-3xl font-bold text-primary">50K+</div>
                  <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">Sách</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-secondary">25K+</div>
                  <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">Khách hàng</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">4.9</div>
                  <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">Đánh giá</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">📚</div>
                  <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    Bộ sưu tập cao cấp
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
              Danh mục
            </h2>
            <Link href="/categories" className="text-primary hover:text-primary-600 font-semibold flex items-center">
              Xem tất cả <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="text-light-text-secondary dark:text-dark-text-secondary">Đang tải...</div>
              </div>
            ) : (
              categories.map((category, index) => {
                let categoryIcon = "📚";
                switch (category.slug) {
                  case "kinh-te":
                    categoryIcon = "💼";
                    break;
                  case "ky-nang-song":
                    categoryIcon = "🌟";
                    break;
                  case "thieu-nhi":
                    categoryIcon = "🧸";
                    break;
                  case "lich-su":
                    categoryIcon = "📜";
                    break;
                  default:
                    categoryIcon = "📚";
                }

                return (
                  <Link key={category._id} href={`/categories/${category.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card hover className="p-6 text-center cursor-pointer">
                        <div className="text-4xl mb-3">{categoryIcon}</div>
                        <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">
                          {category.name}
                        </h3>
                        <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                          {category.bookCount || 0} Sách
                        </p>
                      </Card>
                    </motion.div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16 bg-light-bg dark:bg-dark-bg">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                Sách nổi bật
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Lựa chọn tuyển chọn cho bạn
              </p>
            </div>
            <Link href="/books" className="text-primary hover:text-primary-600 font-semibold flex items-center">
              Xem tất cả <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="text-light-text-secondary dark:text-dark-text-secondary">Đang tải...</div>
              </div>
            ) : (
              featuredBooks.map((book, index) => (
                <BookCard key={book._id} book={book} index={index} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Giao hàng nhanh</h3>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Miễn phí vận chuyển cho đơn hàng trên 500.000đ
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Chất lượng cao cấp</h3>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Bộ sưu tập sách hay nhất được tuyển chọn
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Thanh toán an toàn</h3>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Tích hợp VNPay và Momo
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
