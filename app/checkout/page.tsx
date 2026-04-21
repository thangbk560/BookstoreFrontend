"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useCart } from "@/lib/store/cartStore";
import { useRouter } from "next/navigation";
import { CreditCard, Wallet, Banknote, MapPin } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function CheckoutPage() {
    const router = useRouter();
    const { items, removeSelected, discount, promoCode, removePromoCode } = useCart();
    const { user, isAuthenticated } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState<"vnpay" | "momo" | "cod">("cod");
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        zipCode: "",
    });

    const selectedItems = items.filter(item => item.selected);
    const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 0 && subtotal < 500000 ? 30000 : 0;
    const grandTotal = Math.max(0, subtotal + shipping - discount);

    useEffect(() => {
        if (selectedItems.length === 0) {
            router.push('/cart');
        }
    }, [selectedItems, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchAddresses();
        }
    }, [isAuthenticated]);

        // Xử lý callback từ VNPay
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
        
        if (vnp_ResponseCode) {
            const processVNPayCallback = async () => {
                const pendingOrderId = localStorage.getItem('pendingOrderId');
                
                if (pendingOrderId && vnp_ResponseCode === '00') {
                    try {
                        // Cập nhật trạng thái đơn hàng thành công
                        const response = await fetch(`http://localhost:3001/api/orders/${pendingOrderId}/status`, {
                            method: 'PATCH',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                            },
                            body: JSON.stringify({ status: 'paid' }),
                        });
                        
                        if (response.ok) {
                            removeSelected();
                            removePromoCode();
                            localStorage.removeItem('pendingOrderId');
                            // Xóa params trên URL
                            window.history.replaceState({}, document.title, window.location.pathname);
                            window.location.href = '/order-confirmation';
                        } else {
                            alert('Cập nhật đơn hàng thất bại. Vui lòng liên hệ hỗ trợ.');
                        }
                    } catch (error) {
                        console.error('Error updating order status:', error);
                        alert('Có lỗi xảy ra. Vui lòng liên hệ hỗ trợ.');
                    }
                } else if (vnp_ResponseCode && vnp_ResponseCode !== '00') {
                    alert(`Thanh toán thất bại (Mã lỗi: ${vnp_ResponseCode}). Vui lòng thử lại.`);
                    localStorage.removeItem('pendingOrderId');
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            };
            
            processVNPayCallback();
        }
    }, [removeSelected, removePromoCode]);

    const fetchAddresses = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/users/addresses", {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
            });
            if (response.ok) {
                const data = await response.json();
                setAddresses(data);
                // If there are addresses, select the default one or the first one
                if (data.length > 0) {
                    const defaultAddr = data.find((a: any) => a.isDefault) || data[0];
                    selectAddress(defaultAddr);
                }
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
        }
    };

    const selectAddress = (addr: any) => {
        setSelectedAddressId(addr._id);
        setFormData({
            fullName: addr.fullName,
            email: addr.email || user?.email || "",
            phone: addr.phone,
            address: addr.address,
            city: addr.city,
            zipCode: addr.zipCode,
        });
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedAddressId(id);
        if (id === "new") {
            setFormData({
                fullName: "",
                email: user?.email || "",
                phone: "",
                address: "",
                city: "",
                zipCode: "",
            });
        } else {
            const addr = addresses.find(a => a._id === id);
            if (addr) selectAddress(addr);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if user is authenticated
        if (!isAuthenticated || !user) {
            alert('Vui lòng đăng nhập để đặt hàng');
            router.push('/auth/login');
            return;
        }

        setLoading(true);

        if (paymentMethod === 'cod') {
            // Handle COD order
            try {
                const response = await fetch('http://localhost:3001/api/payment/cod', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        items: selectedItems.map(item => ({
                            book: item.id,
                            quantity: item.quantity,
                            price: item.price,
                            title: item.title,
                        })),
                        shippingAddress: {
                            fullName: formData.fullName,
                            email: formData.email,
                            phone: formData.phone,
                            address: formData.address,
                            city: formData.city,
                            zipCode: formData.zipCode,
                        },
                        subtotal: subtotal,
                        shipping: shipping,
                        tax: 0,
                        total: grandTotal,
                        discount: discount,
                        promoCode: promoCode,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.success) {
                    console.log("Order placed successfully, redirecting...");
                    removeSelected();
                    removePromoCode();
                    // Use window.location.href as a fallback if router.push fails
                    window.location.href = '/order-confirmation';
                } else {
                    console.error("Order failed:", data.message);
                    alert(data.message || 'Đặt hàng thất bại');
                }
            } catch (error) {
                console.error('COD order failed:', error);
                alert('Đặt hàng thất bại. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        } else if (paymentMethod === 'vnpay') {
            // Handle VNPay payment
            try {
                // Tạo đơn hàng trước để có orderId
                const orderResponse = await fetch('http://localhost:3001/api/payment/cod', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        items: selectedItems.map(item => ({
                            book: item.id,
                            quantity: item.quantity,
                            price: item.price,
                            title: item.title,
                        })),
                        shippingAddress: {
                            fullName: formData.fullName,
                            email: formData.email,
                            phone: formData.phone,
                            address: formData.address,
                            city: formData.city,
                            zipCode: formData.zipCode,
                        },
                        subtotal: subtotal,
                        shipping: shipping,
                        tax: 0,
                        total: grandTotal,
                        discount: discount,
                        promoCode: promoCode,
                    }),
                });

                if (!orderResponse.ok) {
                    throw new Error(`HTTP error! status: ${orderResponse.status}`);
                }

                const orderData = await orderResponse.json();
                
                if (!orderData.success || !orderData.orderId) {
                    throw new Error('Failed to create order');
                }

                // Tạo thanh toán VNPay
                const returnUrl = `${window.location.origin}/checkout`;
                const paymentResponse = await fetch('http://localhost:3001/api/payment/vnpay/create', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderId: orderData.orderId,
                        amount: grandTotal,
                        returnUrl: returnUrl,
                    }),
                });

                const paymentData = await paymentResponse.json();
                
                if (paymentData.paymentUrl) {
                    // Lưu orderId để xử lý sau
                    localStorage.setItem('pendingOrderId', orderData.orderId);
                    // Chuyển hướng đến VNPay
                    window.location.href = paymentData.paymentUrl;
                } else {
                    alert('Tạo thanh toán VNPay thất bại');
                    setLoading(false);
                }
            } catch (error) {
                console.error('VNPay payment failed:', error);
                alert('Thanh toán VNPay thất bại. Vui lòng thử lại sau.');
                setLoading(false);
            }
        } else if (paymentMethod === 'momo') {
            alert('Phương thức thanh toán MoMo đang được phát triển. Vui lòng chọn VNPay hoặc COD.');
            setLoading(false);
        }
    };

    if (selectedItems.length === 0) return null;

    return (
        <div className="min-h-screen">
            <Header />

            <div className="container mx-auto py-8">
                <h1 className="text-4xl font-bold mb-8">Thanh toán</h1>

                <form onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Information */}
                            <Card className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">Thông tin giao hàng</h2>
                                    {addresses.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            <select
                                                className="border-none bg-transparent font-medium text-primary focus:ring-0 cursor-pointer"
                                                value={selectedAddressId}
                                                onChange={handleAddressChange}
                                            >
                                                <option value="new">Địa chỉ mới</option>
                                                {addresses.map(addr => (
                                                    <option key={addr._id} value={addr._id}>
                                                        {addr.fullName} - {addr.address}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Họ và tên"
                                            required
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                    </div>
                                    <Input
                                        label="Email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <Input
                                        label="Số điện thoại"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Địa chỉ"
                                            required
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                    <Input
                                        label="Thành phố"
                                        required
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                    <Input
                                        label="Mã bưu điện"
                                        required
                                        value={formData.zipCode}
                                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                    />
                                </div>
                            </Card>

                            {/* Payment Method */}
                            <Card className="p-6">
                                <h2 className="text-2xl font-bold mb-6">Phương thức thanh toán</h2>
                                <div className="grid md:grid-cols-3 gap-4">

                                    <label
                                        className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${paymentMethod === "cod"
                                            ? "border-primary bg-primary/5"
                                            : "border-light-border dark:border-dark-border hover:border-primary/50"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={paymentMethod === "cod"}
                                            onChange={(e) => setPaymentMethod(e.target.value as "cod")}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center gap-3 mb-2">
                                            <Banknote className="w-6 h-6 text-green-600" />
                                            <span className="font-bold text-lg">COD</span>
                                        </div>
                                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                            Thanh toán khi nhận hàng
                                        </p>
                                    </label>

                                    <label
                                        className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${paymentMethod === "vnpay"
                                            ? "border-primary bg-primary/5"
                                            : "border-light-border dark:border-dark-border hover:border-primary/50"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="vnpay"
                                            checked={paymentMethod === "vnpay"}
                                            onChange={(e) => setPaymentMethod(e.target.value as "vnpay")}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center gap-3 mb-2">
                                            {/* Logo VNPay */}
                                            <img
                                                src="vnpay.png"
                                                alt="VNPay"
                                                className="w-8 h-8 object-contain"
                                            />
                                            <span className="font-bold text-lg">VNPay</span>
                                        </div>
                                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                            Thanh toán qua VNPay
                                        </p>
                                    </label>

                                    <label
                                        className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${paymentMethod === "momo"
                                            ? "border-primary bg-primary/5"
                                            : "border-light-border dark:border-dark-border hover:border-primary/50"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="momo"
                                            checked={paymentMethod === "momo"}
                                            onChange={(e) => setPaymentMethod(e.target.value as "momo")}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center gap-3 mb-2">
                                            {/* Logo MoMo */}
                                            <img
                                                src="momo.png"
                                                alt="MoMo"
                                                className="w-8 h-8 object-contain"
                                            />
                                            <span className="font-bold text-lg">MoMo</span>
                                        </div>
                                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                            Thanh toán qua ví MoMo
                                        </p>
                                    </label>
                                </div>
                            </Card>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <Card className="p-6 sticky top-24">
                                <h2 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h2>

                                {/* Items */}
                                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                                    {selectedItems.map((item) => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="w-12 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-lg">📖</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                                                <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                                                    x{item.quantity}
                                                </p>
                                            </div>
                                            <span className="font-semibold text-sm">
                                                {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="space-y-3 mb-6 pt-6 border-t border-light-border dark:border-dark-border">
                                    <div className="flex justify-between">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary">Tổng tiền hàng</span>
                                        <span className="font-semibold">{subtotal.toLocaleString('vi-VN')} ₫</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary">Phí giao hàng</span>
                                        <span className="font-semibold">
                                            {shipping === 0 ? (
                                                <span className="text-green-600">MIỄN PHÍ</span>
                                            ) : (
                                                `${shipping.toLocaleString('vi-VN')} ₫`
                                            )}
                                        </span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600 dark:text-green-400">
                                            <span>Giảm giá ({promoCode})</span>
                                            <span className="font-semibold">-{discount.toLocaleString('vi-VN')} ₫</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-light-border dark:border-dark-border pt-4 mb-6">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-lg font-semibold">Tổng tiền</span>
                                        <span className="text-2xl font-bold text-primary">{grandTotal.toLocaleString('vi-VN')} ₫</span>
                                    </div>
                                </div>

                                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                                    {loading ? 'Đang xử lý...' : (paymentMethod === 'cod' ? 'Đặt hàng' : 'Tiếp tục thanh toán')}
                                </Button>

                                <p className="text-xs text-center text-light-text-tertiary dark:text-dark-text-tertiary mt-4">
                                    Bằng việc đặt hàng, bạn đồng ý với Điều khoản và Điều kiện
                                </p>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>

            <Footer />
        </div>
    );
}
