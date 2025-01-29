import {Popover, PopoverContent, PopoverTrigger} from "@radix-ui/react-popover";
import {Card, CardContent, CardHeader, CardTitle} from "@/commons/components/card.tsx";
import {Button} from "@/commons/components/button.tsx";


const DevToolbar: React.FC = () => {
  // Chỉ hiển thị trong môi trường phát triển
  if (import.meta.env.MODE !== "production") {
    return null;
  }

  const envVariables = {
    "App Name": import.meta.env.VITE_API_BASE_URL || "Not set",
    "API URL": import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "Not set",
    "Debug Mode": import.meta.env.VITE_DEBUG || "false",
    "Environment Mode": import.meta.env.MODE || "Not set",
    "Enable Mock": import.meta.env.VITE_ENABLE_MOCK || "Not set",
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 rounded-full bg-blue-500 text-white hover:bg-blue-600"
          aria-label="Open Developer Toolbar"
        >
          ⚙️
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px]">
        <Card>
          <CardHeader>
            <CardTitle>Developer Toolbar</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Object.entries(envVariables).map(([key, value]) => (
                <li key={key} className="text-sm">
                  <strong>{key}:</strong> {value.toString()}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default DevToolbar;
