"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useCart } from "@/lib/store/cartStore";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { promoCodesApi } from "@/lib/api/promo-codes";

export default function CartPage() {
    const { items, removeItem, updateQuantity, toggleSelection, toggleAll, promoCode, discount, applyPromoCode, removePromoCode } = useCart();
    const [mounted, setMounted] = useState(false);
    const [promoCodeInput, setPromoCodeInput] = useState("");
    const [loadingPromo, setLoadingPromo] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Calculate totals based on selected items
    const selectedItems = items.filter(item => item.selected);
    const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 0 && subtotal < 500000 ? 30000 : 0; // Free shipping over 500k VND
    const grandTotal = Math.max(0, subtotal + shipping - discount);

    const allSelected = items.length > 0 && items.every(item => item.selected);

    const handleApplyPromoCode = async () => {
        if (!promoCodeInput.trim()) return;
        try {
            setLoadingPromo(true);
            const promo = await promoCodesApi.validate(promoCodeInput, subtotal);

            let discountAmount = 0;
            if (promo.type === 'percentage') {
                discountAmount = (subtotal * promo.value) / 100;
                if (promo.maxDiscount) {
                    discountAmount = Math.min(discountAmount, promo.maxDiscount);
                }
            } else {
                discountAmount = promo.value;
            }

            applyPromoCode(promo.code, discountAmount);
            setPromoCodeInput("");
            alert(`Áp dụng mã giảm giá thành công! Giảm ${discountAmount.toLocaleString('vi-VN')} ₫`);
        } catch (error: any) {
            console.error("Promo code error:", error);
            alert(error.response?.data?.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn.");
        } finally {
            setLoadingPromo(false);
        }
    };

    const handleRemovePromoCode = () => {
        removePromoCode();
    };

    if (!mounted) return null;

    if (items.length === 0) {
        return (
            <div className="min-h-screen">
                <Header />
                <div className="container mx-auto py-16">
                    <div className="text-center max-w-md mx-auto">
                        <ShoppingBag className="w-24 h-24 mx-auto text-light-text-tertiary dark:text-dark-text-tertiary mb-4" />
                        <h1 className="text-3xl font-bold mb-4">Giỏ hàng trống</h1>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8">
                            Bạn chưa có sách trong giỏ hàng.
                        </p>
                        <Link href="/books">
                            <Button size="lg">Mua sách</Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header />

            <div className="container mx-auto py-8">
                <h1 className="text-4xl font-bold mb-8">Giỏ hàng</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Select All Header */}
                        <Card className="p-4 flex items-center gap-4">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={(e) => toggleAll(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="font-semibold">Chọn tất cả ({items.length} sản phẩm)</span>
                        </Card>

                        {items.map((item) => (
                            <Card key={item.id} className="p-6">
                                <div className="flex gap-4 items-start">
                                    {/* Checkbox */}
                                    <div className="pt-10">
                                        <input
                                            type="checkbox"
                                            checked={item.selected || false}
                                            onChange={() => toggleSelection(item.id)}
                                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>

                                    {/* Book Image */}
                                    <div className="w-24 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {item.image ? (
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-4xl">📖</div>
                                        )}
                                    </div>

                                    {/* Book Details */}
                                    <div className="flex-1">
                                        <Link href={`/books/${item.id}`}>
                                            <h3 className="font-semibold text-lg text-light-text-primary dark:text-dark-text-primary hover:text-primary mb-1">
                                                {item.title}
                                            </h3>
                                        </Link>
                                        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                                            {item.author}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center border border-light-border dark:border-dark-border rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                        className="px-3 py-1 hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="px-4 py-1 font-semibold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="px-3 py-1 hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-500 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-primary">
                                                    {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                                                </div>
                                                <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                                                    {item.price.toLocaleString('vi-VN')} ₫ mỗi cuốn
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 sticky top-24">
                            <h2 className="text-2xl font-bold mb-6">Tóm tắt đơn hàng</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">Tổng tiền</span>
                                    <span className="font-semibold">{subtotal.toLocaleString('vi-VN')} ₫</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">Phí giao hàng</span>
                                    <span className="font-semibold">
                                        {shipping === 0 ? (
                                            <span className="text-green-600">Miễn phí</span>
                                        ) : (
                                            `${shipping.toLocaleString('vi-VN')} ₫`
                                        )}
                                    </span>
                                </div>

                                {subtotal < 500000 && subtotal > 0 && (
                                    <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-3 text-sm">
                                        Mua thêm <span className="font-bold">{(500000 - subtotal).toLocaleString('vi-VN')} ₫</span> để được miễn phí vận chuyển
                                    </div>
                                )}

                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <span>Giảm giá</span>
                                        <span className="font-semibold">-{discount.toLocaleString('vi-VN')} ₫</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-light-border dark:border-dark-border pt-4 mb-6">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-lg font-semibold">Tổng tiền</span>
                                    <span className="text-3xl font-bold text-primary">{grandTotal.toLocaleString('vi-VN')} ₫</span>
                                </div>
                            </div>

                            <Link href="/checkout">
                                <Button size="lg" className="w-full mb-3" disabled={selectedItems.length === 0}>
                                    Thanh toán ({selectedItems.length})
                                </Button>
                            </Link>

                            <Link href="/books">
                                <Button variant="outline" className="w-full">
                                    Tiếp tục mua sắm
                                </Button>
                            </Link>

                            {/* Promo Code */}
                            <div className="mt-6 pt-6 border-t border-light-border dark:border-dark-border">
                                <label className="text-sm font-semibold mb-2 block">Mã giảm giá</label>
                                {promoCode ? (
                                    <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                                        <div>
                                            <p className="font-bold text-green-700 dark:text-green-400">{promoCode}</p>
                                            <p className="text-xs text-green-600 dark:text-green-500">Đã áp dụng giảm giá</p>
                                        </div>
                                        <button onClick={handleRemovePromoCode} className="text-red-500 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Nhập mã giảm giá"
                                            value={promoCodeInput}
                                            onChange={(e) => setPromoCodeInput(e.target.value)}
                                        />
                                        <Button variant="outline" onClick={handleApplyPromoCode} disabled={loadingPromo}>
                                            {loadingPromo ? "..." : "Áp dụng"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
