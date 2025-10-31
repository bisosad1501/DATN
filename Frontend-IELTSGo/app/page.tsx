import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Target, TrendingUp, Users, Award, Clock, Star, CheckCircle2, ArrowRight, PlayCircle, Quote, Zap, Globe } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { BrandText } from "@/components/ui/brand-text"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function HomePage() {
  return (
    <AppLayout showFooter={true}>
      <div className="relative min-h-screen">
        {/* Hero Section with subtle gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/20 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          
          {/* Decorative shapes */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/30 rounded-full blur-3xl opacity-40" />
          
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-16 sm:py-20 lg:py-24">
              <div className="text-center max-w-4xl mx-auto space-y-6">
                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
                    Chinh phục IELTS cùng{" "}
                    <BrandText className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl inline-block font-bold" />
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Nền tảng học IELTS trực tuyến với khóa học chuyên sâu, bài tập thực hành đa dạng và theo dõi tiến độ cá nhân hóa
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto px-8 text-base sm:text-lg h-12 sm:h-14 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30">
                      Bắt đầu miễn phí
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 text-base sm:text-lg h-12 sm:h-14 border-2 hover:bg-accent/50 transition-all duration-200">
                      Đăng nhập
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <FeatureCard
              icon={<BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />}
              title="Khóa học chuyên sâu"
              description="Học từ các khóa học được thiết kế bởi chuyên gia IELTS"
            />
            <FeatureCard
              icon={<Target className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />}
              title="Luyện tập đa dạng"
              description="Rèn luyện cả 4 kỹ năng với bài tập thực hành có mục tiêu"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />}
              title="Theo dõi tiến độ"
              description="Giám sát sự tiến bộ với phân tích chi tiết"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />}
              title="Cộng đồng học tập"
              description="Cạnh tranh và học hỏi cùng hàng nghìn học viên"
            />
          </div>
        </div>

        {/* Stats Section */}
        <StatsSection />

        {/* Why Choose Section */}
        <WhyChooseSection />

        {/* Testimonials Section */}
        <TestimonialsSection />
        
        {/* CTA Section with gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-background/10 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-background/10 rounded-full blur-3xl" />
          
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                Sẵn sàng bắt đầu hành trình IELTS?
              </h2>
              <p className="text-base sm:text-lg opacity-95 leading-relaxed">
                Tham gia cùng hàng nghìn học viên đã đạt mục tiêu IELTS của họ
              </p>
              <div className="pt-4">
                <Link href="/register">
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    className="px-8 text-base sm:text-lg h-12 sm:h-14 bg-background text-primary hover:bg-background/95 shadow-lg shadow-black/10 transition-all duration-200 hover:shadow-xl hover:scale-105"
                  >
                    Đăng ký ngay
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: "Nguyễn Văn A",
      role: "Học viên IELTS 7.5",
      content: "Nhờ IELTSGo, tôi đã cải thiện điểm số từ 5.5 lên 7.5 chỉ sau 3 tháng. Giáo trình rất chi tiết và dễ hiểu!",
      rating: 5,
      avatar: "NV"
    },
    {
      name: "Trần Thị B",
      role: "Học viên IELTS 8.0",
      content: "Nền tảng này giúp tôi luyện tập mọi lúc mọi nơi. Bài tập đa dạng và theo dõi tiến độ rất rõ ràng.",
      rating: 5,
      avatar: "TT"
    },
    {
      name: "Lê Văn C",
      role: "Học viên IELTS 7.0",
      content: "Video bài giảng chất lượng cao, giáo viên giải thích rất dễ hiểu. Tôi đặc biệt thích phần luyện tập theo kỹ năng.",
      rating: 5,
      avatar: "LV"
    },
  ]

  return (
    <div className="relative bg-background overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Star className="w-5 h-5 text-primary fill-primary" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Học viên nói gì về chúng tôi
            </h2>
            <Star className="w-5 h-5 text-primary fill-primary" />
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Hàng nghìn học viên đã đạt mục tiêu IELTS của mình với IELTSGo
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group relative border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-5 sm:p-6">
                <div className="space-y-4">
                  {/* Quote icon */}
                  <div className="flex items-start justify-between">
                    <Quote className="w-8 h-8 text-primary/20 flex-shrink-0" />
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                      ))}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <p className="text-sm text-foreground leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
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
    <div className="group relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-6 sm:p-8 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 flex flex-col items-center text-center h-full">
      {/* Subtle gradient on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-transparent group-hover:to-transparent transition-all duration-300" />
      
      <div className="relative mb-5 sm:mb-6 flex-shrink-0">
        <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300">
          {icon}
        </div>
      </div>
      <h3 className="relative text-base sm:text-lg font-semibold mb-3 text-foreground leading-tight">
        {title}
      </h3>
      <p className="relative text-sm text-muted-foreground leading-relaxed flex-grow">
        {description}
      </p>
    </div>
  )
}

function StatsSection() {
  const stats = [
    { 
      icon: Users, 
      value: "10,000+", 
      label: "Học viên đang học", 
      iconBg: "bg-blue-100 dark:bg-blue-950",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    { 
      icon: BookOpen, 
      value: "50+", 
      label: "Khóa học chất lượng", 
      iconBg: "bg-green-100 dark:bg-green-950",
      iconColor: "text-green-600 dark:text-green-400"
    },
    { 
      icon: Target, 
      value: "500+", 
      label: "Bài tập thực hành", 
      iconBg: "bg-purple-100 dark:bg-purple-950",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    { 
      icon: Award, 
      value: "95%", 
      label: "Tỷ lệ đạt mục tiêu", 
      iconBg: "bg-primary/10 dark:bg-primary/20",
      iconColor: "text-primary"
    },
  ]

  return (
    <div className="relative bg-gradient-to-b from-background via-accent/20 to-background overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 right-20 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-3">
              <div className="flex justify-center">
                <div className={`p-4 rounded-xl ${stat.iconBg}`}>
                  <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function WhyChooseSection() {
  const benefits = [
    {
      icon: CheckCircle2,
      title: "Giáo trình chuẩn quốc tế",
      description: "Được thiết kế bởi đội ngũ chuyên gia IELTS có kinh nghiệm nhiều năm",
    },
    {
      icon: Clock,
      title: "Học mọi lúc mọi nơi",
      description: "Truy cập từ mọi thiết bị, học theo tốc độ của bạn",
    },
    {
      icon: TrendingUp,
      title: "Tiến độ rõ ràng",
      description: "Theo dõi điểm số và cải thiện từng kỹ năng một cách chi tiết",
    },
    {
      icon: Star,
      title: "Lộ trình cá nhân hóa",
      description: "Học theo trình độ và mục tiêu band score của bạn",
    },
    {
      icon: PlayCircle,
      title: "Video bài giảng chất lượng",
      description: "Học từ các video được ghi lại bởi giáo viên chuyên nghiệp",
    },
    {
      icon: Award,
      title: "Chứng chỉ hoàn thành",
      description: "Nhận chứng chỉ khi hoàn thành khóa học để thêm vào CV",
    },
  ]

  return (
    <div className="relative bg-gradient-to-b from-background via-accent/20 to-background overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Tại sao chọn <BrandText className="text-2xl sm:text-3xl md:text-4xl inline-block" />?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Nền tảng học IELTS toàn diện giúp bạn đạt band score mong muốn một cách hiệu quả nhất
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="group relative border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300 flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 text-center">
          <Link href="/courses">
            <Button size="lg" variant="outline" className="group bg-background/80 backdrop-blur-sm">
              Khám phá khóa học
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
