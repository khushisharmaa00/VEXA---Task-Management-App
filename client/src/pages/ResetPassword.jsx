import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { setCredentials } from "../redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/reset-password/${token}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: password }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.user) {
          dispatch(setCredentials(result.user));
        }
        toast.success("Password reset successfully!");
        navigate("/dashboard"); // Redirect to dashboard instead of login
      } else {
        const error = await response.json();
        toast.error(error.message);
      }
    } catch (err) {
      toast.error("Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-4 bg-white rounded shadow"
      >
        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded pr-18"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-12 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? (
              <FaEye className="text-lg" />
            ) : (
              <FaEyeSlash className="text-lg" />
            )}
          </button>
        </div>
        <div className="relative mb-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded pr-19"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-5 top-12 transform -translate-y-1/2 text-gray-500"
          >
            {showConfirmPassword ? (
              <FaEye className="text-lg" />
            ) : (
              <FaEyeSlash className="text-lg" />
            )}
          </button>
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
