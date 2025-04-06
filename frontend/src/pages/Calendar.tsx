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
  CardFooter,
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
import {
  Copy,
  Trash2,
  Loader2,
  Calendar as CalendarIcon,
  Clock,
  User,
  FileText,
  ArrowRight,
  Link,
} from "lucide-react";
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
  const [isCreating, setIsCreating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

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
  // useEffect(() => {
  //   const checkGoogle = async () => {
  //     try {
  //       const res = await api.get("/google/status");
  //       setConnected(res.data.connected);
  //       if (res.data.connected) await fetchEventss(); // <-- fetchEventss instead of fetchEvents
  //     } catch {
  //       toast.error("Google connection failed");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   checkGoogle();
  // }, []);
  

  const fetchEvents = async () => {
    try {
      const res = await api.get("/meetings/all");
  
      const formattedEvents = res.data
        .filter((meeting: any) => ["pending", "confirmed"].includes(meeting.status))
        .map((meeting: any) => ({
          id: meeting._id,
          summary: meeting.title,
          description: meeting.description,
          start: {
            dateTime: dayjs(meeting.date).format("YYYY-MM-DD") + "T" + meeting.startTime,
          },
          end: {
            dateTime: dayjs(meeting.date).format("YYYY-MM-DD") + "T" + meeting.endTime,
          },
          hangoutLink: meeting.meetLink,
          status: meeting.status,
        }));
  
      setEvents(formattedEvents);
    } catch {
      toast.error("Failed to fetch meetings.");
    }
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

    setIsCreating(true);
    try {
      const res = await api.post("/meetings/create", {
        title,
        description,
        guestEmail,
        date,
        startTime,
        endTime,
      });

      setMeetingId(res.data.id);
      setMeetLink(res.data.link); // Invitation link for the invitee
      toast.success("Meeting created! Share invite link for confirmation.");
    } catch {
      toast.error("Meeting creation failed");
    } finally {
      setIsCreating(false);
    }
  };

  const handleConfirmMeeting = async () => {
    if (!meetingId) return;

    setIsConfirming(true);
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

      // Reset form after successful confirmation
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setGuestEmail("");
        setDate(dayjs().format("YYYY-MM-DD"));
        setStartTime("10:00");
        setEndTime("11:00");
        setMeetingId(null);
        setMeetLink(null);
      }, 3000);
    } catch {
      toast.error("Confirmation failed");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelMeeting = async (meetingId: string) => {
    try {
      await api.delete(`/meetings/${meetingId}`); // Use meeting ID (DB _id)
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
🕒 ${dayjs(event.start.dateTime).format("h:mm A")} - ${dayjs(
      event.end.dateTime
    ).format("h:mm A")}
🔗 ${event.hangoutLink || "No Link"}`;
    navigator.clipboard.writeText(info);
    toast.success("Copied meeting info!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your calendar...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Schedule Meeting
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your meetings and schedule new ones
          </p>
        </div>
        {connected && (
          <Badge
            variant="outline"
            className="py-1.5 px-3 text-sm bg-green-50 text-green-700 border-green-200"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            Connected to Google
          </Badge>
        )}
      </div>

      {!connected ? (
        <Card className="border-2 border-dashed border-muted-foreground/30 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarIcon className="h-16 w-16 text-muted-foreground/60 mb-4" />
            <h2 className="text-xl font-medium mb-2">Connect Your Calendar</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Connect your Google Calendar to start scheduling meetings and
              managing your events.
            </p>
            <Button
              size="lg"
              onClick={handleConnectGoogle}
              className="font-semibold"
            >
              Connect Google Calendar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Form */}
          <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10 pb-6">
              <CardTitle className="text-2xl flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" /> New Meeting
              </CardTitle>
              <CardDescription>
                Schedule a new meeting and invite guests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" /> Title
                </label>
                <Input
                  placeholder="Meeting title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />{" "}
                  Description
                </label>
                <Textarea
                  placeholder="Meeting description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" /> Guest
                </label>
                <Input
                  type="email"
                  placeholder="guest@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />{" "}
                    Date
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" /> Time
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="h-11"
                    />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 border-t bg-muted/10">
              <Button
                onClick={handleCreateMeeting}
                className="w-full sm:w-auto"
                size="lg"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Meeting"
                )}
              </Button>

              {meetingId && (
                <Button
                  variant="secondary"
                  onClick={handleConfirmMeeting}
                  className="w-full sm:w-auto"
                  size="lg"
                  disabled={isConfirming}
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    "Confirm & Generate Link"
                  )}
                </Button>
              )}
            </CardFooter>

            {meetLink && (
              <div className="px-4 pb-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 flex items-center gap-3">
                  <Link className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-sm mb-1">Invitation Link:</p>
                    <a
                      href={meetLink}
                      target="_blank"
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm truncate block"
                    >
                      {meetLink}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Events */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Upcoming Meetings</h2>
            <div className="space-y-4 pt-2">
              {events.length === 0 ? (
                <Card className="border border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground/60 mb-4" />
                    <h3 className="text-lg font-medium">No meetings found</h3>
                    <p className="text-muted-foreground max-w-md mt-1">
                      Your scheduled meetings will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {events.map((event) => (
                    <Card
                      key={event.id}
                      className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div>
                            <div className="flex items-start gap-2">
                              <CardTitle>{event.summary}</CardTitle>
                              <Badge
                                variant={
                                  event.hangoutLink ? "default" : "secondary"
                                }
                                className="ml-2"
                              >
                                {event.hangoutLink ? "Confirmed" : "Pending"}
                              </Badge>
                            </div>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <CalendarIcon className="h-3.5 w-3.5" />
                              {dayjs(event.start.dateTime).format(
                                "MMM D, YYYY"
                              )}
                              <span className="mx-1">•</span>
                              <Clock className="h-3.5 w-3.5" />
                              {dayjs(event.start.dateTime).format(
                                "h:mm A"
                              )} - {dayjs(event.end.dateTime).format("h:mm A")}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      {event.description && (
                        <CardContent className="py-2">
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        </CardContent>
                      )}

                      <CardFooter className="flex justify-between items-center pt-2 pb-4 border-t">
                        {event.hangoutLink ? (
                          <a
                            href={event.hangoutLink}
                            target="_blank"
                            className="text-primary hover:text-primary/90 hover:underline text-sm flex items-center gap-2"
                          >
                            <Link className="w-4 h-4" />
                            Join Google Meet
                          </a>
                        ) : (
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Awaiting confirmation
                            </p>
                            <a
                              href={`https://calendly-meet-app-fe.onrender.com/confirm/${event.id}`}
                              target="_blank"
                              className="text-blue-600 underline text-sm hover:text-blue-800"
                            >
                              Share invitation link
                            </a>
                          </div>
                        )}

                        <div className="flex gap-2 ml-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(event)}
                            className="h-8 px-2"
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Copy</span>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 px-2"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Cancel</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Cancel Meeting?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will delete the meeting "{event.summary}"
                                  from Google Calendar and your database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  Keep Meeting
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelMeeting(event.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Cancel Meeting
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
