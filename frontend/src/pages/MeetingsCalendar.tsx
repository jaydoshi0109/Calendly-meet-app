import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar as CalendarIcon, Clock, Video, ExternalLink } from "lucide-react";
import { Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";

type Event = {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
  hangoutLink?: string;
};

export default function MeetingsCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/meetings/all");
  
        const formattedEvents = res.data.map((meeting: any) => ({
          id: meeting._id,
          summary: meeting.title,
          description: meeting.description,
          start: { dateTime: `${dayjs(meeting.date).format("YYYY-MM-DD")}T${meeting.startTime}` },
          end: { dateTime: `${dayjs(meeting.date).format("YYYY-MM-DD")}T${meeting.endTime}` },
          hangoutLink: meeting.meetLink,
          status: meeting.status,
        }));
  
        setEvents(formattedEvents);
      } catch {
        console.error("Failed to fetch meetings");
      } finally {
        setLoading(false);
      }
    };
  
    fetchEvents();
  }, []);
  
  // Group events by date
  const groupedEvents = events.reduce<Record<string, Event[]>>((acc, event) => {
    const date = dayjs(event.start.dateTime).format("YYYY-MM-DD");
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  // Sort dates in ascending order
  const sortedDates = Object.keys(groupedEvents).sort((a, b) =>
    dayjs(a).isAfter(dayjs(b)) ? 1 : -1
  );

  // Updated filtering logic:
  const isPast = (date: string) => dayjs(date).isBefore(dayjs(), "day");
  const isUpcoming = (date: string) =>
    dayjs(date).isAfter(dayjs(), "day");

  const shouldShowDate = (date: string) => {
    if (filter === "all") return true;
    if (filter === "past") return isPast(date);
    if (filter === "upcoming") return isUpcoming(date);
  };

  // Calculate filtered dates based on the selected filter
  const filteredDates = sortedDates.filter((date) => shouldShowDate(date));

  // Check if any meeting dot should be displayed
  const getTileContent = ({ date }: { date: Date }) => {
    const day = dayjs(date).format("YYYY-MM-DD");
    const dayEvents = groupedEvents[day] || [];
    
    if (dayEvents.length === 0) return null;
    
    return (
      <div className="flex justify-center items-center mt-1">
        <div className="w-2 h-2 bg-primary rounded-full" />
        {dayEvents.length > 1 && (
          <div className="w-2 h-2 bg-primary rounded-full ml-0.5 opacity-70" />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your meetings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Meetings Calendar</h1>
        <p className="text-muted-foreground mt-2">View and manage your scheduled meetings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="shadow-md border overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarIcon className="h-5 w-5" />
                Calendar View
              </CardTitle>
              <CardDescription>
                Select a date to view meetings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Calendar
                onClickDay={(value) =>
                  setSelectedDate(dayjs(value).format("YYYY-MM-DD"))
                }
                tileContent={getTileContent}
                className="border-none shadow-none p-4"
              />
            </CardContent>
            <CardFooter className="border-t p-4 bg-muted/20">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    <div className="w-3 h-3 bg-primary rounded-full -ml-1 opacity-70" />
                  </div>
                  <span className="text-sm text-muted-foreground">Multiple meetings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span className="text-sm text-muted-foreground">Single meeting</span>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          <Card className="shadow-md border mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Filter Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" onValueChange={(val) => setFilter(val as any)} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedDate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  {dayjs(selectedDate).format("MMMM D, YYYY")}
                </h2>
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="text-sm text-muted-foreground hover:text-primary underline"
                >
                  Show all dates
                </button>
              </div>
              
              {(groupedEvents[selectedDate] || []).length === 0 ? (
                <Card className="shadow-md border border-dashed bg-muted/10">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No meetings scheduled</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      There are no meetings scheduled for this date. Select another date or view all meetings.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {(groupedEvents[selectedDate] || []).map((event) => (
                    <MeetingCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {filteredDates.length === 0 ? (
                <Card className="shadow-md border border-dashed bg-muted/10">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No meetings found</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      There are no meetings that match your current filter. Try changing the filter or select a date on the calendar.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredDates.map((date) => (
                  <div key={date} className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2 p-2 border-b">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      {dayjs(date).format("MMMM D, YYYY")}
                      <Badge 
                        variant={isPast(date) ? "outline" : "default"}
                        className={isPast(date) ? "bg-muted text-muted-foreground" : ""}
                      >
                        {isPast(date) ? "Past" : "Upcoming"}
                      </Badge>
                    </h2>
                    <div className="space-y-4">
                      {groupedEvents[date].map((event) => (
                        <MeetingCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Separate component for meeting cards to improve readability
function MeetingCard({ event }: { event: Event }) {
  const isConfirmed = Boolean(event.hangoutLink);
  const startTime = dayjs(event.start.dateTime);
  const endTime = dayjs(event.end.dateTime);
  const duration = endTime.diff(startTime, 'minute');
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-xl">{event.summary || "Untitled Meeting"}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {startTime.format("h:mm A")} - {endTime.format("h:mm A")}
              <span className="text-xs text-muted-foreground ml-1">
                ({duration} min)
              </span>
            </CardDescription>
          </div>
          <Badge 
            variant={isConfirmed ? "default" : "outline"} 
            className={`${isConfirmed ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-amber-100 text-amber-800 hover:bg-amber-200"} transition-colors`}
          >
            {isConfirmed ? "Confirmed" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      
      {event.hangoutLink && (
        <CardFooter className="pt-0 pb-4 px-6">
          <a
            href={event.hangoutLink}
            target="_blank"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <Video className="h-4 w-4" />
            <span>Join Meeting</span>
            <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </a>
        </CardFooter>
      )}
    </Card>
  );
}