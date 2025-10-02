"use client"
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

type AuthState = "Sign up" | "Log in";

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user?: {
      _id: string;
      name: string;
      email: string;
    };
  };
}

const Login: React.FC = () => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>("Sign up");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState<any>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // 👉 Handle Form Submit
  const onSubmitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      let data: ApiResponse;

      if (state === "Sign up") {
        const res = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
        });
        data = res.data;
      } else {
        const res = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });
        data = res.data;
      }

      if (data.success && data.data?.token) {
        localStorage.setItem("token", data.data.token);
        toast.success(
          state === "Sign up"
            ? "Account created successfully!"
            : "Login successful!"
        );

        // fetch user data after login/signup
        await fetchUserData(data.data.token);

        router.push("/");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "An error occurred";
      toast.error(errorMessage);
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 👉 Fetch user data function
  const fetchUserData = async (jwt?: string) => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${jwt || token}`,
        },
      });
      setUserData(res.data.user);
      localStorage.setItem("userData", JSON.stringify(res.data.user));
    } catch (err) {
      console.error("Fetch user failed:", err);
    }
  };

  // 👉 Load user data if token exists
  useEffect(() => {
    if (token) {
      const savedUser = localStorage.getItem("userData");
      if (savedUser) {
        setUserData(JSON.parse(savedUser));
      } else {
        fetchUserData();
      }
    }
  }, [token]);

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-[80vh] flex items-center px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg"
        >
          <p className="text-2xl font-semibold text-gray-800">
            {state === "Sign up" ? "Create Account" : "Login"}
          </p>
          <p className="text-gray-600">
            Please {state === "Sign up" ? "sign up" : "log in"} to book appointment
          </p>

          {state === "Sign up" && (
            <div className="w-full">
              <p className="text-gray-700 mb-1">Full name</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1 focus:outline-none focus:border-primary transition-colors"
                type="text"
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div className="w-full">
            <p className="text-gray-700 mb-1">Email</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1 focus:outline-none focus:border-primary transition-colors"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="w-full">
            <p className="text-gray-700 mb-1">Password</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1 focus:outline-none focus:border-primary transition-colors"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white w-full py-2 rounded-md text-base hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Please wait..."
              : state === "Sign up"
              ? "Create Account"
              : "Login"}
          </button>

          {state === "Sign up" ? (
            <p className="text-gray-600">
              Already have an account?{" "}
              <span
                onClick={() => setState("Log in")}
                className="text-primary underline cursor-pointer hover:text-primary/80 transition-colors"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-gray-600">
              Create a new account?{" "}
              <span
                onClick={() => setState("Sign up")}
                className="text-primary underline cursor-pointer hover:text-primary/80 transition-colors"
              >
                Click here
              </span>
            </p>
          )}
        </form>
      </div>

      {userData && (
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold">Welcome, {userData.name}</h2>
          <p className="text-gray-600">Email: {userData.email}</p>
        </div>
      )}
    </>
  );
};

export default Login;
