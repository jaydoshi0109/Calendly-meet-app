import { Button } from "@/components/ui/button";

export default function Login() {
  const handleLogin = () => {
    window.location.href = `/api/auth/google`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 to-gray-800">
      <div className="bg-gray-900/70 backdrop-blur-lg p-10 rounded-3xl shadow-xl text-center space-y-6 border border-gray-700">
        <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text">
          Welcome Back!
        </h1>
        <p className="text-gray-300 text-sm max-w-xs">
          Log in to access your meetings and schedules
        </p>
        <Button
          onClick={handleLogin}
          className="mt-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-full shadow-md transition duration-300 font-semibold"
        >
          Login with Google
        </Button>
      </div>
    </div>
  );
}