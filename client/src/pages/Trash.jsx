import clsx from "clsx";
import React, { useEffect, useState } from "react";
import {
  MdDelete,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineRestore,
} from "react-icons/md";
// import { tasks } from "../assets/data";
import Title from "../components/Title";
import Button from "../components/Button";
import { PRIOTITYSTYELS, TASK_TYPE } from "../utils";

import ConfirmatioDialog from "../components/Dialogs";
import {
  useGetTrashedTasksQuery,
  useRestoreTaskMutation,
  useTrashTaskMutation,
} from "../redux/slices/apiSlice";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const Trash = () => {
  const [openDialog, setOpenDialog] = React.useState(false);
  const { user } = useSelector((state) => state.auth);
  const {
    data: trashedData,
    isLoading,
    isError,
    refetch,
  } = useGetTrashedTasksQuery();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const [restoreTask] = useRestoreTaskMutation();
  const [trashTask] = useTrashTaskMutation();
  const trashedTasks = trashedData?.tasks || [];

  const [msg, setMsg] = React.useState("");
  const [type, setType] = useState("");
  const [selectedId, setSelectedId] = useState("");

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setType("delete");
    setMsg("Do you want to permanently delete this task?");
    setOpenDialog(true);
  };

  const handleRestoreClick = (id) => {
    setSelectedId(id);
    setType("restore");
    setMsg("Do you want to restore this task?");
    setOpenDialog(true);
  };

  const handleDeleteRestore = async () => {
    try {
      if (type === "restore" && selectedId) {
        await restoreTask(selectedId).unwrap();
        toast.success("Task restored successfully");
      } else if (actionType === "delete" && selectedId) {
        await trashTask(selectedId).unwrap();
        toast.success("Task deleted successfully");
      }
      setOpenDialog(false);
      setSelectedId("");
      refetch();
    } catch (error) {
      console.error("Operation failed:", error);
    }
  };
  const handleBulkAction = async (actionType) => {
    try {
      await deleteRestoreTask({ actionType }).unwrap();
      refetch();
      toast.success(`${actionType.replace("All", "")} operation successful`);
    } catch (error) {
      toast.error(error.data?.message || "Operation failed");
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load trashed tasks.</p>;

  const TableHeader = () => (
    <thead className="border-b border-gray-300 dark:border-gray-600">
      <tr className="text-black dark:text-gray-300 text-left">
        <th className="py-2">Task Title</th>
        <th className="py-2">Priority</th>
        <th className="py-2">Stage</th>
        <th className="py-2 line-clamp-1">Modified On</th>
      </tr>
    </thead>
  );

  const TableRow = ({ task }) => (
    <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
      <td className="py-2">
        <div className="flex items-center gap-2">
          <div
            className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])}
          />
          <p className="w-full line-clamp-2 text-base text-black dark:text-slate-100">
            {task.title}
          </p>
        </div>
      </td>

      <td className="py-2 capitalize">
        <div className={"flex gap-1 items-center"}>
          <span className={clsx("text-lg", PRIOTITYSTYELS[task.priority])}>
            {ICONS[task.priority]}
          </span>
          <span className="">{task.priority}</span>
        </div>
      </td>

      <td className="py-2 capitalize text-center md:text-start">
        {task.stage}
      </td>
      <td className="py-2 text-sm">{new Date(task.date).toDateString()}</td>

      <td className="py-2 flex gap-1 justify-end">
        <Button
          icon={
            <MdOutlineRestore className="text-xl text-gray-500 dark:text-gray-300" />
          }
          onClick={() => handleRestoreClick(task._id)}
        />
        <Button
          icon={<MdDelete className="text-xl text-red-600 dark:text-red-400" />}
          onClick={() => handleDeleteClick(task._id)}
        />
      </td>
    </tr>
  );

  return (
    <>
      <div className="w-full md:px-1 px-0 mb-6 bg-white dark:bg-gray-800 transition-colors duration-200">
        <div className="flex items-center justify-between mb-8">
          <Title title="Trashed Tasks" />

          <div className="flex gap-2 md:gap-4 items-center">
            <Button
              label="Restore All"
              icon={<MdOutlineRestore className="text-lg hidden md:flex" />}
              className="flex flex-row-reverse gap-1 items-center text-black dark:text-gray-300 text-sm md:text-base rounded-md 2xl:py-2.5"
              onClick={() => handleBulkAction("restoreAll")}
            />
            <Button
              label="Delete All"
              icon={<MdDelete className="text-lg hidden md:flex" />}
              className="flex flex-row-reverse gap-1 items-center text-red-600 dark:text-red-400 text-sm md:text-base rounded-md 2xl:py-2.5"
              onClick={() => handleBulkAction("deleteAll")}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-700 px-2 md:px-6 py-4 shadow-md rounded transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full mb-5">
              <TableHeader />
              <tbody className="bg-white dark:bg-gray-800">
                {trashedTasks.map((task) => (
                  <TableRow key={task._id} task={task} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        msg={msg}
        setMsg={setMsg}
        type={type}
        setType={setType}
        onClick={handleDeleteRestore}
      />
    </>
  );
};

export default Trash;
