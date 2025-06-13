import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CategorySectionUnit } from "@/features/home/internal-types/home";
import { useTracking } from "@/features/tracking";
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  Sparkles, 
  ArrowRight,
  AlertCircle,
  FileQuestion
} from "lucide-react";

interface CategorySectionProps {
  categories: CategorySectionUnit[] | null;
  isLoading: boolean;
  error: string | null;
}

// Animated counter with smooth counting effect
const AnimatedCounter: React.FC<{ 
  count: number; 
  duration?: number;
  delay?: number;
}> = ({ count, duration = 1200, delay = 0 }) => {  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {    const timer = setTimeout(() => {
      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing function for smoother animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setDisplayCount(Math.floor(easeOutQuart * count));
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);
      
      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, delay);

    return () => clearTimeout(timer);
  }, [count, duration, delay]);
  return (
    <span className="tabular-nums transition-all duration-300">
      {displayCount.toLocaleString('vi-VN')}
    </span>
  );
};

// Modern loading skeleton
const ModernSkeleton: React.FC = () => (
  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 h-32">
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          ))}
        </div>
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
  </div>
);

// Enhanced category card component
const CategoryCard: React.FC<{
  category: CategorySectionUnit;
  index: number;
  onClick: () => void;
}> = ({ category, index, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getEventTier = (count: number) => {
    if (count >= 100) return 'premium';
    if (count >= 50) return 'popular';
    if (count >= 20) return 'active';
    return 'basic';
  };
  const getTierConfig = (tier: string) => {
    const configs = {
      premium: {
        icon: TrendingUp,
        iconColor: 'text-emerald-600',
        bgGradient: 'from-emerald-50/80 via-white/50 to-emerald-50/30 dark:from-emerald-900/20 dark:via-slate-800/50 dark:to-emerald-900/10',
        borderColor: 'border-emerald-200/60 dark:border-emerald-700/40',
        badgeBg: 'bg-emerald-100/80 dark:bg-emerald-900/30',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
        badgeBorder: 'border-emerald-200 dark:border-emerald-700/40',
        glowColor: 'shadow-emerald-100 dark:shadow-emerald-900/20',
        hoverGlow: 'hover:shadow-emerald-200/50 dark:hover:shadow-emerald-800/30'
      },
      popular: {
        icon: Users,
        iconColor: 'text-blue-600 dark:text-blue-400',
        bgGradient: 'from-blue-50/80 via-white/50 to-blue-50/30 dark:from-blue-900/20 dark:via-slate-800/50 dark:to-blue-900/10',
        borderColor: 'border-blue-200/60 dark:border-blue-700/40',
        badgeBg: 'bg-blue-100/80 dark:bg-blue-900/30',
        badgeText: 'text-blue-700 dark:text-blue-300',
        badgeBorder: 'border-blue-200 dark:border-blue-700/40',
        glowColor: 'shadow-blue-100 dark:shadow-blue-900/20',
        hoverGlow: 'hover:shadow-blue-200/50 dark:hover:shadow-blue-800/30'
      },
      active: {
        icon: Calendar,
        iconColor: 'text-amber-600 dark:text-amber-400',
        bgGradient: 'from-amber-50/80 via-white/50 to-amber-50/30 dark:from-amber-900/20 dark:via-slate-800/50 dark:to-amber-900/10',
        borderColor: 'border-amber-200/60 dark:border-amber-700/40',
        badgeBg: 'bg-amber-100/80 dark:bg-amber-900/30',
        badgeText: 'text-amber-700 dark:text-amber-300',
        badgeBorder: 'border-amber-200 dark:border-amber-700/40',
        glowColor: 'shadow-amber-100 dark:shadow-amber-900/20',
        hoverGlow: 'hover:shadow-amber-200/50 dark:hover:shadow-amber-800/30'
      },
      basic: {
        icon: Calendar,
        iconColor: 'text-gray-500 dark:text-gray-400',
        bgGradient: 'from-gray-50/80 via-white/50 to-gray-50/30 dark:from-gray-800/40 dark:via-slate-800/50 dark:to-gray-800/20',
        borderColor: 'border-gray-200/60 dark:border-gray-700/40',
        badgeBg: 'bg-gray-100/80 dark:bg-gray-800/50',
        badgeText: 'text-gray-600 dark:text-gray-300',
        badgeBorder: 'border-gray-200 dark:border-gray-700/40',
        glowColor: 'shadow-gray-100 dark:shadow-gray-900/20',
        hoverGlow: 'hover:shadow-gray-200/50 dark:hover:shadow-gray-700/30'
      }
    };
    return configs[tier as keyof typeof configs];
  };

  const tier = getEventTier(category.count);
  const config = getTierConfig(tier);
  const IconComponent = config.icon;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl cursor-pointer
        bg-gradient-to-br ${config.bgGradient}
        border ${config.borderColor}
        shadow-lg ${config.glowColor} ${config.hoverGlow}
        transition-all duration-500 ease-out
        hover:-translate-y-3 hover:scale-[1.02]
        ${isHovered ? 'shadow-2xl' : ''}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      
      {/* Content */}
      <div className="relative p-6 h-full flex flex-col justify-between">        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300 leading-tight">
            {category.name}
          </h3>
          <ArrowRight className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-all duration-300 ${
            isHovered ? 'translate-x-1 text-gray-600 dark:text-gray-300' : ''
          }`} />
        </div>

        {/* Event count badge */}
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl
            ${config.badgeBg} ${config.badgeText} border ${config.badgeBorder}
            transition-all duration-300 ${isHovered ? 'scale-105 shadow-sm' : ''}
          `}>
            <div className={`transition-all duration-300 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
              <IconComponent className={`w-4 h-4 ${config.iconColor}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-none">
                <AnimatedCounter count={category.count} delay={index * 150} />
              </span>
              <span className="text-xs opacity-75 leading-none mt-0.5">sự kiện</span>
            </div>
          </div>

          {/* Activity dots */}
          <div className="flex items-center gap-1">
            {[...Array(Math.min(4, Math.ceil(category.count / 25)))].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  isHovered 
                    ? `${config.iconColor.replace('text-', 'bg-')} opacity-100 scale-125` 
                    : 'bg-gray-300 opacity-40'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Premium tier sparkle effect */}
        {tier === 'premium' && (
          <Sparkles className={`absolute top-4 right-4 w-5 h-5 text-emerald-400 transition-all duration-300 ${
            isHovered ? 'opacity-100 scale-110 rotate-12' : 'opacity-60'
          }`} />
        )}
      </div>      {/* Hover shine effect */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent -translate-x-full transition-transform duration-700 ${
        isHovered ? 'translate-x-full' : ''
      }`}></div>
    </div>
  );
};

// Error state component
const ErrorState: React.FC<{ error: string }> = ({ error }) => (
  <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
    <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6">
      <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Đã có lỗi xảy ra</h3>
    <p className="text-gray-600 dark:text-gray-300 max-w-md leading-relaxed">{error}</p>
    <button 
      onClick={() => window.location.reload()} 
      className="mt-6 px-6 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors duration-200"
    >
      Thử lại
    </button>
  </div>
);

// Empty state component
const EmptyState: React.FC = () => (
  <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
    <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-6">
      <FileQuestion className="w-10 h-10 text-gray-400 dark:text-gray-500" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Chưa có danh mục nào</h3>
    <p className="text-gray-600 dark:text-gray-300 max-w-md leading-relaxed">
      Hiện tại chưa có danh mục sự kiện nào. Hãy quay lại sau nhé!
    </p>
  </div>
);

// Main CategorySection component
export const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  isLoading,
  error,
}) => {
  const navigate = useNavigate();
  const { trackCategoryClick } = useTracking();

  const handleCategoryClick = (categoryId: string) => {
    trackCategoryClick(categoryId);
    navigate(`/search?categoryId=${categoryId}`);
  };  // Loading state with modern skeletons
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <ModernSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="grid grid-cols-1">
        <ErrorState error={error} />
      </div>
    );
  }

  // Empty state
  if (!categories || categories.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <EmptyState />
      </div>
    );
  }

  // Invalid data state
  if (!Array.isArray(categories)) {
    return (
      <div className="grid grid-cols-1">
        <ErrorState error="Dữ liệu không hợp lệ. Vui lòng thử lại sau." />
      </div>
    );
  }  // Main content with categories grid only
  return (
    <div className="transition-opacity duration-500 ease-in-out">
      {/* Categories grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories
          .sort((a, b) => b.count - a.count) // Sắp xếp theo số lượng sự kiện giảm dần
          .slice(0, 8) // Chỉ hiển thị tối đa 8 categories
          .map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              onClick={() => handleCategoryClick(category.id)}
            />
          ))}
      </div>
    </div>
  );
};
