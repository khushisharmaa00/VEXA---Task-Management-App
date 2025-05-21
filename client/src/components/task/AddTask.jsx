import React, { useEffect, useState } from "react";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import { useForm } from "react-hook-form";
import UserList from "./UserList";
import SelectList from "../SelectList";
import { BiImages } from "react-icons/bi";
import Button from "../Button";
import {
  useCreateTaskMutation,
  useGetTasksQuery,
} from "../../redux/slices/apiSlice";
import { toast } from "sonner";

const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];
const PRIORITY = ["HIGH", "MEDIUM", "NORMAL", "LOW"];
// const uploadedFileURLs = [];
const AddTask = ({ open, setOpen, task }) => {
  const isEditMode = Boolean(task);
  const [createTask] = useCreateTaskMutation();
  const { refetch } = useGetTasksQuery();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  // const [team, setTeam] = useState(task?.team || []);
  const [team, setTeam] = useState([]);
  const [stage, setStage] = useState(LISTS[0]);
  // const [stage, setStage] = useState(task?.stage?.toUpperCase() || LISTS[0]);
  // const [priority, setPriority] = useState(
  //   task?.priority?.toUpperCase() || PRIORITY[2]
  // );
  const [priority, setPriority] = useState(PRIORITY[2]);
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) {
      reset();
      setTeam([]);
      setAssets([]);
      setStage(LISTS[0]);
      setPriority(PRIORITY[2]);
    }
  }, [open, reset]);
  // In AddTask.jsx
  useEffect(() => {
    console.log("Current team state:", team); // Track team state changes
  }, [team]);

  const submitHandler = async (data) => {
    try {
      if (!team || team.length === 0) {
        toast.error("Please select at least one team member");
        return;
      }
      setUploading(true);
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("team", JSON.stringify(team));
      formData.append("stage", stage.toLowerCase());
      formData.append("date", data.date);
      formData.append("priority", priority.toLowerCase());
      // Array.from(assets).forEach((file) => {
      //   formData.append("files", file);
      // });
      assets.forEach((file) => formData.append("assets", file));

      //   const uploadResult = await uploadResponse.json();
      //   uploadedAssets.push(...uploadResult.urls);
      // }

      // const taskData = {
      //   title: data.title,
      //   team,
      //   stage: stage.toLowerCase(),
      //   date: data.date,
      //   priority: priority.toLowerCase(),
      //   assets: uploadedAssets,
      // };
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // If using cookies
      };
      console.log("Creating task with payload:");
      const result = await createTask(formData).unwrap();

      if (result.status) {
        toast.success(result.message || "Task created successfully!");
        await refetch();
        setOpen(false);
      } else {
        toast.error(result.message || "Task creation failed");
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.data?.message ||
          error.message ||
          "Task creation failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSelect = (e) => {
    // setAssets(e.target.files);
    setAssets(Array.from(e.target.files));
  };
  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(submitHandler)}>
          <Dialog.Title
            as="h2"
            className="text-base font-bold leading-6 text-gray-900 dark:text-white mb-4"
          >
            {/* {task ? "UPDATE TASK" : "ADD TASK"} */}
            ADD TASK
          </Dialog.Title>

          <div className="mt-2 flex flex-col gap-6">
            <Textbox
              placeholder="Task Title"
              type="text"
              name="title"
              label="Task Title"
              className="w-full rounded"
              register={register("title", { required: "Title is required" })}
              error={errors.title ? errors.title.message : ""}
            />

            {/* <UserList setTeam={setTeam} team={team} /> */}
            <UserList
              setTeam={setTeam}
              team={team}
              error={!team.length && "Select at least one team member"}
            />

            <div className="flex gap-4">
              <SelectList
                label="Task Stage"
                lists={LISTS}
                selected={stage}
                setSelected={setStage}
              />

              <div className="w-full">
                <Textbox
                  placeholder="Date"
                  type="date"
                  name="date"
                  label="Task Date"
                  className="w-full rounded"
                  register={register("date", {
                    required: "Date is required!",
                    validate: (value) => {
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return (
                        selectedDate >= today || "Date cannot be in the past"
                      );
                    },
                  })}
                  error={errors.date?.message}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <SelectList
                label="Priority Level"
                lists={PRIORITY}
                selected={priority}
                setSelected={setPriority}
              />

              <div className="w-full flex items-center justify-center mt-4">
                <label
                  className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4 dark:text-gray-300 dark:hover:text-white"
                  htmlFor="imgUpload"
                >
                  <input
                    type="file"
                    className="hidden"
                    id="imgUpload"
                    // onChange={(e) => handleSelect(e)}
                    onChange={handleSelect}
                    accept=".jpg, .png, .jpeg"
                    multiple
                  />
                  <BiImages />
                  <span>Add Assets</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 py-6 sm:flex sm:flex-row-reverse gap-4 rounded-lg">
              {uploading ? (
                <span className="text-sm py-2 text-red-500  dark:text-red-400">
                  Uploading assets
                </span>
              ) : (
                <Button
                  label={
                    uploading
                      ? "Saving..."
                      : isEditMode
                      ? "Update Task"
                      : "Create Task"
                  }
                  type="submit"
                  className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-800 sm:w-auto"
                  disabled={uploading}
                />
              )}

              <Button
                type="button"
                className="bg-white dark:bg-gray-600 dark:text-white px-5 text-sm font-semibold text-gray-900 sm:w-auto"
                onClick={() => setOpen(false)}
                label="Cancel"
              />
            </div>
          </div>
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddTask;
