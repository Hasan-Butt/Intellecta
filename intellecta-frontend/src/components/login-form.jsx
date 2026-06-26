import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import loginImage from "../assets/intellectaLogo.jpeg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useGoogleLogin } from "@react-oauth/google";
import Swal from "sweetalert2";
import { ArrowLeft } from "lucide-react";

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: email,
        password: password,
      });

      if (res.status === 200) {

        if (res.data.role === "ADMIN") {
          navigate("/dashboard");
        } else {
          navigate("/studentDashboard");
        }
      }
    } catch (err) {
      const errorMsg =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || "Invalid email or password.";

      if (errorMsg.includes("linked with Google")) {
        await Swal.fire({
          icon: "info",
          title: "Google Account Detected",
          html: `
            <div style="text-align: center; font-family: 'Inter', sans-serif;">
              <p style="margin-bottom: 20px; color: #4b5563;">${errorMsg}</p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 12px; border: 1px solid #e5e7eb;">
                <span style="font-weight: 700; color: #451ebb; display: block; margin-bottom: 5px;">Quick Action</span>
                <span style="font-size: 0.9em; color: #6b7280;">Use the "Login with Google" button on the login screen to access your account.</span>
              </div>
            </div>
          `,
          confirmButtonColor: "#451ebb",
          confirmButtonText: "Got it",
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: errorMsg,
          confirmButtonColor: "#451ebb",
        });
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/google", {
        idToken: tokenResponse.access_token,
      });

      if (res.status === 200) {

        if (res.data.role === "ADMIN") {
          navigate("/dashboard");
        } else {
          navigate("/studentDashboard");
        }
      }
    } catch (err) {
      const errorMsg =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || err.message || "Failed to authenticate with Google";

      console.error("Google Login Error:", err);
      console.error("Backend response:", err.response?.status, err.response?.data);

      await Swal.fire({
        icon: "error",
        title: "Google Login Failed",
        text: errorMsg,
        confirmButtonColor: "#451ebb",
      });
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: (error) => console.log("Login Failed", error),
  });

  return (
    <div className={cn("flex min-h-screen w-full", className)} {...props}>
      <div className="grid w-full grid-cols-1 md:grid-cols-2">
        {/* Left Side: The Form */}
        <div className="flex flex-col bg-white p-8 relative">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="absolute top-8 left-8 flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go back
          </button>

          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-sm space-y-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-sm text-muted-foreground">
                  Login to your Intellecta account
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="grid gap-2 text-left">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2 text-left">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button 
                onClick={() => googleLogin()} 
                variant="outline" 
                type="button" 
                className="w-full"
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 mr-2"
                >
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Login with Google
              </Button>

              <p className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="font-semibold underline hover:text-[#451ebb] transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: The Branding */}
        <div className="hidden bg-[#F3F3F3] md:block relative w-full h-full overflow-hidden">
          <img
            src={loginImage}
            alt="Intellecta Branding"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
