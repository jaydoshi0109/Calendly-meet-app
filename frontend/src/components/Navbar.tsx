import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    "text-lg font-bold transition-colors duration-300 " +
    (isActive
      ? "text-white border-b-2 border-white"
      : "text-white hover:text-white/80");

  return (
    <nav className="flex justify-between items-center px-12 py-6 bg-gradient-to-r from-purple-800 via-indigo-700 to-blue-600 shadow-xl">
      <div className="flex gap-12 items-center">
        <NavLink to="/dashboard" className={navLinkClasses}>
          Dashboard
        </NavLink>
        <NavLink to="/calendar" className={navLinkClasses}>
          Calendar
        </NavLink>
        <NavLink to="/my-calendar" className={navLinkClasses}>
          My Calendar
        </NavLink>
      </div>
      <Button
        variant="outline"
        onClick={logout}
        className="text-sm font-semibold border-white text-indigo-800 hover:bg-white hover:text-indigo-400 hover:bg-opacity-10 cursor-pointer transition-colors duration-300"
      >
        Logout
      </Button>
    </nav>
  );
}
