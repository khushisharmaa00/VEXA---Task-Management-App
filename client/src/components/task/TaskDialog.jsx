import React, { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiTwotoneFolderOpen } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { HiDuplicate } from "react-icons/hi";
import { MdAdd, MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Menu, Transition } from "@headlessui/react";
import AddTask from "./AddTask";
import AddSubTask from "./AddSubTask";
import ConfirmatioDialog from "../Dialogs";
import { toast } from "sonner";
import {
  useDuplicateTaskMutation,
  useTrashTaskMutation,
  useUpdateTaskMutation,
} from "../../redux/slices/apiSlice";
import ModalWrapper from "../ModalWrapper";
import Textbox from "../Textbox";
import SelectList from "../SelectList";
import UserList from "./UserList";
import Button from "../Button";

const TaskDialog = ({
  task,
  onTaskDeleted,
  onTaskDuplicated,
  onTaskUpdated,
}) => {
  const [openSubTask, setOpenSubTask] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [duplicateTask] = useDuplicateTaskMutation();
  const [deleteTask] = useTrashTaskMutation();
  const [updateTask] = useUpdateTaskMutation();

  const navigate = useNavigate();

  const [editData, setEditData] = useState({
    title: task.title,
    date: task.date?.slice(0, 10) || "",
    stage: task.stage?.toUpperCase() || LISTS[0],
    priority: task.priority?.toUpperCase() || PRIORITY[2],
    team: task.team || [],
    assets: task.assets || [],
  });
  const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];
  const PRIORITY = ["HIGH", "MEDIUM", "NORMAL"];
  const duplicateHandler = async () => {
    try {
      await duplicateTask(task._id).unwrap();
      toast.success("Task duplicated successfully!");
      if (onTaskDuplicated) onTaskDuplicated();
    } catch (error) {
      toast.error(error.data?.message || "Duplication failed");
    }
  };
  // Prepare data for submission
  const teamIds = editData.team.map((member) =>
    typeof member === "object" ? member._id : member
  );
  const handleEditSubmit = async () => {
    try {
      const taskData = {
        title: editData.title,
        team: teamIds,
        stage: editData.stage.toLowerCase(),
        date: new Date(editData.date).toISOString(),
        priority: editData.priority.toLowerCase(),
        assets: editData.assets,
      };

      await updateTask({ id: task._id, ...taskData }).unwrap();
      toast.success("Task updated successfully!");
      if (onTaskUpdated) onTaskUpdated();
      setOpenEdit(false);
    } catch (error) {
      toast.error(error.data?.message || "Update failed");
    }
  };
  const deleteClicks = () => {
    setOpenDialog(true);
  };
  const deleteHandler = async () => {
    try {
      await deleteTask(task._id).unwrap();
      toast.success("Task deleted successfully!");
      setOpenDialog(false);
      if (onTaskDeleted) onTaskDeleted();
    } catch (error) {
      toast.error(error.data?.message || "Deletion failed");
    }
  };

  const items = [
    {
      label: "Open Task",
      icon: <AiTwotoneFolderOpen className="mr-2 h-5 w-5" aria-hidden="true" />,
      onClick: () => navigate(`/task/${task._id}`),
    },
    {
      label: "Edit",
      icon: <MdOutlineEdit className="mr-2 h-5 w-5" aria-hidden="true" />,
      onClick: () => setOpenEdit(true),
    },
    {
      label: "Add Sub-Task",
      icon: <MdAdd className="mr-2 h-5 w-5" aria-hidden="true" />,
      onClick: () => setOpenSubTask(true),
    },
    {
      label: "Duplicate",
      icon: <HiDuplicate className="mr-2 h-5 w-5" aria-hidden="true" />,
      onClick: duplicateHandler,
    },
  ];

  return (
    <>
      <div>
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-600 ">
            <BsThreeDots />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute p-4 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
              <div className="px-1 py-1 space-y-2">
                {items.map((item) => (
                  <Menu.Item key={item.label}>
                    {({ active }) => (
                      <button
                        onClick={item.onClick}
                        className={`${
                          active ? "bg-blue-500 text-white" : "text-gray-900"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>

              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={deleteClicks}
                      className={`${
                        active ? "bg-blue-500 text-white" : "text-red-900"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      <RiDeleteBin6Line
                        className="mr-2 h-5 w-5 text-red-400"
                        aria-hidden="true"
                      />
                      Delete
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
        <ModalWrapper open={openEdit} setOpen={setOpenEdit}>
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Edit Task</h2>

            <Textbox
              label="Task Title"
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              className="mb-4"
            />

            <UserList
              team={editData.team}
              setTeam={(newTeam) => setEditData({ ...editData, team: newTeam })}
              className="mb-4"
            />
            <div className="flex gap-4 mb-4">
              <SelectList
                label="Task Stage"
                lists={LISTS}
                selected={editData.stage}
                setSelected={(stage) => setEditData({ ...editData, stage })}
              />

              <SelectList
                label="Priority Level"
                lists={PRIORITY}
                selected={editData.priority}
                setSelected={(priority) =>
                  setEditData({ ...editData, priority })
                }
              />
            </div>
            <Textbox
              label="Due Date"
              type="date"
              value={editData.date}
              onChange={(e) =>
                setEditData({ ...editData, date: e.target.value })
              }
              className="mb-4"
            />

            <div className="flex justify-end gap-4">
              <Button
                label="Cancel"
                onClick={() => setOpenEdit(false)}
                className="bg-gray-200"
              />
              <Button
                label="Save Changes"
                onClick={handleEditSubmit}
                className="bg-blue-600 text-white"
              />
            </div>
          </div>
        </ModalWrapper>
      </div>

      <AddSubTask open={openSubTask} setOpen={setOpenSubTask} id={task._id} />

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />
    </>
  );
};

export default TaskDialog;
