import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Copy, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import dayjs from "dayjs";

type Event = {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string };
  end: { dateTime: string };
  hangoutLink?: string;
};

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");

  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [meetLink, setMeetLink] = useState<string | null>(null);

  useEffect(() => {
    const checkGoogle = async () => {
      try {
        const res = await api.get("/google/status");
        setConnected(res.data.connected);
        if (res.data.connected) await fetchEvents();
      } catch {
        toast.error("Google connection failed");
      } finally {
        setLoading(false);
      }
    };
    checkGoogle();
  }, []);

  const fetchEvents = async () => {
    const res = await api.get("/google/events");
    setEvents(res.data);
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await api.get("/google/auth");
      window.location.href = res.data.url;
    } catch {
      toast.error("Failed to connect");
    }
  };

  const handleCreateMeeting = async () => {
    if (!title || !guestEmail || !date || !startTime || !endTime) {
      toast.error("Fill all fields");
      return;
    }

    try {
      const res = await api.post("/meetings/create", {
        title,
        description,
        guestEmail,
        date,
        startTime,
        endTime,
      });

      const id = res.data.link.split("/").pop();
      setMeetingId(id);
      toast.success("Meeting created! Confirm to generate Meet link.");
    } catch {
      toast.error("Meeting creation failed");
    }
  };

  const handleConfirmMeeting = async () => {
    if (!meetingId) return;

    try {
      const res = await api.post(`/meetings/confirm/${meetingId}`, {
        title,
        description,
        guestEmail,
        date,
        startTime,
        endTime,
      });
      setMeetLink(res.data.meetLink);
      toast.success("Meeting confirmed!");
      await fetchEvents();
    } catch {
      toast.error("Confirmation failed");
    }
  };

  const handleCancelMeeting = async (calendarEventId: string) => {
    try {
      await api.delete(`/meetings/${calendarEventId}`);
      toast.success("Meeting cancelled");
      await fetchEvents();
    } catch {
      toast.error("Failed to cancel meeting");
    }
  };

  const handleCopy = (event: Event) => {
    const info = `📅 ${event.summary}
${event.description || ""}
🗓️ ${dayjs(event.start.dateTime).format("MMM D, YYYY")}
🕒 ${dayjs(event.start.dateTime).format("h:mm A")} - ${dayjs(event.end.dateTime).format("h:mm A")}
🔗 ${event.hangoutLink || "No Link"}`;
    navigator.clipboard.writeText(info);
    toast.success("Copied meeting info!");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Schedule Meeting</h1>

      {!connected ? (
        <Button onClick={handleConnectGoogle}>Connect Google Calendar</Button>
      ) : (
        <>
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Meeting Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Input type="email" placeholder="Guest Email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <div className="flex gap-2">
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleCreateMeeting}>Create Meeting</Button>
              {meetingId && <Button variant="secondary" onClick={handleConfirmMeeting}>Confirm & Generate Link</Button>}
              {meetLink && (
                <p className="text-sm text-green-600">
                  ✅ <a href={meetLink} target="_blank" className="underline text-blue-600">{meetLink}</a>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Events */}
          <div className="space-y-4 pt-6">
            {events.length === 0 ? (
              <p>No meetings found</p>
            ) : (
              events.map((event) => (
                <Card key={event.id}>
                  <CardHeader className="pb-2 flex flex-col md:flex-row md:justify-between">
                    <div>
                      <CardTitle>{event.summary}</CardTitle>
                      <CardDescription>
                        {dayjs(event.start.dateTime).format("MMM D, h:mm A")} -{" "}
                        {dayjs(event.end.dateTime).format("h:mm A")}
                      </CardDescription>
                      {event.description && <p className="text-sm">{event.description}</p>}
                    </div>
                    <Badge variant={event.hangoutLink ? "default" : "secondary"}>
                      {event.hangoutLink ? "Confirmed" : "Pending"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center gap-2">
                    {event.hangoutLink ? (
                      <a href={event.hangoutLink} target="_blank" className="text-blue-600 underline text-sm">
                        Join Google Meet
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">No Link</p>
                    )}
                    <div className="flex gap-2 ml-auto">
                      <Button size="icon" variant="ghost" onClick={() => handleCopy(event)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Meeting?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete the meeting from Google Calendar and DB.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCancelMeeting(event.id)}>
                              Confirm Cancel
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
