import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import loginImage from "../assets/intellectaLogo.jpeg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Swal from "sweetalert2";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export function SignupForm({ className, ...props }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      await Swal.fire({
        icon: "error",
        title: "Passwords Don't Match",
        text: "Please make sure both passwords are the same.",
        confirmButtonColor: "#451ebb",
      });
      return;
    }

    if (password.length < 6) {
      await Swal.fire({
        icon: "error",
        title: "Password Too Short",
        text: "Password must be at least 6 characters.",
        confirmButtonColor: "#451ebb",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
        confirmPassword,
      });

      if (res.status === 200 && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.userId);
        localStorage.setItem("role", res.data.role);

        await Swal.fire({
          icon: "success",
          title: "Welcome to Intellecta!",
          text: `Account created for ${username}. Let's start learning!`,
          confirmButtonColor: "#451ebb",
          timer: 2000,
          timerProgressBar: true,
        });

        navigate("/studentDashboard");
      }
    } catch (err) {
      const errorMsg =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || "Registration failed. Please try again.";

      await Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: errorMsg,
        confirmButtonColor: "#451ebb",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!password) return { label: "", color: "bg-gray-200", width: "0%" };
    if (password.length < 6) return { label: "Too short", color: "bg-red-400", width: "25%" };
    if (password.length < 8) return { label: "Weak", color: "bg-orange-400", width: "50%" };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: "Fair", color: "bg-yellow-400", width: "75%" };
    return { label: "Strong", color: "bg-green-500", width: "100%" };
  };

  const strength = passwordStrength();

  return (
    <div className={cn("flex min-h-screen w-full", className)} {...props}>
      <div className="grid w-full grid-cols-1 md:grid-cols-2">
        {/* Left Side: The Form */}
        <div className="flex flex-col bg-white p-8 relative">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="absolute top-8 left-8 flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Login
          </button>

          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-sm space-y-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create an Account</h1>
                <p className="text-sm text-muted-foreground">
                  Join Intellecta and start your learning journey
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleRegister}>
                {/* Username */}
                <div className="grid gap-2 text-left">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="e.g. john_doe"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                {/* Email */}
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

                {/* Password */}
                <div className="grid gap-2 text-left">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength bar */}
                  {password && (
                    <div className="space-y-1">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{strength.label}</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="grid gap-2 text-left">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pr-10 ${
                        confirmPassword && confirmPassword !== password
                          ? "border-red-400 focus:ring-red-400"
                          : confirmPassword && confirmPassword === password
                          ? "border-green-400 focus:ring-green-400"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                  {confirmPassword && confirmPassword === password && (
                    <p className="text-xs text-green-500">Passwords match ✓</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  style={{ backgroundColor: "#451ebb" }}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              <p className="text-center text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-semibold underline hover:text-[#451ebb] transition-colors"
                >
                  Log in
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
