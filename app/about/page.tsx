"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import {
    BookOpen,
    Heart,
    Award,
    Users,
    Globe,
    TrendingUp,
} from "lucide-react";

export default function AboutPage() {
    const features = [
        {
            icon: BookOpen,
            title: "Bộ sưu tập phong phú",
            description:
                "Hơn 50.000 cuốn sách thuộc mọi thể loại, từ kinh điển đến những cuốn bán chạy nhất mới nhất",
        },
        {
            icon: Heart,
            title: "Bộ sưu tập được chọn lọc",
            description:
                "Mỗi cuốn sách đều được chọn lọc cẩn thận bởi đội ngũ chuyên gia của chúng tôi để đảm bảo chất lượng và giá trị",
        },
        {
            icon: Award,
            title: "Chất lượng cao",
            description:
                "Chúng tôi hợp tác với các nhà xuất bản hàng đầu để mang đến cho bạn những cuốn sách thật sự đáng tin cậy và chất lượng cao",
        },
        {
            icon: Users,
            title: "Phục vụ khách hàng",
            description:
                "Tham gia vào cộng đồng hàng ngàn người yêu sách, chia sẻ đánh giá và lời khuyên",
        },
        {
            icon: Globe,
            title: "Giao hàng khắp quốc gia",
            description: "Giao hàng nhanh chóng và đáng tin cậy đến mọi nơi trong quốc gia",
        },
        {
            icon: TrendingUp,
            title: "Giá cả hợp lý",
            description:
                "Giá cả cạnh tranh với các ưu đãi thường xuyên và các chương trình khuyến mãi đặc biệt",
        },
    ];

    const stats = [
        { value: "50,000+", label: "Sách" },
        { value: "25,000+", label: "Khách hàng hài lòng" },
        { value: "4.9/5", label: "Đánh giá trung bình" },
        { value: "99%", label: "Tỷ lệ hài lòng" },
    ];

    return (
        <div className="min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent dark:from-primary/20 dark:via-secondary/10 py-20">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-6xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
                            Về Chúng Tôi{" "}
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Cửa Hàng Sách
                            </span>
                        </h1>
                        <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary mb-8">
                            Cửa hàng sách đáng tin cậy của bạn để khám phá những cuốn sách tuyệt vời và
                            xây dựng thư viện cá nhân của bạn
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-16">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
                                Câu chuyện của chúng tôi
                            </h2>
                            <div className="space-y-4 text-light-text-secondary dark:text-dark-text-secondary">
                                <p>
                                    Được thành lập vào năm 2025, cửa hàng sách của chúng tôi bắt đầu với một sứ mệnh đơn giản: để
                                    cuốn sách chất lượng có thể tiếp cận được mọi người. Điều gì bắt đầu như một cửa hàng trực tuyến nhỏ đã trở thành một trong những cửa hàng sách đáng tin cậy nhất của Việt Nam.
                                </p>
                                <p>
                                    Chúng tôi tin rằng sách có sức mạnh để giáo dục, truyền cảm hứng và biến đổi cuộc sống. Đó là lý do tại sao chúng tôi cam kết cung cấp một bộ sưu tập các tựa sách được chọn lọc kỹ lưỡng, phù hợp với sở thích và mối quan tâm của mọi độc giả.
                                </p>
                                <p>
                                    Chúng tôi cam kết cung cấp một bộ sưu tập các tựa sách được chọn lọc kỹ lưỡng, phù hợp với sở thích và mối quan tâm của mọi độc giả.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="relative h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-8xl mb-4">📚</div>
                                    <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                                        Sách Thay Đổi Cuộc Sống
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-light-bg dark:bg-dark-bg">
                <div className="container mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-4xl font-bold text-primary mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-light-text-tertiary dark:text-dark-text-tertiary">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                            Tại sao bạn nên chọn chúng tôi
                        </h2>
                        <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
                            Chúng tôi cam kết cung cấp một bộ sưu tập các tựa sách được chọn lọc kỹ lưỡng, phù hợp với sở thích và mối quan tâm của mọi độc giả.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="p-6 text-center h-full">
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Icon className="w-8 h-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-light-text-secondary dark:text-dark-text-secondary">
                                            {feature.description}
                                        </p>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-light-bg dark:bg-dark-bg">
                <div className="container mx-auto">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
                                Liên hệ với chúng tôi
                            </h2>
                            <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary mb-8">
                                Bạn có câu hỏi? Chúng tôi rất vui lòng nghe từ bạn. Gửi cho chúng tôi một tin nhắn
                                và chúng tôi sẽ trả lời ngay khi có thể.
                            </p>
                            <div className="space-y-4 text-left">
                                <Card className="p-6">
                                    <h3 className="font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                                        Email
                                    </h3>
                                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                                        support@bookstore.com
                                    </p>
                                </Card>
                                <Card className="p-6">
                                    <h3 className="font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                                        Số điện thoại
                                    </h3>
                                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                                        +84 123 456 789
                                    </p>
                                </Card>
                                <Card className="p-6">
                                    <h3 className="font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                                        Địa chỉ
                                    </h3>
                                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                                        123 Đường Hoàng Quốc Việt, Quận Bắc Từ Liêm, Hà Nội, Việt Nam
                                    </p>
                                </Card>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
