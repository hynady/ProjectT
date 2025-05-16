import React, { useEffect, useState } from "react";
import { serverTimeService } from "@/commons/services/server-time.service";
import { format } from "date-fns";
import { Clock } from "lucide-react";

interface ServerClockProps {
  className?: string;
  format?: string;
}

export const ServerClock: React.FC<ServerClockProps> = ({
  className,
  format: formatString = "HH:mm:ss",
}) => {
  const [clientTime, setClientTime] = useState<Date>(new Date());
  const [serverTime, setServerTime] = useState<Date>(new Date());
  const [timeDifference, setTimeDifference] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch server time once when component mounts
  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const serverTimeResponse = await serverTimeService.getServerTime();
        const clientTimeNow = new Date();
        
        // Calculate difference between server and client time
        const diff = serverTimeResponse.getTime() - clientTimeNow.getTime();
        setTimeDifference(diff);
        setServerTime(serverTimeResponse);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching server time:", error);
        setIsLoading(false);
      }
    };

    fetchServerTime();
  }, []);

  // Update client time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setClientTime(now);
      
      // Update server time based on the time difference
      const adjustedServerTime = new Date(now.getTime() + timeDifference);
      setServerTime(adjustedServerTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeDifference]);

  return (
    <div className={`flex flex-col space-y-1 text-sm ${className}`}>
      <div className="flex items-center gap-1">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium">Giờ hệ thống</span>
      </div>
      <div className="flex flex-col xs:flex-row xs:gap-4">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Client:</span>
          <span>{isLoading ? "..." : format(clientTime, formatString)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Server:</span>
          <span>{isLoading ? "..." : format(serverTime, formatString)}</span>
        </div>
      </div>
    </div>
  );
};
