import { useForm } from "react-hook-form";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import Button from "../Button";
import { useCreateSubTaskMutation } from "../../redux/slices/apiSlice";
import { toast } from "sonner";
import { useState } from "react";

const AddSubTask = ({ open, setOpen, id, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [createSubTask] = useCreateSubTaskMutation();

  const [submitting, setSubmitting] = useState(false);

  const handleOnSubmit = handleSubmit(async (data) => {
    if (submitting) return; // ← prevent re-entry
    setSubmitting(true);
    try {
      const result = await createSubTask({ id, ...data }).unwrap();
      if (result?.status) {
        toast.success("Subtask added successfully!");
        reset();
        setOpen(false);
        onSuccess?.(); // ← let parent optionally refetch
      } else {
        toast.error(result?.message || "Failed to add subtask");
      }
    } catch (err) {
      toast.error(err.data?.message || "Failed to add subtask");
    } finally {
      setSubmitting(false);
    }
  });
  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form
          // onSubmit={handleSubmit(handleOnSubmit)}
          // onSubmit={handleSubmit(onSubmit)}
          onSubmit={handleOnSubmit}
          className="dark:bg-gray-800 p-4 rounded-lg"
        >
          <Dialog.Title
            as="h2"
            className="text-base font-bold leading-6 text-gray-900 mb-4 dark:text-white dark:font-bold"
          >
            ADD SUB-TASK
          </Dialog.Title>
          <div className="mt-2 flex flex-col gap-6">
            <Textbox
              placeholder="Sub-Task title"
              type="text"
              name="title"
              label="Title"
              className="w-full rounded"
              register={register("title", {
                required: "Title is required!",
              })}
              error={errors.title ? errors.title.message : ""}
            />

            <div className="flex items-center gap-4">
              <Textbox
                placeholder="Date"
                type="date"
                name="date"
                label="Task Date"
                className="w-full rounded"
                register={register("date", {
                  required: "Date is required!",
                })}
                error={errors.date ? errors.date.message : ""}
              />
              <Textbox
                placeholder="Tag"
                type="text"
                name="tag"
                label="Tag"
                className="w-full rounded"
                register={register("tag", {
                  required: "Tag is required!",
                })}
                error={errors.tag ? errors.tag.message : ""}
              />
            </div>
          </div>
          <div className="py-3 mt-4 flex sm:flex-row-reverse gap-4">
            <Button
              type="submit"
              className="bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-800 sm:ml-3 sm:w-auto"
              label="Add Task"
            />

            <Button
              type="button"
              className="bg-white dark:bg-gray-600 dark:text-white border text-sm font-semibold text-gray-900 sm:w-auto"
              onClick={() => setOpen(false)}
              label="Cancel"
            />
          </div>
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddSubTask;
