import { useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const useAuthSession = () => {
  const { user, setUser } = useAuth();

  useEffect(() => {
    const getSession = async () => {
      try {
        const res = await api.get("/me");
        setUser(res.data);
      } catch (err) {
        setUser(null); // Not logged in
      }
    };

    if (!user) {
      getSession();
    }
  }, [user, setUser]);
};
