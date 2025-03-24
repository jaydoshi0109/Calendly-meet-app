import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMeeting } from "@/hooks/useMeetings";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// type Meeting = {
//   title: string;
//   description: string;
//   availableSlots: string[];
// };

export default function MeetingPage() {
  const { id } = useParams();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const { data: meeting, isLoading, isError } = useMeeting(id);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      if (!selectedSlot) return;
      await api.post(`/meeting/${id}/confirm`, { slot: selectedSlot });
      toast.success("Meeting confirmed!");
    } catch (err) {
      toast.error("Error confirming meeting.");
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return <p>Error loading meeting.</p>;
  }

  if (!meeting) {
    return <p>Meeting not found.</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
      <h1 className="text-2xl font-bold">{meeting.title}</h1>
      <p>{meeting.description}</p>
      {meeting.availableSlots.length === 0 && <p>No available slots.</p>}
      <div className="space-y-2">
        {meeting.availableSlots.map((slot: string) => (
          <Button
            key={slot}
            variant={selectedSlot === slot ? "default" : "outline"}
            onClick={() => setSelectedSlot(slot)}
          >
            {slot}
          </Button>
        ))}
      </div>
      <Button onClick={handleConfirm} disabled={!selectedSlot || isConfirming}>
        {isConfirming ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Confirming...
          </>
        ) : (
          "Confirm Meeting"
        )}
      </Button>
    </div>
  );
}