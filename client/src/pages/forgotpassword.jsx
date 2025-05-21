import React, { useState } from "react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        toast.success("Reset link sent to your email");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleForgotPassword}
        className="w-full max-w-sm p-4 bg-white rounded shadow"
      >
        <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
