import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";
import { toast } from "sonner";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaEyeSlash,
  FaTasks,
} from "react-icons/fa";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const submitHandler = async (data) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        }
      );
      console.log(import.meta.env.VITE_API_URL);
      if (response.ok) {
        const result = await response.json();
        if (!response.ok) {
          throw new Error("Login failed");
        }
        if (result.user) {
          dispatch(setCredentials(result.user));
        }
        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Login error details:", {
        error: error.message,
        stack: error.stack,
      });
    }
  };
  const floatingIcons = [
    { icon: <FaTasks />, left: "15%", top: "20%", duration: 18 },
    { icon: <FaCalendarAlt />, left: "75%", top: "25%", duration: 22 },
    { icon: <FaCalendarAlt />, left: "85%", top: "10%", duration: 22 },
    { icon: <FaCheckCircle />, left: "25%", top: "60%", duration: 15 },
    { icon: <FaClock />, left: "65%", top: "20%", duration: 20 },
    { icon: <FaTasks />, left: "40%", top: "15%", duration: 25 },
    { icon: <FaCalendarAlt />, left: "90%", top: "20%", duration: 17 },
    { icon: <FaCheckCircle />, left: "10%", top: "40%", duration: 19 },
    { icon: <FaCheckCircle />, left: "50%", top: "30%", duration: 19 },
    { icon: <FaClock />, left: "50%", top: "80%", duration: 23 },
    { icon: <FaClock />, left: "70%", top: "80%", duration: 23 },
  ];
  return (
    <>
      {/* <div className="w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-gradient-to-br from-blue-50 to-gray-50 relative overflow-hidden"> */}
      {/* Floating icons background */}
      {/* <div className="w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-gradient-to-br from-blue-50 via-white to-gray-50 relative overflow-hidden "> */}
      <div
        className="w-full min-h-screen flex items-center justify-center flex-col lg:flex-row 
  bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-blue-50 to-gray-50 relative overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingIcons.map((icon, i) => (
            <div
              key={i}
              className="absolute text-blue-400/20 text-4xl"
              style={{
                left: icon.left,
                top: icon.top,
                animation: `float ${icon.duration}s infinite ease-in-out alternate`,
              }}
            >
              {icon.icon}
            </div>
          ))}
        </div>
        <div className="w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center">
          {/* left side */}
          <div className="h-full w-full lg:w-2/3 flex flex-col items-center justify-center">
            <div className="w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20">
              <span className="flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base bordergray-300 text-gray-600">
                Manage all your task in one place!
              </span>
              <p className="flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-blue-700">
                <span>VEXA-</span>
                <span>Task Manager App</span>
              </p>

              <div className="cell">
                <div className="circle rotate-in-up-left"></div>
              </div>
            </div>
          </div>

          {/* right side */}
          <div className="w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center">
            <form
              onSubmit={handleSubmit(submitHandler)}
              className="form-container w-full md:w-[450px] flex flex-col gap-y-6 bg-white px-10 pt-12 pb-12 rounded-xl shadow-lg"
            >
              <div className="">
                <p className="text-blue-600 text-3xl font-bold text-center">
                  Welcome back!
                </p>
                <p className="text-center text-base text-gray-700 ">
                  Keep all your credential safe.
                </p>
              </div>

              <div className="flex flex-col gap-y-5">
                <Textbox
                  placeholder="email@example.com"
                  type="email"
                  name="email"
                  label="Email Address"
                  className="w-full rounded-full"
                  register={register("email", {
                    required: "Email Address is required!",
                  })}
                  error={errors.email ? errors.email.message : ""}
                />
                <div className="relative">
                  <Textbox
                    placeholder="your password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    label="Password"
                    className="w-full rounded-full pr-12"
                    register={register("password", {
                      required: "Password is required!",
                    })}
                    error={errors.password ? errors.password.message : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-11 p-2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? (
                      <FaEye className="text-xl" />
                    ) : (
                      <FaEyeSlash className="text-xl" />
                    )}
                  </button>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-500 hover:text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </Link>

                <Button
                  type="submit"
                  label="Submit"
                  className="w-full h-10 bg-blue-700 text-white rounded-full"
                />

                <div className="text-sm text-gray-500 text-center">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:underline"
                  >
                    Register here
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
