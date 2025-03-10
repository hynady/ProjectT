import React from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/commons/components/card.tsx";
import { Button } from "@/commons/components/button.tsx";
import { Skeleton } from "@/commons/components/skeleton.tsx";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OccaCardUnit } from "@/features/home/internal-types/home";
import { Separator } from "@/commons/components/separator";
import { TicketStamp } from "@/features/home/components/TicketStamp";

interface OccaCardProps {
  occa: OccaCardUnit;
  loading: boolean;
}

export const OccaCard: React.FC<OccaCardProps> = ({ occa, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-2">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  const handleCardClick = () => {
    navigate(`/occas/${occa.id}`);
  };

  const handleBuyTicket = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to parent card
    navigate(`/occas/${occa.id}/booking`);
  };

  return (
    <Card
      className="relative group cursor-pointer w-full hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full"
      onClick={handleCardClick}
    >
      {/* Watermark */}
      <TicketStamp />

      <CardHeader className="relative z-10 p-0">
        <div className="relative overflow-hidden">
          <img
            src={occa.image}
            alt={occa.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/600x400/8b5cf6/f5f3ff?text=No+Image";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </CardHeader>

      <CardContent className="relative z-10 p-6 pb-2 flex flex-col h-full">
        <CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors mb-2">
          {occa.title}
        </CardTitle>

        <div className="flex-1 flex flex-col justify-center space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{occa.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{occa.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{occa.location}</span>
          </div>
        </div>

        <div className="font-bold text-xl text-primary pt-3 pb-3 text-right">
          <Separator orientation="horizontal" className="my-2" />
          <span className="text-xl font-mono">Từ</span> {isNaN(occa.price) ? "NaN" : occa.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        </div>
      </CardContent>

      <CardFooter className="relative z-10">
        <Button
          className="w-full group-hover:bg-primary/90"
          variant="default"
          onClick={handleBuyTicket}
        >
          <span>Mua vé ngay</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};
