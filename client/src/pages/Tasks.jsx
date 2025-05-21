import React, { useState } from "react";
import { FaList } from "react-icons/fa";
import { MdGridView } from "react-icons/md";
import { useParams } from "react-router-dom";
import Loading from "../components/Loader";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import Tabs from "../components/Tabs";
import TaskTitle from "../components/TaskTitle";
import BoardView from "../components/BoardView";
import Table from "../components/task/Table";
import AddTask from "../components/task/AddTask";
import {
  useGetTasksQuery,
  useTrashTaskMutation,
} from "../redux/slices/apiSlice";
import { toast } from "sonner";

const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
];

const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
};

const Tasks = () => {
  const [trashTask] = useTrashTaskMutation();
  // const params = useParams();
  const { status } = useParams();
  const { data, isLoading, error, refetch } = useGetTasksQuery(
    status ? { stage: status } : undefined
  );
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);

  // Update the title to show the current filter
  const getTitle = () => {
    if (!status) return "Tasks";
    const statusMap = {
      completed: "Completed",
      "in progress": "In Progress",
      todo: "To Do",
    };
    return `${statusMap[status] || status} Tasks`;
  };

  // const status = params?.status || "";
  const tasks = data?.tasks || [];
  const todoTasks = tasks.filter((task) => task.stage === "todo");
  const inProgressTasks = tasks.filter((task) => task.stage === "in progress");
  const completedTasks = tasks.filter((task) => task.stage === "completed");
  console.log("Task data with team:", tasks[0]?.team); // Check the structure
  console.log("First team member:", tasks[0]?.team?.[0]?.name); //
  if (isLoading) {
    return (
      <div className="py-10">
        <Loading />
      </div>
    );
  }
  console.log("Saved task team:", tasks.team); // Should show user IDs
  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400">
        Error: {error.message || "Failed to fetch tasks"}
      </div>
    );
  }
  const handleTrash = async (taskId) => {
    try {
      await trashTask(taskId).unwrap();
      toast.success("Task moved to trash");
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to move task");
    }
  };
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Title title={getTitle()} />
        {!status && (
          <Button
            onClick={() => setOpen(true)}
            label="Create Task"
            icon={<IoMdAdd className="text-lg" />}
            className="flex flex-row-reverse gap-1 items-center bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 2xl:py-2.5"
          />
        )}
      </div>

      <Tabs tabs={TABS} setSelected={setSelected}>
        {!status && (
          <div className="w-full flex justify-between gap-4 md:gap-x-12 py-4">
            <TaskTitle
              label="To Do"
              className={TASK_TYPE.todo}
              count={todoTasks.length}
            />
            <TaskTitle
              label="In Progress"
              className={TASK_TYPE["in progress"]}
              count={inProgressTasks.length}
            />
            <TaskTitle
              label="completed"
              className={TASK_TYPE.completed}
              count={completedTasks.length}
            />
          </div>
        )}

        {selected !== 1 ? (
          <BoardView
            tasks={
              status === "todo"
                ? todoTasks
                : status === "in progress"
                ? inProgressTasks
                : status === "completed"
                ? completedTasks
                : tasks
            }
            onTrash={handleTrash}
          />
        ) : (
          <div className="w-full">
            <Table
              tasks={
                status === "todo"
                  ? todoTasks
                  : status === "in progress"
                  ? inProgressTasks
                  : status === "completed"
                  ? completedTasks
                  : tasks
              }
            />
          </div>
        )}
      </Tabs>

      <AddTask open={open} setOpen={setOpen} />
    </div>
  );
};

export default Tasks;
