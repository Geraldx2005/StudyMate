import { useState } from "react";
import bgImg from "../../assets/blue-bg.jpg";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { setUser } = useAuth();

  // Google sign-in Provider
  const googleProvider = new GoogleAuthProvider();

  const handleGooogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setUser(user);
      console.log("Google sign-in successful:", user);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        // Firebase login logic
        console.log("Login attempt:", { email, password });
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Login successful");
      } else {
        // Firebase signup logic
        console.log("Signup attempt:", { email, password });
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("Account created successfully");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
      toggleMode();
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setError("");
  };

  // const handleSocialLogin = (provider) => {
  //   console.log(`${provider} login clicked`);
  // };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image + branding */}
      <div className="hidden lg:flex lg:w-3/5 relative bg-cover bg-center" style={{ backgroundImage: `url(${bgImg})` }}>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white bg-black/40 w-full">
          <h1 className="text-4xl font-bold tracking-tight">StudyMate</h1>
          <div className="space-y-4">
            <h2 className="text-5xl font-bold leading-tight">
              Smart Notes,
              <br />
              Easier Exams
            </h2>
            <p className="text-lg text-gray-200 max-w-md">
              Organize your study resources in one place with secure and seamless access.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-gray-600">
              {isLogin ? "Enter your credentials to access your account" : "Already have an account? "}
              {!isLogin && (
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-[#152a59] font-semibold underline-offset-4 hover:underline transition-colors duration-200"
                >
                  Log in
                </button>
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-md font-medium text-gray-700 mb-10">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 w-full px-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 placeholder:text-sm focus:border-[#152a59] focus:ring-2 focus:ring-[#152a59]/20 rounded-lg transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-md font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 w-full px-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 placeholder:text-sm focus:border-[#152a59] focus:ring-2 focus:ring-[#152a59]/20 rounded-lg transition-all duration-200"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-10 bg-[#152a59] text-white hover:opacity-90 font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </div>
              ) : isLogin ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {isLogin && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-[#152a59] font-semibold underline-offset-4 hover:underline transition-colors duration-200"
                >
                  Sign up
                </button>
              </p>
            </div>
          )}

          {/* Social login */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="w-full align-center justify-center flex gap-4">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleGooogleSignIn()}
                className="w-md flex items-center justify-center h-12 border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors duration-200 ease-in-out"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
