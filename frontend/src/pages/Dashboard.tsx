import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import dayjs from "dayjs";

type MeetingLog = {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  meetLink?: string;
  status: string;
};

export default function Dashboard() {
  const [logs, setLogs] = useState<MeetingLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/meetings/logs");
        setLogs(res.data);
      } catch (err) {
        toast.error("Failed to fetch meeting logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleCopyLink = (link?: string) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast.success("Meeting link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading meeting logs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-4">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent text-center">
        Meeting Logs
      </h1>
      {logs.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <p className="text-base font-medium text-gray-500">
              No meeting logs available.
            </p>
          </CardContent>
        </Card>
      ) : (
        logs.map((log, index) => (
          <Card
            key={log.id ? `meeting-${log.id}` : `meeting-${index}`}
            className="overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 p-2">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <div>
                  <CardTitle className="text-lg font-semibold text-white">
                    {log.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-white/90">
                    {dayjs(log.date).format("MMM D, YYYY")} | {log.startTime} -{" "}
                    {log.endTime}
                  </CardDescription>
                  {log.description && (
                    <p className="mt-1 text-xs text-white/80">
                      {log.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    className={
                      log.status === "Confirmed"
                        ? "bg-green-800 text-white font-bold px-2 py-0.5 rounded"
                        : "bg-gray-300 text-gray-800 font-bold px-2 py-0.5 rounded"
                    }
                  >
                    {log.status}
                  </Badge>
                  {log.meetLink && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyLink(log.meetLink)}
                      title="Copy Link"
                      className="hover:text-blue-2400"
                    >
                      Copy
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            {log.meetLink && (
              <CardContent className="p-2 bg-white">
                <a
                  href={log.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 text-sm font-semibold hover:underline"
                >
                  Join Google Meet
                </a>
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
