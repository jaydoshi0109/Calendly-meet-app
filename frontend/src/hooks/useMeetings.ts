import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useMeeting = (id: string | undefined) => {
  return useQuery({
    queryKey: ["meeting", id],
    queryFn: async () => {
      const res = await api.get(`/meeting/${id}`);
      return res.data;
    },
    enabled: !!id,
    meta: {
      errorMessage: "Failed to load meeting."
    }
  });
};
