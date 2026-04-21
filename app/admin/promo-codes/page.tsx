"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { promoCodesApi } from "@/lib/api/promo-codes";
import { Trash2, Plus, Calendar, Tag } from "lucide-react";

interface PromoCode {
    _id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderValue: number;
    maxDiscount?: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
    usedCount: number;
    isActive: boolean;
}

export default function AdminPromoCodesPage() {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        type: "percentage",
        value: "",
        minOrderValue: "",
        maxDiscount: "",
        startDate: "",
        endDate: "",
        usageLimit: "",
    });

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            const data = await promoCodesApi.getAll();
            setPromoCodes(data);
        } catch (error) {
            console.error("Failed to fetch promo codes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;
        try {
            await promoCodesApi.delete(id);
            setPromoCodes(promoCodes.filter(code => code._id !== id));
        } catch (error) {
            console.error("Failed to delete promo code:", error);
            alert("Xóa thất bại");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await promoCodesApi.create({
                ...formData,
                value: Number(formData.value),
                minOrderValue: Number(formData.minOrderValue),
                maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : 0,
            });
            setShowForm(false);
            setFormData({
                code: "",
                type: "percentage",
                value: "",
                minOrderValue: "",
                maxDiscount: "",
                startDate: "",
                endDate: "",
                usageLimit: "",
            });
            fetchPromoCodes();
        } catch (error) {
            console.error("Failed to create promo code:", error);
            alert("Tạo mã thất bại");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Quản lý Mã giảm giá</h1>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm mã mới
                </Button>
            </div>

            {showForm && (
                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Mã giảm giá"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium mb-1">Loại giảm giá</label>
                                <select
                                    className="w-full p-2 border rounded-md bg-transparent"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="percentage">Phần trăm (%)</option>
                                    <option value="fixed">Số tiền cố định (VND)</option>
                                </select>
                            </div>
                            <Input
                                label="Giá trị giảm"
                                type="number"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                required
                            />
                            <Input
                                label="Đơn hàng tối thiểu"
                                type="number"
                                value={formData.minOrderValue}
                                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                required
                            />
                            {formData.type === 'percentage' && (
                                <Input
                                    label="Giảm tối đa"
                                    type="number"
                                    value={formData.maxDiscount}
                                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                />
                            )}
                            <Input
                                label="Giới hạn sử dụng (0 = không giới hạn)"
                                type="number"
                                value={formData.usageLimit}
                                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                            />
                            <Input
                                label="Ngày bắt đầu"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                            <Input
                                label="Ngày kết thúc"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                            <Button type="submit">Tạo mã</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid gap-4">
                {promoCodes.map((code) => (
                    <Card key={code._id} className="p-4 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Tag className="w-4 h-4 text-primary" />
                                <span className="font-bold text-lg">{code.code}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${code.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {code.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <p>
                                    Giảm: {code.type === 'percentage' ? `${code.value}%` : `${code.value.toLocaleString('vi-VN')} ₫`}
                                    {code.maxDiscount ? ` (Tối đa ${code.maxDiscount.toLocaleString('vi-VN')} ₫)` : ''}
                                </p>
                                <p>Đơn tối thiểu: {code.minOrderValue.toLocaleString('vi-VN')} ₫</p>
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(code.startDate).toLocaleDateString('vi-VN')} - {new Date(code.endDate).toLocaleDateString('vi-VN')}
                                    </span>
                                    <span>Đã dùng: {code.usedCount} {code.usageLimit > 0 ? `/ ${code.usageLimit}` : ''}</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(code._id)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </Card>
                ))}
                {promoCodes.length === 0 && !loading && (
                    <p className="text-center text-gray-500 py-8">Chưa có mã giảm giá nào.</p>
                )}
            </div>
        </div>
    );
}
