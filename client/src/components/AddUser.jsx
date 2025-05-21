import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "./Textbox";
import Loading from "./Loader";
import Button from "./Button";
import { toast } from "sonner";

const AddUser = ({ open, setOpen, onSubmit, userData }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    role: "",
  });

  useEffect(() => {
    if (open) {
      const initialData = {
        name: userData?.name || "",
        email: userData?.email || "",
        title: userData?.title || "",
        role: userData?.role || "",
      };
      console.log("Initial formData:", initialData);
      setFormData(initialData);
    }
  }, [open, userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name}, New value: ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  // const handleOnSubmit = (data) => {
  //   onSubmit(data);
  //   setOpen(false);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);

    const trimmedData = {
      name: formData.name?.trim() || "",
      email: formData.email?.trim() || "",
      title: formData.title?.trim() || "",
      role: formData.role?.trim() || "",
    };

    // Validate required fields
    if (
      !trimmedData.name ||
      !trimmedData.email ||
      !trimmedData.title ||
      !trimmedData.role
    ) {
      toast.error("All fields are required");
      return;
    }

    try {
      await onSubmit(trimmedData);
      setFormData({ name: "", email: "", title: "", role: "" });
      setOpen(false);
      toast.success(
        userData ? "User updated successfully" : "User added successfully"
      );
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error(error.data?.message || "Failed to add user");
    }
  };
  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit} className="">
          <Dialog.Title
            as="h2"
            className="text-base font-bold leading-6 text-gray-900 dark:text-white mb-4"
          >
            {userData ? "UPDATE PROFILE" : "ADD NEW USER"}
          </Dialog.Title>
          <div className="mt-2 flex flex-col gap-6">
            <Textbox
              placeholder="Full name"
              type="text"
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded dark:bg-gray-800 dark:text-white"
              required
            />
            <Textbox
              placeholder="Title"
              type="text"
              name="title"
              label="Title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded dark:bg-gray-800 dark:text-white"
              required
            />
            <Textbox
              placeholder="Email Address"
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded dark:bg-gray-800 dark:text-white"
              required
            />

            <Textbox
              placeholder="Role"
              type="text"
              name="role"
              label="Role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded dark:bg-gray-800 dark:text-white"
              required
            />
          </div>
          <div className="py-5">
            <Loading />
          </div>

          <div className="py-3 mt-4 sm:flex sm:flex-row-reverse">
            <Button
              type="submit"
              className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 sm:w-auto"
              label="Submit"
            />

            <Button
              type="button"
              className="bg-white px-5 text-sm font-semibold text-gray-900 dark:bg-gray-800 dark:text-white sm:w-auto"
              onClick={() => setOpen(false)}
              label="Cancel"
            />
          </div>
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddUser;
