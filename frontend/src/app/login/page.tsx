"use client"
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../../store/userStore/hooks';
import { setToken } from '../../store/userStore/slices/userSlice';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

type AuthState = "Sign up" | "Log in";

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
  };
}

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const [state, setState] = useState<AuthState>("Sign up");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { backendUrl, token, userData } = useAppSelector((state) => state.user);

  console.log('Backend URL:', backendUrl);

  const onSubmitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    console.log(state);
    
    try {
      if (state === "Sign up") {
        const { data }: { data: ApiResponse } = await axios.post(
          `${backendUrl}/api/user/register`, 
          { name, email, password }
        );
        
        if (data.success && data.data?.token) {
          localStorage.setItem("token", data.data.token);
          dispatch(setToken(data.data.token));
          toast.success("Account created successfully!");
          router.push("/")
        } else {
          toast.error(data.message || "Registration failed");
        }

      } else if (state === "Log in") {
        const { data }: { data: ApiResponse } = await axios.post(
          `${backendUrl}/api/user/login`, 
          { email, password }
        );
        
        if (data.success && data.data?.token) {
          localStorage.setItem("token", data.data.token);
          dispatch(setToken(data.data.token));
          toast.success("Login successful!");
          router.push("/")

        } else {
          toast.error(data.message || "Login failed");
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "An error occurred";
      toast.error(errorMessage);
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const toggleAuthState = (newState: AuthState) => {
    setState(newState);
    setName("");
    setEmail("");
    setPassword("");
  };

  useEffect(() => {
    if (token && userData) {
      router.push("/");
    }
  }, [token, userData, router]);
  
  return (
    <>
    <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    <div className='min-h-[80vh] flex items-center px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <form onSubmit={onSubmitHandler} className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold text-gray-800'>
          {state === "Sign up" ? "Create Account" : "Login"}
        </p>
        <p className='text-gray-600'>
          Please {state === "Sign up" ? "sign up" : "log in"} to book appointment
        </p>
        
        {state === "Sign up" && (
          <div className='w-full'>
            <p className='text-gray-700 mb-1'>Full name</p>
            <input 
              className='border border-zinc-300 rounded w-full p-2 mt-1 focus:outline-none focus:border-primary transition-colors' 
              type="text" 
              onChange={handleNameChange} 
              value={name} 
              placeholder="Enter your full name"
              required 
            />
          </div>
        )}

        <div className='w-full'>
          <p className='text-gray-700 mb-1'>Email</p>
          <input 
            className='border border-zinc-300 rounded w-full p-2 mt-1 focus:outline-none focus:border-primary transition-colors' 
            type="email" 
            onChange={handleEmailChange} 
            value={email} 
            placeholder="Enter your email"
            required 
          />
        </div>

        <div className='w-full'>
          <p className='text-gray-700 mb-1'>Password</p>
          <input 
            className='border border-zinc-300 rounded w-full p-2 mt-1 focus:outline-none focus:border-primary transition-colors' 
            type="password" 
            onChange={handlePasswordChange} 
            value={password} 
            placeholder="Enter your password"
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className='bg-primary text-white w-full py-2 rounded-md text-base hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? "Please wait..." : (state === "Sign up" ? "Create Account" : "Login")}
        </button>

        {state === "Sign up" ? (
          <p className='text-gray-600'>
            Already have an account?{' '}
            <span 
              onClick={() => toggleAuthState("Log in")} 
              className='text-primary underline cursor-pointer hover:text-primary/80 transition-colors'
            >
              Login here
            </span>
          </p>
        ) : (
          <p className='text-gray-600'>
            Create a new account?{' '}
            <span 
              onClick={() => toggleAuthState("Sign up")} 
              className='text-primary underline cursor-pointer hover:text-primary/80 transition-colors'
            >
              Click here
            </span>
          </p>
        )}
      </form>
    </div>
    </>

  );
};

export default Login;