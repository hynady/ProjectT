import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { EventsTable } from "./components/OccaList";
import { Button } from "@/commons/components/button";
import { Input } from "@/commons/components/input";
import {
  PlusCircle,
  Search,
} from "lucide-react";

const OrganizePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateNew = () => {
    navigate("/organize/create");
  };

  return (
    <DashboardLayout>
      <div className="h-fit flex flex-col gap-4">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Quản lý sự kiện</h2>
            <p className="text-muted-foreground">
              Tạo và quản lý các sự kiện của bạn
            </p>
          </div>
          <div>
            <Button onClick={handleCreateNew} className="gap-1.5">
              <PlusCircle className="h-4 w-4" />
              Tạo sự kiện mới
            </Button>
          </div>
        </header>
        
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm sự kiện..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="rounded-md border flex-1 flex flex-col h-[calc(100vh-13rem)] bg-background overflow-hidden">
          <EventsTable 
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrganizePage;
