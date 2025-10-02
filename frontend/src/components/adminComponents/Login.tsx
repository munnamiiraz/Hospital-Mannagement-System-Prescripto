"use client"
import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";


// type 
type LoginState = "Admin" | "Doctor";

interface AdminState {
  backendUrl: string;
}

interface RootState {
  admin: AdminState;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  statusCode?: number;
  data: {
    token: string;
    expiresIn: string;
    user: {
      email: string;
      role: string;
    };
  };
}

interface ErrorResponse {
  message?: string;
}

const Login: React.FC = () => {
  const [state, setState] = useState<LoginState>("Admin");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();



  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  

  const onSubmitHandler = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    

    try {
      if (state === "Admin") {
        const { data } = await axios.post<LoginResponse>(
          process.env.NEXT_PUBLIC_BACKEND_URL + `/api/admin/login`,
          { email, password }
        );

        console.log("Backend response:", data);

        if (data.success) {
          const token: string = (data.data.token);
          console.log("data.data.token: ", token);
          
          localStorage.setItem("aToken", token);

          toast.success("Login successful!");
          router.push("/admin/")
        } else {
          toast.error(data.message || "Login failed");
        }
      } else if(state === "Doctor") {
        const { data } = await axios.post<LoginResponse>(
          `${backendUrl}/api/doctor/login`,
          { email, password }
        );

        console.log("Backend response:", data);

        if (data.success) {
          const token: string = (data.data.token);
          console.log("data.data.token: ", token);
          
          localStorage.setItem("dToken", token);

          toast.success("Login successful!");
          router.push("/")
        } else {
          toast.error(data.message || "Login failed");
        }
      }
      else {
        toast.error("Doctor login not implemented yet");
      }
    } catch (error) {
      console.log("Login error:", error);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        const errorMessage = axiosError.response?.data?.message || 
                            axiosError.message || 
                            "Something went wrong";
        toast.error(errorMessage);
      } else {
        const err = error as Error;
        toast.error(err.message || "Something went wrong");
      }
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const handleStateToggle = (newState: LoginState): void => {
    setState(newState);
  };

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto p-8 items-start min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold m-auto'>
          <span className='text-primary'>{state}</span> Login
        </p>
        
        <div className='w-full'>
          <p>Email: </p>
          <input 
            value={email} 
            onChange={handleEmailChange} 
            className='border border-[#DADADA] rounded w-full p-2 mt-1' 
            type="email" 
            required 
            placeholder="Enter your email"
          />
        </div>
        
        <div className='w-full'>
          <p>Password: </p>
          <input 
            value={password} 
            onChange={handlePasswordChange} 
            className='border border-[#DADADA] rounded w-full p-2 mt-1' 
            type="password" 
            required 
            placeholder="Enter your password"
          />
        </div>
        
        <button 
          type="submit"
          className='bg-primary text-white w-full py-2 rounded-md text-base hover:bg-primary-dark transition-colors'
        >
          Login
        </button>
        
        {state === "Admin" ? (
          <p>
            Doctor login?{" "}
            <span 
              className='text-primary underline cursor-pointer hover:text-primary-dark' 
              onClick={() => handleStateToggle("Doctor")}
            >
              Click here
            </span>
          </p>
        ) : (
          <p>
            Admin login?{" "}
            <span 
              className='text-primary underline cursor-pointer hover:text-primary-dark' 
              onClick={() => handleStateToggle("Admin")}
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;