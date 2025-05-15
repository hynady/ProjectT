import { Search } from "lucide-react";
import { Input } from "@/commons/components/input";
import { TicketManagementSharedProps, formatShowDateTime } from "./utils";

interface HeaderProps extends Pick<TicketManagementSharedProps, 'occaInfo' | 'showInfo'> {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header = ({ 
  occaInfo, 
  showInfo, 
  searchQuery, 
  setSearchQuery 
}: HeaderProps) => {
  return (
    <header className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          {occaInfo?.basicInfo.title || "Đang tải..."}
        </h2>
        <p className="text-muted-foreground">
          Quản lý vé cho suất diễn: {formatShowDateTime(showInfo?.date, showInfo?.time)}
        </p>
      </div>
      
      <div className="max-w-sm relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
          className="pl-8 w-[300px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </header>
  );
};
