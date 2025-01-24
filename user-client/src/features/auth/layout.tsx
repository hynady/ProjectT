import {Background} from "./blocks/Background.tsx"
import {AuthCard} from "@/features/auth/blocks/AuthCard.tsx";
import {ThemeToggle} from "@/features/auth/components/ThemeToggle.tsx";

export const AuthLayout = () => {

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with Video */}
      <Background/>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center">
        <AuthCard/>
        <ThemeToggle/>
      </div>
    </div>
  )
}