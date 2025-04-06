// import { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import axios from "axios";

// interface User {
//   name: string;
//   email: string;
//   picture: string;
// }

// interface AuthContextType {
//   user: User | null;
//   setUser: (user: User | null) => void;
//   logout: () => void;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true); // Added loading state

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, { withCredentials: true });
//         setUser(res.data.user);
//       } catch (err) {
//         setUser(null);
//       } finally {
//         setLoading(false); // Mark loading as complete
//       }
//     };
//     fetchUser();
//   }, []);

//   const logout = () => {
//     setUser(null);
//     window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/logout`;
//   };

//   return (
//     <AuthContext.Provider value={{ user, setUser, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };


import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

interface User {
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an existing token and set it on axios defaults
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    const fetchUser = async () => {
      try {
        // With JWT, you don't necessarily need withCredentials if you're not relying on cookies.
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`);
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const logout = () => {
    // Remove the token from storage and axios defaults
    localStorage.removeItem("token");
    delete axios.defaults.headers.common.Authorization;
    setUser(null);
    // Optionally, redirect to your login page
    window.location.href = `${import.meta.env.VITE_API_URL}/login`;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
