import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUpdateProfileMutation } from "../redux/slices/apiSlice";
import ModalWrapper from "./ModalWrapper";
import Textbox from "./Textbox";
import Button from "./Button";

const Profile = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    role: "",
  });

  const [updateProfile] = useUpdateProfileMutation();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        title: user.title || "",
        role: user.role || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const { data } = await updateProfile(formData).unwrap();
      await updateProfile({
        ...formData,
        targetUserId: user._id, // Add this line
      }).unwrap();
      toast.success("Profile updated successfully");
      onClose();
      // onUpdate(data.user);
      await refetch(); // Add this to refresh data
    } catch (error) {
      toast.error(error.data?.message || "Failed to update profile");
    }
  };

  return (
    <ModalWrapper open={!!user} setOpen={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-slate-50">
          Update Profile
        </h2>
        <div className="space-y-4">
          <Textbox
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Textbox
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />

          <Textbox
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            className="inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-400 bg-white dark:bg-gray-500 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-100 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 sm:col-start-1 sm:text-sm dark:font-bold"
            onClick={onClose}
            label="Cancel"
          />
          <Button
            type="submit"
            className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm dark:font-bold"
            label="Save Changes"
          />
        </div>
      </form>
    </ModalWrapper>
  );
};

export default Profile;
