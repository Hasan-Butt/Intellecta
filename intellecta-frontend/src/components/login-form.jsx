import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import loginImage from "../assets/intellectaLogo.jpeg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";



export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post("http://localhost:8080/api/auth/login", {
      email: email,
      password: password,
    });

    if (res.data === "LOGIN SUCCESS") {
        navigate("/dashboard"); 
      }
    } catch (err) {
      alert("Login Failed: " + (err.response?.data || "Server Error"));
      console.error(err);
    }
};

  return (
    <div className={cn("flex min-h-screen w-full", className)} {...props}>
      <div className="grid w-full grid-cols-1 md:grid-cols-2">
        {/* Left Side: The Form */}
        <div className="flex items-center justify-center bg-white p-8">
          {/* This wrapper keeps the inputs from stretching too far */}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2 text-left">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="ml-auto text-sm underline hover:text-primary"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>

            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-white px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>

            <Button variant="outline" type="button" className="w-full">
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
              <button type="button" className="font-semibold underline">
                Sign up
              </button>
            </p>
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
