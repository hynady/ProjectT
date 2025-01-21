import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export const OccaDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-background py-6">
      {/* Hero Section Skeleton */}
      <div className="relative h-[80vh]">
        <Skeleton className="absolute inset-0" />
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 md:p-8">
          <div className="container mx-auto max-w-6xl">
            <Card className="p-6">
              <div className="space-y-4">
                {/* Badge Skeleton */}
                <div className="hidden sm:flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-5 w-16" />
                  ))}
                </div>

                {/* Title Skeleton */}
                <Skeleton className="h-8 sm:h-10 w-3/4" />

                {/* Artist Skeleton */}
                <Skeleton className="h-6 w-1/2" />

                {/* Event Details Skeleton */}
                <div className="hidden sm:flex gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content Skeleton */}
          <div className="lg:col-span-2">
            {/* Tabs Skeleton */}
            <div className="flex gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>

            {/* Content Skeleton */}
            <div className="space-y-8">
              <Card className="p-6">
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Organizer Skeleton */}
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="space-y-6">
                <Skeleton className="h-6 w-40" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-12" />
                    <div className="space-y-2 mt-2">
                      {[1, 2, 3].map((j) => (
                        <Card key={j} className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-9 w-16" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
                <Skeleton className="h-12 w-full" />
              </div>
            </Card>
          </div>
        </div>

        {/* Gallery and Location Section Skeleton */}
        <Card className="p-4 lg:p-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gallery Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-[300px] sm:h-[400px] lg:h-[500px] w-full" />
            </div>

            {/* Location Skeleton */}
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="aspect-video w-full" />
              <Card className="p-3 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
              </Card>
            </div>
          </div>
        </Card>

        {/* FAQs Section Skeleton */}
        <section className="mt-8">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-5 w-full" />
              </Card>
            ))}
          </div>
        </section>

        {/* Related Events Section Skeleton */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="space-y-4">
                  <Skeleton className="w-full aspect-[16/9]" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Bottom CTA Skeleton */}
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-muted p-4 lg:hidden">
          <div className="container flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>
      </main>
    </div>
  );
};