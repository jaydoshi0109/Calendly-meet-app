import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Availability() {
  const [availability, setAvailability] = useState({
    days: [] as string[],
    startTime: "09:00",
    endTime: "17:00",
  });
  const [isLoading, setIsLoading] = useState(false);

  const toggleDay = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (availability.startTime >= availability.endTime) {
        toast.error("Start time must be before end time.");
        return;
      }
      await api.post("/availability", availability, {
        withCredentials: true,
      });
      toast.success("Availability saved!");
    } catch (err) {
      toast.error("Error saving availability.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 space-y-4">
      <h1 className="text-2xl font-semibold">Set Your Availability</h1>

      <div className="flex gap-2 flex-wrap">
        {weekdays.map((day) => (
          <Button
            key={day}
            variant={availability.days.includes(day) ? "default" : "outline"}
            onClick={() => toggleDay(day)}
          >
            {day}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4">
        <label>Start:</label>
        <input
          type="time"
          value={availability.startTime}
          onChange={(e) =>
            setAvailability({ ...availability, startTime: e.target.value })
          }
        />
        <label>End:</label>
        <input
          type="time"
          value={availability.endTime}
          onChange={(e) =>
            setAvailability({ ...availability, endTime: e.target.value })
          }
        />
      </div>

      <Button className="mt-4" onClick={handleSave} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Availability"
        )}
      </Button>
    </div>
  );
}