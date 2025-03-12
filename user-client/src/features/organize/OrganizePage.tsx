import { useState } from "react";
import { Button } from "@/commons/components/button";
import { Card, CardContent } from "@/commons/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/commons/components/tabs";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OccaList } from "./components/OccaList";

const OrganizePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");

  const handleCreateNew = () => {
    navigate("/organize/create");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý sự kiện</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý các sự kiện của bạn
          </p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Tạo sự kiện mới
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs
            defaultValue="upcoming"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="upcoming">Sắp diễn ra</TabsTrigger>
              <TabsTrigger value="past">Đã kết thúc</TabsTrigger>
              <TabsTrigger value="draft">Bản nháp</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              <OccaList 
                type="upcoming" 
                organizerId="current-user-id" 
              />
            </TabsContent>
            <TabsContent value="past">
              <OccaList 
                type="past" 
                organizerId="current-user-id" 
              />
            </TabsContent>
            <TabsContent value="draft">
              <OccaList 
                type="draft" 
                organizerId="current-user-id" 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizePage;
