"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/contexts/AuthContext";
import { LogOut, BarChart3, Package, BookOpen, FolderOpen, User, MapPin, Heart, Settings as SettingsIcon, ShoppingBag, Star, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { BookCard } from "@/components/books/BookCard";
import { ordersApi } from "@/lib/api/orders";

interface DashboardStats {
    totalBooks: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: any[];
    ordersByStatus: Array<{ _id: string; count: number }>;
}

interface Category {
    _id?: string;
    name: string;
    slug: string;
    description?: string;
    isActive?: boolean;
}

interface Book {
    _id?: string;
    title: string;
    author: string;
    description: string;
    price: number;
    category: string;
    isbn: string;
    pages: number;
    language?: string;
    publisher?: string;
    publishDate?: string;
    inStock?: boolean;
    stock: number;
    rating?: number;
    reviewCount?: number;
    soldCount?: number;
    images?: string[];
    isActive?: boolean;
    slug?: string;
}




const getOrderStatusLabel = (status: string) => {
    switch (status) {
        case 'pending': return 'Chờ xử lý';
        case 'processing': return 'Đang xử lý';
        case 'shipped': return 'Đã gửi hàng';
        case 'delivered': return 'Đã giao hàng';
        case 'cancelled': return 'Đã hủy';
        default: return status;
    }
};

const getOrderStatusColor = (status: string) => {
    switch (status) {
        case 'delivered': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        case 'shipped': return 'bg-blue-100 text-blue-800';
        case 'processing': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default function DashboardPage() {
    const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const isAdmin = user?.role === 'admin';

    // Admin tabs
    const [adminTab, setAdminTab] = useState<"statistics" | "orders" | "books" | "categories">("statistics");

    // User tabs
    const [activeTab, setActiveTab] = useState<"orders" | "profile" | "addresses" | "favorites" | "settings">("orders");

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(false);

    // Admin management state
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const [books, setBooks] = useState<Book[]>([]);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [showBookModal, setShowBookModal] = useState(false);
    const [booksPage, setBooksPage] = useState(1);
    const [booksTotal, setBooksTotal] = useState(0);
    const [booksLimit] = useState(10);

    const [adminOrders, setAdminOrders] = useState<any[]>([]);
    const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

    // User feature state
    const [userOrders, setUserOrders] = useState<any[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<any>(null);

    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/auth/login");
        }
    }, [isAuthenticated, authLoading, router]);

    // Fetch admin stats
    useEffect(() => {
        if (isAdmin) {
            fetchAdminStats();
        }
    }, [isAdmin]);

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
        try {
            setLoading(true);
            await ordersApi.cancelOrder(orderId);
            await fetchUserOrders(); // Refresh orders list
            alert("Đơn hàng đã được hủy thành công");
        } catch (error: any) {
            console.error("Error cancelling order:", error);
            alert(error.response?.data?.message || "Có lỗi xảy ra khi hủy đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const fetchAdminStats = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:3001/api/stats/dashboard", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching admin stats:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories when admin tab is categories
    useEffect(() => {
        if (isAdmin && (adminTab === "categories" || adminTab === "books")) {
            fetchCategories();
        }
    }, [isAdmin, adminTab]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:3001/api/categories", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCategory = async () => {
        if (!selectedCategory?.name || !selectedCategory?.slug) {
            alert("Vui lòng nhập tên danh mục");
            return;
        }

        try {
            setLoading(true);
            const url = selectedCategory._id
                ? `http://localhost:3001/api/categories/${selectedCategory._id}`
                : "http://localhost:3001/api/categories";

            const method = selectedCategory._id ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify({
                    name: selectedCategory.name,
                    slug: selectedCategory.slug,
                    description: selectedCategory.description || '',
                }),
            });

            if (response.ok) {
                setShowCategoryModal(false);
                setSelectedCategory(null);
                fetchCategories();
                alert(selectedCategory._id ? "Cập nhật danh mục thành công" : "Tạo danh mục thành công");
            } else {
                const error = await response.json();
                alert(error.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Error saving category:", error);
            alert("Có lỗi xảy ra khi lưu danh mục");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa danh mục này?")) {
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/categories/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });

            if (response.ok) {
                fetchCategories();
                alert("Xóa danh mục thành công");
            } else {
                const error = await response.json();
                alert(error.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            alert("Có lỗi xảy ra khi xóa danh mục");
        } finally {
            setLoading(false);
        }
    };

    // Fetch books when admin tab is books
    useEffect(() => {
        if (isAdmin && adminTab === "books") {
            fetchBooks();
        }
    }, [isAdmin, adminTab, booksPage]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/books?page=${booksPage}&limit=${booksLimit}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setBooks(data.books || data);
                setBooksTotal(data.total || (data.books?.length || 0));
            }
        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBook = async () => {
        if (!selectedBook?.title || !selectedBook?.author || !selectedBook?.price || !selectedBook?.isbn || !selectedBook?.category || !selectedBook?.description || !selectedBook?.pages) {
            alert("Vui lòng nhập đầy đủ thông tin bắt buộc (Tiêu đề, Tác giả, Giá, ISBN, Danh mục, Mô tả, Số trang)");
            return;
        }

        try {
            setLoading(true);
            const url = selectedBook._id
                ? `http://localhost:3001/api/books/${selectedBook._id}`
                : "http://localhost:3001/api/books";

            const method = selectedBook._id ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify({
                    ...selectedBook,
                    inStock: selectedBook.stock > 0,
                }),
            });

            if (response.ok) {
                setShowBookModal(false);
                setSelectedBook(null);
                fetchBooks();
                alert(selectedBook._id ? "Cập nhật sách thành công" : "Tạo sách thành công");
            } else {
                const error = await response.json();
                alert(error.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Error saving book:", error);
            alert("Có lỗi xảy ra khi lưu sách");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBook = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa sách này?")) {
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/books/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });

            if (response.ok) {
                fetchBooks();
                alert("Xóa sách thành công");
            } else {
                const error = await response.json();
                alert(error.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Error deleting book:", error);
            alert("Có lỗi xảy ra khi xóa sách");
        } finally {
            setLoading(false);
        }
    };

    // Fetch admin orders when orders tab is active
    useEffect(() => {
        if (isAdmin && adminTab === "orders") {
            fetchAdminOrders();
        }
    }, [isAdmin, adminTab]);

    const fetchAdminOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:3001/api/orders/admin/all", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setAdminOrders(data);
            }
        } catch (error) {
            console.error("Error fetching admin orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                fetchAdminOrders();
                alert("Cập nhật trạng thái thành công");
            } else {
                const error = await response.json();
                alert(error.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            alert("Có lỗi xảy ra khi cập nhật trạng thái");
        } finally {
            setLoading(false);
        }
    };

    // User Data Fetching
    useEffect(() => {
        if (!isAdmin && isAuthenticated) {
            fetchUserOrders();
            fetchUserProfile();
            fetchAddresses();
            fetchFavorites();
        }
    }, [isAdmin, isAuthenticated]);

    const fetchUserOrders = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/orders/my-orders", {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
            });
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) setUserOrders(data);
            }
        } catch (error) {
            console.error("Error fetching user orders:", error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/users/profile", {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
            });
            if (response.ok) setUserProfile(await response.json());
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:3001/api/users/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify({ name: userProfile?.name, phone: userProfile?.phone }),
            });
            if (response.ok) {
                alert("Cập nhật thông tin thành công");
                fetchUserProfile();
            } else {
                const error = await response.json();
                alert(error.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Có lỗi xảy ra khi cập nhật thông tin");
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/users/addresses", {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
            });
            if (response.ok) setAddresses(await response.json());
        } catch (error) {
            console.error("Error fetching addresses:", error);
        }
    };

    const handleSaveAddress = async () => {
        if (!selectedAddress?.fullName || !selectedAddress?.email || !selectedAddress?.phone || !selectedAddress?.address || !selectedAddress?.city || !selectedAddress?.zipCode) {
            alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        try {
            setLoading(true);
            const url = selectedAddress._id
                ? `http://localhost:3001/api/users/addresses/${selectedAddress._id}`
                : "http://localhost:3001/api/users/addresses";
            const method = selectedAddress._id ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify(selectedAddress),
            });

            if (response.ok) {
                setShowAddressModal(false);
                setSelectedAddress(null);
                fetchAddresses();
                alert(selectedAddress._id ? "Cập nhật địa chỉ thành công" : "Thêm địa chỉ thành công");
            } else {
                const error = await response.json();
                alert(error.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Error saving address:", error);
            alert("Có lỗi xảy ra khi lưu địa chỉ");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/users/addresses/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
            });
            if (response.ok) {
                fetchAddresses();
                alert("Xóa địa chỉ thành công");
            }
        } catch (error) {
            console.error("Error deleting address:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFavorites = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/users/favorites", {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
            });
            if (response.ok) setFavorites(await response.json());
        } catch (error) {
            console.error("Error fetching favorites:", error);
        }
    };

    const handleRemoveFavorite = async (bookId: string) => {
        if (!confirm("Bạn có chắc muốn xóa khỏi danh sách yêu thích?")) return;
        try {
            const response = await fetch(`http://localhost:3001/api/users/favorites/${bookId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
            });
            if (response.ok) {
                fetchFavorites();
                alert("Đã xóa khỏi danh sách yêu thích");
            }
        } catch (error) {
            console.error("Error removing favorite:", error);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Mật khẩu xác nhận không khớp");
            return;
        }
        try {
            setLoading(true);
            const response = await fetch("http://localhost:3001/api/users/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });
            if (response.ok) {
                alert("Đổi mật khẩu thành công");
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                const error = await response.json();
                alert(error.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            alert("Có lỗi xảy ra khi đổi mật khẩu");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/");
    };


    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Đang tải...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen">
            <Header />

            <div className="container mx-auto py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">{isAdmin ? "Bảng điều khiển" : "Tài khoản của tôi"}</h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                        Chào mừng bạn, {user?.name}!
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="p-6">
                            <nav className="space-y-2">
                                {isAdmin ? (
                                    // Admin Sidebar
                                    <>
                                        <button
                                            onClick={() => setAdminTab("statistics")}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${adminTab === "statistics"
                                                ? "bg-primary text-white"
                                                : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border"
                                                }`}
                                        >
                                            <BarChart3 className="w-5 h-5" />
                                            Thống kê
                                        </button>
                                        <button
                                            onClick={() => setAdminTab("orders")}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${adminTab === "orders"
                                                ? "bg-primary text-white"
                                                : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border"
                                                }`}
                                        >
                                            <Package className="w-5 h-5" />
                                            Đơn hàng
                                        </button>
                                        <button
                                            onClick={() => setAdminTab("books")}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${adminTab === "books"
                                                ? "bg-primary text-white"
                                                : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border"
                                                }`}
                                        >
                                            <BookOpen className="w-5 h-5" />
                                            Quản lý sách
                                        </button>
                                        <button
                                            onClick={() => setAdminTab("categories")}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${adminTab === "categories"
                                                ? "bg-primary text-white"
                                                : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border"
                                                }`}
                                        >
                                            <FolderOpen className="w-5 h-5" />
                                            Danh mục
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Đăng xuất
                                        </button>
                                    </>
                                ) : (
                                    // Regular user sidebar
                                    <>
                                        <button
                                            onClick={() => setActiveTab("orders")}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "orders"
                                                ? "bg-primary text-white"
                                                : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border"
                                                }`}
                                        >
                                            <Package className="w-5 h-5" />
                                            Đơn hàng của tôi
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("profile")}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "profile"
                                                ? "bg-primary text-white"
                                                : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border"
                                                }`}
                                        >
                                            <User className="w-5 h-5" />
                                            Hồ sơ của tôi
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("addresses")}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "addresses"
                                                ? "bg-primary text-white"
                                                : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border"
                                                }`}
                                        >
                                            <MapPin className="w-5 h-5" />
                                            Địa chỉ đã lưu
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("favorites")}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "favorites"
                                                ? "bg-primary text-white"
                                                : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border"
                                                }`}
                                        >
                                            <Heart className="w-5 h-5" />
                                            Yêu thích
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("settings")}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "settings"
                                                ? "bg-primary text-white"
                                                : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border"
                                                }`}
                                        >
                                            <SettingsIcon className="w-5 h-5" />
                                            Cài đặt
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Đăng xuất
                                        </button>
                                    </>
                                )}
                            </nav>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {isAdmin ? (
                            // Admin Dashboard
                            <div className="space-y-6">


                                {/* Admin Tab Content */}
                                {adminTab === "statistics" && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold">Thống kê</h2>

                                        {loading ? (
                                            <p>Đang tải...</p>
                                        ) : stats ? (
                                            <>
                                                {/* Statistics Cards */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <Card className="p-6">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">Tổng sách</p>
                                                                <p className="text-3xl font-bold mt-2">{stats.totalBooks}</p>
                                                            </div>
                                                            <BookOpen className="w-12 h-12 text-primary opacity-20" />
                                                        </div>
                                                    </Card>

                                                    <Card className="p-6">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">Tổng đơn hàng</p>
                                                                <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
                                                            </div>
                                                            <ShoppingBag className="w-12 h-12 text-primary opacity-20" />
                                                        </div>
                                                    </Card>

                                                    <Card className="p-6">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">Tổng doanh thu</p>
                                                                <p className="text-3xl font-bold mt-2">{stats.totalRevenue.toLocaleString('vi-VN')} ₫</p>
                                                            </div>
                                                            <BarChart3 className="w-12 h-12 text-primary opacity-20" />
                                                        </div>
                                                    </Card>
                                                </div>

                                                {/* Recent Orders */}
                                                <Card className="p-6">
                                                    <h3 className="text-xl font-semibold mb-4">Đơn hàng gần đây</h3>
                                                    <div className="space-y-4">
                                                        {stats.recentOrders.slice(0, 5).map((order: any) => (
                                                            <Card key={order._id} className="p-4 bg-light-bg dark:bg-dark-bg">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div>
                                                                        <div className="font-semibold">#{order.orderNumber || order._id.slice(-8)}</div>
                                                                        <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                                                                            {order.user?.name || order.user?.email}
                                                                        </p>
                                                                        <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                                                                            {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-bold text-primary">{order.total?.toLocaleString('vi-VN')} ₫</p>
                                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.status)}`}>
                                                                            {getOrderStatusLabel(order.status)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-2 pt-2 border-t border-light-border dark:border-dark-border space-y-1">
                                                                    {order.items?.map((item: any, index: number) => (
                                                                        <div key={index} className="flex justify-between text-sm">
                                                                            <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                                                                {item.title || item.book?.title} x{item.quantity}
                                                                            </span>
                                                                            <span className="font-medium">
                                                                                {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </Card>
                                            </>
                                        ) : (
                                            <p>Không có dữ liệu</p>
                                        )}
                                    </div>
                                )}

                                {adminTab === "orders" && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-2xl font-bold">Quản lý đơn hàng</h2>
                                            <select
                                                className="px-4 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                                value={orderStatusFilter}
                                                onChange={(e) => setOrderStatusFilter(e.target.value)}
                                            >
                                                <option value="all">Tất cả trạng thái</option>
                                                <option value="pending">Chờ xử lý</option>
                                                <option value="processing">Đang xử lý</option>
                                                <option value="shipped">Đã gửi hàng</option>
                                                <option value="delivered">Đã giao hàng</option>
                                                <option value="cancelled">Đã hủy</option>
                                            </select>
                                        </div>

                                        {loading ? (
                                            <p>Đang tải...</p>
                                        ) : adminOrders.length === 0 ? (
                                            <Card className="p-12 text-center">
                                                <Package className="w-16 h-16 mx-auto mb-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
                                                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                                                    Chưa có đơn hàng nào
                                                </p>
                                            </Card>
                                        ) : (
                                            <Card className="overflow-hidden">
                                                <table className="w-full">
                                                    <thead className="bg-light-border dark:bg-dark-border">
                                                        <tr>
                                                            <th className="text-left p-4 font-semibold">Mã đơn</th>
                                                            <th className="text-left p-4 font-semibold">Khách hàng</th>
                                                            <th className="text-left p-4 font-semibold">Ngày đặt</th>
                                                            <th className="text-right p-4 font-semibold">Tổng tiền</th>
                                                            <th className="text-left p-4 font-semibold">Trạng thái</th>
                                                            <th className="text-left p-4 font-semibold">Cập nhật</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {adminOrders
                                                            .filter(order => orderStatusFilter === "all" || order.status === orderStatusFilter)
                                                            .map((order) => (
                                                                <tr key={order._id} className="border-t border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-bg">
                                                                    <td className="p-4 font-medium">
                                                                        #{order.orderNumber || order._id.slice(-8)}
                                                                    </td>
                                                                    <td className="p-4">
                                                                        <div className="text-sm">
                                                                            <div className="font-medium">{order.user?.name || 'N/A'}</div>
                                                                            <div className="text-light-text-tertiary dark:text-dark-text-tertiary">
                                                                                {order.user?.email}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                                    </td>
                                                                    <td className="p-4 text-right font-medium text-primary">
                                                                        {order.total?.toLocaleString('vi-VN')} ₫
                                                                    </td>
                                                                    <td className="p-4">
                                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.status)}`}>
                                                                            {getOrderStatusLabel(order.status)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-4">
                                                                        <select
                                                                            className="px-3 py-1 border border-light-border dark:border-dark-border rounded text-sm"
                                                                            value={order.status}
                                                                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                                                            disabled={loading}
                                                                        >
                                                                            <option value="pending">Chờ xử lý</option>
                                                                            <option value="processing">Đang xử lý</option>
                                                                            <option value="shipped">Đã gửi hàng</option>
                                                                            <option value="delivered">Đã giao hàng</option>
                                                                            <option value="cancelled">Đã hủy</option>
                                                                        </select>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </Card>
                                        )}
                                    </div>
                                )}

                                {adminTab === "books" && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-2xl font-bold">Quản lý sách</h2>
                                            <Button onClick={() => {
                                                setSelectedBook({
                                                    title: '',
                                                    author: '',
                                                    description: '',
                                                    price: 0,
                                                    category: '',
                                                    isbn: '',
                                                    pages: 0,
                                                    stock: 0,
                                                    language: 'Tiếng Việt',
                                                    images: [''],
                                                });
                                                setShowBookModal(true);
                                            }}>
                                                Thêm sách mới
                                            </Button>
                                        </div>

                                        {loading ? (
                                            <p>Đang tải...</p>
                                        ) : books.length === 0 ? (
                                            <Card className="p-12 text-center">
                                                <BookOpen className="w-16 h-16 mx-auto mb-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
                                                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                                                    Chưa có sách nào
                                                </p>
                                                <Button onClick={() => {
                                                    setSelectedBook({
                                                        title: '',
                                                        author: '',
                                                        description: '',
                                                        price: 0,
                                                        category: '',
                                                        isbn: '',
                                                        pages: 0,
                                                        stock: 0,
                                                        language: 'Tiếng Việt',
                                                        images: [''],
                                                    });
                                                    setShowBookModal(true);
                                                }}>
                                                    Tạo sách đầu tiên
                                                </Button>
                                            </Card>
                                        ) : (
                                            <>
                                                <Card className="overflow-hidden">
                                                    <table className="w-full">
                                                        <thead className="bg-light-border dark:bg-dark-border">
                                                            <tr>
                                                                <th className="text-left p-4 font-semibold">Tiêu đề</th>
                                                                <th className="text-left p-4 font-semibold">Tác giả</th>
                                                                <th className="text-left p-4 font-semibold">Danh mục</th>
                                                                <th className="text-right p-4 font-semibold">Giá</th>
                                                                <th className="text-right p-4 font-semibold">Tồn kho</th>
                                                                <th className="text-right p-4 font-semibold">Thao tác</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {books.map((book) => (
                                                                <tr key={book._id} className="border-t border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-bg">
                                                                    <td className="p-4 font-medium">{book.title}</td>
                                                                    <td className="p-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">{book.author}</td>
                                                                    <td className="p-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">{book.category}</td>
                                                                    <td className="p-4 text-right font-medium text-primary">{book.price.toLocaleString('vi-VN')} ₫</td>
                                                                    <td className="p-4 text-right">
                                                                        <span className={book.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                                                            {book.stock}
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-4">
                                                                        <div className="flex justify-end gap-2">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => {
                                                                                    setSelectedBook(book);
                                                                                    setShowBookModal(true);
                                                                                }}
                                                                            >
                                                                                Sửa
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => handleDeleteBook(book._id!)}
                                                                            >
                                                                                Xóa
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </Card>

                                                {/* Pagination */}
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        disabled={booksPage === 1}
                                                        onClick={() => setBooksPage(p => p - 1)}
                                                    >
                                                        Trước
                                                    </Button>
                                                    <span className="px-4 py-2">
                                                        Trang {booksPage} / {Math.ceil(booksTotal / booksLimit) || 1}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        disabled={booksPage >= Math.ceil(booksTotal / booksLimit)}
                                                        onClick={() => setBooksPage(p => p + 1)}
                                                    >
                                                        Sau
                                                    </Button>
                                                </div>
                                            </>
                                        )}

                                        {/* Book Modal */}
                                        {showBookModal && selectedBook && (
                                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4" onClick={() => setShowBookModal(false)}>
                                                <Card className="p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                                    <h3 className="text-xl font-bold mb-4">
                                                        {selectedBook._id ? 'Sửa sách' : 'Thêm sách mới'}
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                                                value={selectedBook.title}
                                                                onChange={(e) => setSelectedBook({ ...selectedBook, title: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Tác giả *</label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                                                value={selectedBook.author}
                                                                onChange={(e) => setSelectedBook({ ...selectedBook, author: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <label className="block text-sm font-medium mb-1">Mô tả *</label>
                                                            <textarea
                                                                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                                                rows={3}
                                                                value={selectedBook.description}
                                                                onChange={(e) => setSelectedBook({ ...selectedBook, description: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Danh mục *</label>
                                                            <select
                                                                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                                                value={selectedBook.category}
                                                                onChange={(e) => setSelectedBook({ ...selectedBook, category: e.target.value })}
                                                            >
                                                                <option value="">Chọn danh mục</option>
                                                                {categories.map((cat) => (
                                                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">ISBN *</label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                                                value={selectedBook.isbn}
                                                                onChange={(e) => setSelectedBook({ ...selectedBook, isbn: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Giá (₫) *</label>
                                                            <input
                                                                type="number"
                                                                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                                                value={selectedBook.price}
                                                                onChange={(e) => setSelectedBook({ ...selectedBook, price: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Tồn kho *</label>
                                                            <input
                                                                type="number"
                                                                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                                                value={selectedBook.stock}
                                                                onChange={(e) => setSelectedBook({ ...selectedBook, stock: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Số trang *</label>
                                                            <input
                                                                type="number"
                                                                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                                                value={selectedBook.pages}
                                                                onChange={(e) => setSelectedBook({ ...selectedBook, pages: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Ngôn ngữ</label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                                                value={selectedBook.language || ''}
                                                                onChange={(e) => setSelectedBook({ ...selectedBook, language: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Nhà xuất bản</label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                                                value={selectedBook.publisher || ''}
                                                                onChange={(e) => setSelectedBook({ ...selectedBook, publisher: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Ngày xuất bản</label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                                                placeholder="YYYY-MM-DD"
                                                                value={selectedBook.publishDate || ''}
                                                                onChange={(e) => setSelectedBook({ ...selectedBook, publishDate: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <label className="block text-sm font-medium mb-1">URL hình ảnh (mỗi dòng 1 URL)</label>
                                                            <textarea
                                                                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                                                rows={3}
                                                                value={(selectedBook.images || ['']).join('\n')}
                                                                onChange={(e) => setSelectedBook({
                                                                    ...selectedBook,
                                                                    images: e.target.value.split('\n').filter(url => url.trim())
                                                                })}
                                                            />
                                                        </div>
                                                        <div className="col-span-2 flex gap-4 pt-4">
                                                            <Button onClick={handleSaveBook} disabled={loading}>
                                                                {loading ? 'Đang lưu...' : 'Lưu'}
                                                            </Button>
                                                            <Button variant="outline" onClick={() => setShowBookModal(false)}>
                                                                Hủy
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {adminTab === "categories" && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-2xl font-bold">Quản lý danh mục</h2>
                                            <Button onClick={() => {
                                                setSelectedCategory(null);
                                                setShowCategoryModal(true);
                                            }}>
                                                Thêm danh mục mới
                                            </Button>
                                        </div>

                                        {loading ? (
                                            <p>Đang tải...</p>
                                        ) : categories.length === 0 ? (
                                            <Card className="p-12 text-center">
                                                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
                                                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                                                    Chưa có danh mục nào
                                                </p>
                                                <Button onClick={() => setShowCategoryModal(true)}>
                                                    Tạo danh mục đầu tiên
                                                </Button>
                                            </Card>
                                        ) : (
                                            <Card className="overflow-hidden">
                                                <table className="w-full">
                                                    <thead className="bg-light-border dark:bg-dark-border">
                                                        <tr>
                                                            <th className="text-left p-4 font-semibold">Tên</th>
                                                            <th className="text-left p-4 font-semibold">Slug</th>
                                                            <th className="text-left p-4 font-semibold">Mô tả</th>
                                                            <th className="text-right p-4 font-semibold">Thao tác</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {categories.map((category) => (
                                                            <tr key={category._id} className="border-t border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-bg">
                                                                <td className="p-4 font-medium">{category.name}</td>
                                                                <td className="p-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">{category.slug}</td>
                                                                <td className="p-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                                    {category.description || '-'}
                                                                </td>
                                                                <td className="p-4">
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => {
                                                                                setSelectedCategory(category);
                                                                                setShowCategoryModal(true);
                                                                            }}
                                                                        >
                                                                            Sửa
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => category._id && handleDeleteCategory(category._id)}
                                                                        >
                                                                            Xóa
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </Card>
                                        )}

                                        {/* Category Modal */}
                                        {showCategoryModal && (
                                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCategoryModal(false)}>
                                                <Card className="p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                                                    <h3 className="text-xl font-bold mb-4">
                                                        {selectedCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Tên danh mục</label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                                                placeholder="Văn học, Khoa học, ..."
                                                                value={selectedCategory?.name || ''}
                                                                onChange={(e) => {
                                                                    const name = e.target.value;
                                                                    const slug = name.toLowerCase()
                                                                        .normalize("NFD")
                                                                        .replace(/[\u0300-\u036f]/g, "")
                                                                        .replace(/đ/g, 'd')
                                                                        .replace(/[^a-z0-9\s-]/g, '')
                                                                        .replace(/\s+/g, '-');
                                                                    setSelectedCategory({ ...selectedCategory, name, slug } as Category);
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Slug (tự động)</label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-gray-100 dark:bg-gray-800"
                                                                value={selectedCategory?.slug || ''}
                                                                readOnly
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Mô tả (tùy chọn)</label>
                                                            <textarea
                                                                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                                                rows={3}
                                                                placeholder="Mô tả danh mục..."
                                                                value={selectedCategory?.description || ''}
                                                                onChange={(e) =>
                                                                    setSelectedCategory({ ...selectedCategory, description: e.target.value } as Category)
                                                                }
                                                            />
                                                        </div>
                                                        <div className="flex gap-4 pt-4">
                                                            <Button onClick={handleSaveCategory} disabled={loading}>
                                                                {loading ? 'Đang lưu...' : 'Lưu'}
                                                            </Button>
                                                            <Button variant="outline" onClick={() => setShowCategoryModal(false)}>
                                                                Hủy
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            // User Dashboard
                            <div className="space-y-6">
                                {activeTab === "orders" && (
                                    <Card className="p-6">
                                        <h2 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h2>
                                        {!Array.isArray(userOrders) || userOrders.length === 0 ? (
                                            <p className="text-center text-light-text-secondary dark:text-dark-text-secondary py-8">
                                                Bạn chưa có đơn hàng nào
                                            </p>
                                        ) : (
                                            <div className="space-y-4">
                                                {userOrders.map((order) => (
                                                    <Card key={order._id} className="p-4 border border-light-border dark:border-dark-border">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="font-semibold">Đơn hàng #{order.orderNumber || order._id.slice(-8)}</p>
                                                                <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                                                                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-primary">{order.total?.toLocaleString('vi-VN')} ₫</p>
                                                                <span className={`text-xs px-2 py-1 rounded-full ${getOrderStatusColor(order.status)}`}>
                                                                    {getOrderStatusLabel(order.status)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border space-y-2">
                                                            {order.items?.map((item: any, index: number) => (
                                                                <div key={index} className="flex justify-between text-sm">
                                                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                                                        {item.title || item.book?.title} x{item.quantity}
                                                                    </span>
                                                                    <span className="font-medium">
                                                                        {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {order.status === 'pending' && (
                                                            <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleCancelOrder(order._id)}
                                                                    disabled={loading}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    Hủy đơn hàng
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </Card>
                                )}

                                {activeTab === "profile" && (
                                    <Card className="p-6">
                                        <h2 className="text-2xl font-bold mb-6">Thông tin cá nhân</h2>
                                        {!userProfile ? (
                                            <div className="py-8 text-center">
                                                <p>Đang tải thông tin...</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 max-w-md">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-gray-50"
                                                        value={userProfile.email || ''}
                                                        disabled
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Họ tên</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                                        value={userProfile.name || ''}
                                                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                                                    <input
                                                        type="tel"
                                                        className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg"
                                                        value={userProfile.phone || ''}
                                                        onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                                                    />
                                                </div>
                                                <Button onClick={handleUpdateProfile} disabled={loading}>
                                                    {loading ? 'Đang lưu...' : 'Cập nhật thông tin'}
                                                </Button>
                                            </div>
                                        )}
                                    </Card>
                                )}

                                {activeTab === "addresses" && (
                                    <Card className="p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold">Địa chỉ giao hàng</h2>
                                            <Button onClick={() => {
                                                setSelectedAddress({ fullName: '', email: '', phone: '', address: '', city: '', zipCode: '' });
                                                setShowAddressModal(true);
                                            }}>
                                                Thêm địa chỉ mới
                                            </Button>
                                        </div>
                                        {addresses.length === 0 ? (
                                            <p className="text-center text-light-text-secondary dark:text-dark-text-secondary py-8">
                                                Bạn chưa có địa chỉ nào
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {addresses.map((addr) => (
                                                    <Card key={addr._id} className="p-4 border border-light-border dark:border-dark-border">
                                                        <p className="font-semibold">{addr.fullName}</p>
                                                        <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">{addr.email}</p>
                                                        <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">{addr.phone}</p>
                                                        <p className="text-sm mt-2">{addr.address}</p>
                                                        <p className="text-sm">{addr.city} {addr.zipCode}</p>
                                                        {addr.isDefault && <span className="text-xs bg-primary text-white px-2 py-1 rounded mt-2 inline-block">Mặc định</span>}
                                                        <div className="flex gap-2 mt-4">
                                                            <Button size="sm" variant="outline" onClick={() => {
                                                                setSelectedAddress(addr);
                                                                setShowAddressModal(true);
                                                            }}>Sửa</Button>
                                                            <Button size="sm" variant="outline" onClick={() => handleDeleteAddress(addr._id)}>Xóa</Button>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                        {showAddressModal && selectedAddress && (
                                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddressModal(false)}>
                                                <Card className="p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                                                    <h3 className="text-xl font-bold mb-4">{selectedAddress._id ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                                                    <div className="space-y-4">
                                                        <input type="text" placeholder="Họ tên" className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg" value={selectedAddress.fullName || ''} onChange={(e) => setSelectedAddress({ ...selectedAddress, fullName: e.target.value })} />
                                                        <input type="email" placeholder="Email" className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg" value={selectedAddress.email || ''} onChange={(e) => setSelectedAddress({ ...selectedAddress, email: e.target.value })} />
                                                        <input type="tel" placeholder="Số điện thoại" className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg" value={selectedAddress.phone || ''} onChange={(e) => setSelectedAddress({ ...selectedAddress, phone: e.target.value })} />
                                                        <input type="text" placeholder="Địa chỉ" className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg" value={selectedAddress.address || ''} onChange={(e) => setSelectedAddress({ ...selectedAddress, address: e.target.value })} />
                                                        <input type="text" placeholder="Thành phố" className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg" value={selectedAddress.city || ''} onChange={(e) => setSelectedAddress({ ...selectedAddress, city: e.target.value })} />
                                                        <input type="text" placeholder="Mã bưu điện" className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg" value={selectedAddress.zipCode || ''} onChange={(e) => setSelectedAddress({ ...selectedAddress, zipCode: e.target.value })} />
                                                        <div className="flex gap-4">
                                                            <Button onClick={handleSaveAddress} disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</Button>
                                                            <Button variant="outline" onClick={() => setShowAddressModal(false)}>Hủy</Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        )}
                                    </Card>
                                )}

                                {activeTab === "favorites" && (
                                    <Card className="p-6">
                                        <h2 className="text-2xl font-bold mb-6">Sách yêu thích</h2>
                                        {favorites.length === 0 ? (
                                            <p className="text-center text-light-text-secondary dark:text-dark-text-secondary py-8">
                                                Bạn chưa có sách yêu thích nào
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {favorites.map((book: any) => (
                                                    <BookCard
                                                        key={book._id}
                                                        book={book}
                                                        action={
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="w-full text-xs py-1.5"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleRemoveFavorite(book._id);
                                                                }}
                                                            >
                                                                Xóa
                                                            </Button>
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </Card>
                                )}

                                {activeTab === "settings" && (
                                    <Card className="p-6">
                                        <h2 className="text-2xl font-bold mb-6">Đổi mật khẩu</h2>
                                        <div className="space-y-4 max-w-md">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Mật khẩu hiện tại</label>
                                                <div className="relative">
                                                    <input
                                                        type={showCurrentPassword ? "text" : "password"}
                                                        className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg pr-10"
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    >
                                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
                                                <div className="relative">
                                                    <input
                                                        type={showNewPassword ? "text" : "password"}
                                                        className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg pr-10"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                    >
                                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu mới</label>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg pr-10"
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <Button onClick={handleChangePassword} disabled={loading}>
                                                {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                                            </Button>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                </div >
            </div >

            <Footer />
        </div >
    );
}
