import { Outlet } from 'react-router-dom'
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Card } from '@/components/ui/card'

export const AuthLayout = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with Video */}
      <Background />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center">
        <AuthCard />
        <ThemeToggle />
      </div>
    </div>
  )
}

// Background Component with Video
const Background = () => (
  <>
    {/* Video Background */}
    <div className="absolute inset-0 z-0">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="h-full w-full object-cover"
      >
        <source
          src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          type="video/mp4"
        />
      </video>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />
    </div>
  </>
);

// Auth Card Component
const AuthCard = () => (
  <div className="relative z-10 flex px-10 py-12 w-full">
    <Card className="w-full max-w-[400px] p-6 sm:p-8 shadow-2xl transition-all duration-300 hover:shadow-3xl z-50">
      <Outlet />

      <TermsAndPolicy />
    </Card>
  </div>
)

// Terms and Policy Component
const TermsAndPolicy = () => (
  <p className="text-center text-xs sm:text-sm text-muted-foreground">
    By continue access, you agree to our
    <br/>
    <a
      href="/terms"
      className="underline underline-offset-4 hover:text-primary transition-colors duration-200"
    >
      Terms of Service
    </a>{" "}
    and{" "}
    <a
      href="/privacy"
      className="underline underline-offset-4 hover:text-primary transition-colors duration-200"
    >
      Privacy Policy
    </a>
    .
  </p>
)

// Theme Toggle Component
const ThemeToggle = () => (
  <div className="fixed bottom-4 right-4 z-50 transition-transform duration-200 hover:scale-110">
    <ModeToggle/>
  </div>
)