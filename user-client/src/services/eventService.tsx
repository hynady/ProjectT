import { EventData, Category, Venue } from '@/types';
import { heroCarouselEvents, featuredEvents, upcomingEvents, categories, venues } from './mockData';

export const getHeroEvents = async (): Promise<EventData[]> => {
  return new Promise<EventData[]>((resolve) => {
    setTimeout(() => resolve(heroCarouselEvents), 1000);
  });
};

export const getFeaturedEvents = async (): Promise<EventData[]> => {
  return new Promise<EventData[]>((resolve) => {
    setTimeout(() => resolve(featuredEvents), 1000);
  });
};

export const getUpcomingEvents = async (): Promise<EventData[]> => {
  return new Promise<EventData[]>((resolve) => {
    setTimeout(() => resolve(upcomingEvents), 1000);
  });
};

export const getCategories = async (): Promise<Category[]> => {
  return new Promise<Category[]>((resolve) => {
    setTimeout(() => resolve(categories), 1000);
  });
};

export const getVenues = async (): Promise<Venue[]> => {
  return new Promise<Venue[]>((resolve) => {
    setTimeout(() => resolve(venues), 1000);
  });
};