import { Button } from "@/components/ui/button";


export default function Login() {
    const handleLogin = () => {
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    };
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        <h1 className="text-3xl font-bold">Login to Your Account</h1>
        <Button onClick={handleLogin}>Login with Google</Button>
      </div>
    );
  }