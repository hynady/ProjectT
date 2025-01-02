import React from 'react';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { EventData as Event } from '@/types';

interface EventCardProps {
  event: Event;
  loading: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({event, loading}) => {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-2">
          <Skeleton className="h-48 w-full rounded-lg"/>
          <Skeleton className="h-4 w-3/4"/>
          <Skeleton className="h-4 w-1/2"/>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full"/>
          <Skeleton className="h-4 w-full"/>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group cursor-pointer w-full hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </CardTitle>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4"/>
            <span>{event.date}</span>
            <Clock className="w-4 h-4 ml-2"/>
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4"/>
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="font-medium text-primary">{event.price}</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full group-hover:bg-primary/90" variant="default">
          <span>Mua vé ngay</span>
          <ArrowRight className="w-4 h-4 ml-2"/>
        </Button>
      </CardFooter>
    </Card>
  );
};