import {Outlet, useNavigate} from "react-router-dom";
import {Card} from "@/commons/components/card.tsx";
import {Button} from "@/commons/components/button.tsx";
import {ArrowLeft} from "lucide-react";
import {TermsAndPolicy} from "@/features/auth/components/TermsAndPolicy.tsx";

export const AuthCard = () => {
  const navigate = useNavigate(); // Gọi hook useNavigate trực tiếp trong component

  return (
    <div className="relative z-10 flex px-10 py-12 w-full">
      <Card className="w-full max-w-[400px] p-6 sm:p-8 shadow-2xl transition-all duration-300 hover:shadow-3xl z-50">
        <Button onClick={() => navigate('/')} variant="link" className="px-0 py-0">
          <ArrowLeft/>
          <span>Quay về Trang chủ</span>
        </Button>
        <Outlet/>
        <TermsAndPolicy/>
      </Card>
    </div>
  )
}