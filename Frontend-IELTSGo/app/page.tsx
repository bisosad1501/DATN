import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Target, TrendingUp, Users } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { BrandText } from "@/components/ui/brand-text"

export default function HomePage() {
  return (
    <AppLayout showFooter={true}>
      <div className="bg-gradient-to-b from-cream/30 to-background">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Chinh phục IELTS cùng <BrandText className="text-5xl md:text-6xl" />
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Nền tảng học IELTS trực tuyến với khóa học chuyên sâu, bài tập thực hành đa dạng và theo dõi tiến độ cá
              nhân hóa
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Bắt đầu miễn phí
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Đăng nhập
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            <FeatureCard
              icon={<BookOpen className="w-8 h-8 text-primary" />}
              title="Khóa học chuyên sâu"
              description="Học từ các khóa học được thiết kế bởi chuyên gia IELTS"
            />
            <FeatureCard
              icon={<Target className="w-8 h-8 text-primary" />}
              title="Luyện tập đa dạng"
              description="Rèn luyện cả 4 kỹ năng với bài tập thực hành có mục tiêu"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-primary" />}
              title="Theo dõi tiến độ"
              description="Giám sát sự tiến bộ với phân tích chi tiết"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-primary" />}
              title="Cộng đồng học tập"
              description="Cạnh tranh và học hỏi cùng hàng nghìn học viên"
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Sẵn sàng bắt đầu hành trình IELTS?</h2>
            <p className="text-lg mb-8 opacity-90">Tham gia cùng hàng nghìn học viên đã đạt mục tiêu IELTS của họ</p>
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Đăng ký ngay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}
