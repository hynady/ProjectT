import { 
  Mail, 
  Phone, 
  Ticket, 
  CalendarCheck 
} from "lucide-react";
import { cn } from "@/commons/lib/utils/utils";
import { ServerClock } from "@/commons/components/server-clock";

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const FooterLink = ({ href, children, className }: FooterLinkProps) => (
  <a 
    href={href} 
    className={cn(
      "text-sm text-muted-foreground transition-colors hover:text-primary hover:underline",
      className
    )}
  >
    {children}
  </a>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-card border-t dark:border-muted">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Company & Contact Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.svg" alt="TackTicket" className="h-20 w-auto" />
              <h3 className="text-2xl font-bold">TackTicket</h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Nền tảng quản lý và phân phối vé sự kiện
            </p>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <p className="font-medium">1900.1234</p>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:support@projectt.vn" className="hover:text-primary hover:underline">
                  support@tackicket.vn
                </a>
              </div>
            </div>
          </div>
          
          {/* Links */}
          <div className="space-y-4">
            <h3 className="font-medium text-base">Dịch vụ</h3>
            <ul className="space-y-2">
              <li>
                <FooterLink href="/organize" className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  <span>Tổ chức sự kiện</span>
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/ticket-check-in" className="flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  <span>Check-in vé</span>
                </FooterLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Footer */}      <div className="border-t">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {currentYear} ProjectT. Đang trong quá trình phát triển.
            </div>
            
            <ServerClock />
            
            <div className="flex space-x-4 text-sm">
              <span className="text-muted-foreground">VN | EN</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;