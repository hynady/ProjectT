import React, { useEffect, useState } from "react";
import { serverTimeService } from "@/commons/services/server-time.service";
import { format, isValid } from "date-fns";
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
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const [timeDifference, setTimeDifference] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // Safely format a date, handling invalid dates
  const safeFormat = (date: Date | null, formatStr: string): string => {
    if (!date || !isValid(date)) {
      return "Invalid time";
    }
    try {
      return format(date, formatStr);
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Format error";
    }
  };

  // Fetch server time once when component mounts
  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const serverTimeResponse = await serverTimeService.getServerTime();

        // Validate the received date
        if (!serverTimeResponse || !isValid(serverTimeResponse)) {
          console.error("Invalid date received:", serverTimeResponse);
          throw new Error("Received invalid date from server");
        }

        const clientTimeNow = new Date();

        // Calculate difference between server and client time
        const diff = serverTimeResponse.getTime() - clientTimeNow.getTime();
        setTimeDifference(diff);
        setServerTime(serverTimeResponse);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching server time:", error);
        setError(true);
        setIsLoading(false);
        // Set server time to client time as fallback
        setServerTime(new Date());
      }
    };

    fetchServerTime();
  }, []);

  // Update client time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setClientTime(now);

      // Only update server time if we have a valid time difference
      if (!error) {
        try {
          // Update server time based on the time difference
          const adjustedServerTime = new Date(now.getTime() + timeDifference);

          // Validate the adjusted time
          if (isValid(adjustedServerTime)) {
            setServerTime(adjustedServerTime);
          }
        } catch (err) {
          console.error("Error updating server time:", err);
          setError(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeDifference, error]);

  return (
    <div className={`flex flex-col space-y-1 text-sm ${className}`}>
      <div className="flex items-center gap-1">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium">Giờ hệ thống</span>
      </div>
      <div className="flex flex-col xs:flex-row xs:gap-4">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Client:</span>
          <span>{isLoading ? "..." : safeFormat(clientTime, formatString)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Server:</span>
          <span>
            {isLoading
              ? "..."
              : error
              ? safeFormat(clientTime, formatString) // Use client time as fallback
              : safeFormat(serverTime, formatString)}
          </span>
        </div>
      </div>
    </div>
  );
};
