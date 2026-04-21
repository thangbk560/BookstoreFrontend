"use client";

import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/store/cartStore";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Star, ShoppingCart, Heart, Share2, Check, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BookCard } from "@/components/books/BookCard";
import { bookApi } from "@/lib/api/books";
import { favoritesApi } from "@/lib/api/favorites";
import { reviewsApi } from "@/lib/api/reviews";

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const [book, setBook] = useState<any>(null);
    const [relatedBooks, setRelatedBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoritesLoading, setFavoritesLoading] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
    const [submittingReview, setSubmittingReview] = useState(false);
    const { addItem } = useCart();

    useEffect(() => {
        if (params.id) {
            fetchBookDetails();
        }
    }, [params.id]);

    useEffect(() => {
        if (isAuthenticated && book) {
            checkIfFavorite();
        }
    }, [isAuthenticated, book]);

    useEffect(() => {
        if (book) {
            fetchReviews();
        }
    }, [book]);

    const fetchBookDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const bookData = await bookApi.getBookById(params.id as string);
            setBook(bookData);

            // Fetch related books from the same category
            if (bookData.category) {
                const categorySlug = typeof bookData.category === 'string'
                    ? bookData.category
                    : bookData.category.slug;
                const booksResponse = await bookApi.getBooks({
                    category: categorySlug,
                    limit: 4
                });
                const filteredBooks = booksResponse.books?.filter((b: any) => b._id !== bookData._id) || [];
                setRelatedBooks(filteredBooks.slice(0, 4));
            }
        } catch (err) {
            console.error("Error fetching book:", err);
            setError("Không thể tải thông tin sách");
        } finally {
            setLoading(false);
        }
    };

    const checkIfFavorite = async () => {
        try {
            const favorites = await favoritesApi.getFavorites();
            const isFav = favorites.some((fav: any) => fav._id === book._id);
            setIsFavorite(isFav);
        } catch (error) {
            console.error("Error checking favorites:", error);
        }
    };

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }

        try {
            setFavoritesLoading(true);
            if (isFavorite) {
                await favoritesApi.removeFromFavorites(book._id);
                setIsFavorite(false);
            } else {
                await favoritesApi.addToFavorites(book._id);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        } finally {
            setFavoritesLoading(false);
        }
    };

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addItem({
                id: book._id,
                title: book.title,
                author: book.author,
                price: book.price,
                image: book.images?.[0] || book.image,
            });
        }
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: book.title,
                    text: `Check out "${book.title}" by ${book.author}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    const fetchReviews = async () => {
        try {
            setReviewsLoading(true);
            const reviewsData = await reviewsApi.getBookReviews(params.id as string);
            setReviews(reviewsData);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }

        try {
            setSubmittingReview(true);
            await reviewsApi.createReview(book._id, reviewForm.rating, reviewForm.comment);
            setReviewForm({ rating: 5, comment: "" });
            setShowReviewForm(false);
            await fetchReviews();
            await fetchBookDetails(); // Refresh book to get updated rating
        } catch (error: any) {
            alert(error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá");
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
        try {
            await reviewsApi.deleteReview(reviewId);
            await fetchReviews();
            await fetchBookDetails();
        } catch (error) {
            alert("Có lỗi xảy ra khi xóa đánh giá");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />

            <div className="container mx-auto py-8 px-4">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">Đang tải...</p>
                    </div>
                ) : error || !book ? (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h2>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                            {error || "Không tìm thấy sách"}
                        </p>
                        <Button onClick={() => router.push("/books")}>Quay lại danh sách sách</Button>
                    </div>
                ) : (
                    <>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-light-text-tertiary dark:text-dark-text-tertiary mb-4 bg-white dark:bg-dark-surface p-3 rounded-lg shadow-sm">
                            <Link href="/" className="hover:text-primary">Trang chủ</Link>
                            <span>/</span>
                            <Link href={`/categories/${typeof book.category === 'string' ? book.category : book.category.slug}`} className="hover:text-primary">
                                {typeof book.category === 'string' ? book.category : book.category.name}
                            </Link>
                            <span>/</span>
                            <span className="text-light-text-primary dark:text-dark-text-primary font-medium truncate max-w-[200px]">{book.title}</span>
                        </div>

                        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                {/* Left Column: Images (5 cols) */}
                                <div className="md:col-span-5">
                                    <div className="sticky top-24">
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 flex items-center justify-center bg-white">
                                            <div className="relative w-full aspect-[1/1.2]">
                                                {book.images && book.images.length > 0 ? (
                                                    <img
                                                        src={book.images[0]}
                                                        alt={book.title}
                                                        className="absolute inset-0 w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-6xl bg-gray-50">📖</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {book.images?.map((img: string, idx: number) => (
                                                <div key={idx} className="w-20 h-20 border border-gray-200 dark:border-gray-700 rounded cursor-pointer hover:border-primary p-1">
                                                    <img src={img} alt="" className="w-full h-full object-contain" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-4 mt-6">
                                            <Button
                                                variant="outline"
                                                className="flex-1 gap-2"
                                                onClick={handleToggleFavorite}
                                                disabled={favoritesLoading}
                                            >
                                                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                                                {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
                                            </Button>
                                            <Button variant="outline" className="flex-1 gap-2" onClick={handleShare}>
                                                <Share2 className="w-5 h-5" />
                                                Chia sẻ
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Info (7 cols) */}
                                <div className="md:col-span-7">
                                    <h1 className="text-2xl md:text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4 leading-tight">
                                        {book.title}
                                    </h1>

                                    <div className="grid grid-cols-2 gap-y-2 text-sm mb-6">
                                        <div className="flex gap-2">
                                            <span className="text-gray-500">Nhà cung cấp:</span>
                                            <span className="font-medium text-primary hover:underline cursor-pointer">
                                                {book.publisher || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-gray-500">Tác giả:</span>
                                            <span className="font-medium">{book.author}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-gray-500">Nhà xuất bản:</span>
                                            <span className="font-medium">{book.publisher || 'N/A'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-gray-500">Hình thức bìa:</span>
                                            <span className="font-medium">Bìa Mềm</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < Math.floor(book.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                            <span className="text-yellow-400 font-bold ml-1">({book.reviewCount} đánh giá)</span>
                                        </div>
                                        <div className="h-4 w-px bg-gray-300"></div>
                                        <div className="text-gray-500">
                                            Đã bán <span className="text-gray-900 dark:text-gray-100 font-medium">{book.soldCount || 100}+</span>
                                        </div>
                                    </div>

                                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg mb-6 flex items-end gap-4">
                                        <span className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400">
                                            {book.price.toLocaleString('vi-VN')} ₫
                                        </span>
                                        <span className="text-gray-400 line-through mb-1 text-lg">
                                            {(book.price * 1.2).toLocaleString('vi-VN')} ₫
                                        </span>
                                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                                            -20%
                                        </span>
                                    </div>

                                    {/* Policy Mockup */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-sm">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-green-600 flex items-center gap-1">
                                                <Check className="w-4 h-4" /> Thời gian giao hàng
                                            </span>
                                            <span className="text-gray-500">Giao hàng nhanh chóng</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-green-600 flex items-center gap-1">
                                                <Check className="w-4 h-4" /> Chính sách đổi trả
                                            </span>
                                            <span className="text-gray-500">Đổi trả miễn phí toàn quốc</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-green-600 flex items-center gap-1">
                                                <Check className="w-4 h-4" /> Chính sách sỉ
                                            </span>
                                            <span className="text-gray-500">Mua số lượng lớn</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <div className="flex items-center gap-8 mb-6">
                                            <span className="font-semibold">Số lượng:</span>
                                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
                                                <button
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="px-4 py-1 font-semibold border-x border-gray-300 dark:border-gray-600 min-w-[3rem] text-center">
                                                    {quantity}
                                                </span>
                                                <button
                                                    onClick={() => setQuantity(quantity + 1)}
                                                    className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                onClick={handleAddToCart}
                                                disabled={!book.inStock}
                                                className="flex-1 border-primary text-primary hover:bg-primary/5 h-12 text-lg font-bold"
                                            >
                                                <ShoppingCart className="w-5 h-5 mr-2" />
                                                Thêm vào giỏ
                                            </Button>
                                            <Button
                                                size="lg"
                                                onClick={() => { handleAddToCart(); router.push('/cart'); }}
                                                disabled={!book.inStock}
                                                className="flex-1 bg-primary hover:bg-primary-600 text-white h-12 text-lg font-bold shadow-lg shadow-primary/30"
                                            >
                                                Mua ngay
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Details & Description */}
                        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-6 mb-8">
                            <h2 className="text-xl font-bold mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                                Thông tin chi tiết
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                <div className="md:col-span-12">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                                <td className="py-3 text-gray-500 w-48">Mã hàng</td>
                                                <td className="py-3 font-medium">{book._id.slice(-8).toUpperCase()}</td>
                                            </tr>
                                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                                <td className="py-3 text-gray-500">Tên Nhà Cung Cấp</td>
                                                <td className="py-3 font-medium text-primary">{book.publisher || 'N/A'}</td>
                                            </tr>
                                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                                <td className="py-3 text-gray-500">Tác giả</td>
                                                <td className="py-3 font-medium">{book.author}</td>
                                            </tr>
                                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                                <td className="py-3 text-gray-500">NXB</td>
                                                <td className="py-3 font-medium">{book.publisher || 'N/A'}</td>
                                            </tr>
                                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                                <td className="py-3 text-gray-500">Năm XB</td>
                                                <td className="py-3 font-medium">{book.publishDate || '2024'}</td>
                                            </tr>
                                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                                <td className="py-3 text-gray-500">Ngôn Ngữ</td>
                                                <td className="py-3 font-medium">{book.language || 'Tiếng Việt'}</td>
                                            </tr>
                                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                                <td className="py-3 text-gray-500">Trọng lượng (gr)</td>
                                                <td className="py-3 font-medium">300</td>
                                            </tr>
                                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                                <td className="py-3 text-gray-500">Số trang</td>
                                                <td className="py-3 font-medium">{book.pages}</td>
                                            </tr>
                                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                                <td className="py-3 text-gray-500">Hình thức</td>
                                                <td className="py-3 font-medium">Bìa Mềm</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold mb-4 mt-8 border-b border-gray-200 dark:border-gray-700 pb-2">
                                Mô tả sản phẩm
                            </h2>
                            <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                <p>{book.description}</p>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <section className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-6 mb-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Đánh giá sản phẩm</h2>
                                {isAuthenticated && !showReviewForm && (
                                    <Button onClick={() => setShowReviewForm(true)}>
                                        Viết đánh giá
                                    </Button>
                                )}
                            </div>

                            {/* Write Review Form */}
                            {showReviewForm && (
                                <form onSubmit={handleSubmitReview} className="mb-6 p-4 border border-light-border dark:border-dark-border rounded-lg">
                                    <h3 className="font-semibold mb-4">Viết đánh giá của bạn</h3>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2">Đánh giá *</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                    className="focus:outline-none"
                                                >
                                                    <Star
                                                        className={`w-8 h-8 ${star <= reviewForm.rating
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-gray-300"
                                                            }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2">Nhận xét *</label>
                                        <textarea
                                            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                            rows={4}
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            required
                                            placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách này..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={submittingReview}>
                                            {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowReviewForm(false);
                                                setReviewForm({ rating: 5, comment: "" });
                                            }}
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                    <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-2">
                                        * Bạn chỉ có thể viết tối đa 2 đánh giá cho mỗi sách đã mua
                                    </p>
                                </form>
                            )}

                            {/* Reviews List */}
                            {reviewsLoading ? (
                                <div className="text-center py-8">
                                    <div className="text-light-text-secondary dark:text-dark-text-secondary">Đang tải đánh giá...</div>
                                </div>
                            ) : reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review._id} className="border-b border-light-border dark:border-dark-border pb-4 last:border-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-semibold">{review.user?.name || "Người dùng"}</div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${i < review.rating
                                                                        ? "fill-yellow-400 text-yellow-400"
                                                                        : "text-gray-300"
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                                                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                                                    </span>
                                                    {user?.id === review.user?._id && (
                                                        <button
                                                            onClick={() => handleDeleteReview(review._id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-light-text-secondary dark:text-dark-text-secondary">
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">
                                    Chưa có đánh giá nào. {isAuthenticated && "Hãy là người đầu tiên đánh giá!"}
                                </div>
                            )}
                        </section>

                        {/* Related Books */}
                        <section className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold mb-6">Sách liên quan</h2>
                            {relatedBooks.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {relatedBooks.map((relatedBook) => (
                                        <BookCard key={relatedBook._id} book={relatedBook} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-light-text-secondary dark:text-dark-text-secondary">Không có sách liên quan</p>
                            )}
                        </section>
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
}
