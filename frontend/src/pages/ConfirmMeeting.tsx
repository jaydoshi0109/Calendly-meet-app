import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function ConfirmMeeting() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyResponded, setAlreadyResponded] = useState(false);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await api.get(`/meetings/${id}`);
        setMeeting(res.data);
        if (res.data.status !== 'pending') {
          setAlreadyResponded(true);
        }
      } catch {
        toast.error("Unable to fetch meeting details.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [id]);

  const handleAccept = async () => {
    try {
      const res = await api.post(`/meetings/accept/${id}`);
      toast.success(res.data.message);
      setAlreadyResponded(true);
      setMeeting({ ...meeting, status: 'confirmed' });
    } catch {
      toast.error("Unable to accept meeting.");
    }
  };

  const handleDecline = async () => {
    try {
      const res = await api.post(`/meetings/decline/${id}`);
      toast.success(res.data.message);
      setAlreadyResponded(true);
      setMeeting({ ...meeting, status: 'declined' });
    } catch {
      toast.error("Unable to decline meeting.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (alreadyResponded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold">Meeting Invitation</h2>
          <p className="mt-2 text-gray-600">
            This invitation has already been <strong>{meeting.status}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-8 space-y-4 text-center">
        <h2 className="text-2xl font-semibold">{meeting.title || 'Meeting Invitation'}</h2>
        <p className="text-gray-500">{meeting.description || 'Would you like to accept or decline this meeting?'}</p>
        <div className="flex gap-4 justify-center">
          <Button className="bg-green-500 hover:bg-green-600" onClick={handleAccept}>
            Accept
          </Button>
          <Button variant="destructive" onClick={handleDecline}>
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}
