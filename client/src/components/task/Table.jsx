import React, { useState } from "react";
import { BiMessageAltDetail } from "react-icons/bi";
import {
  MdAttachFile,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { toast } from "sonner";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, formatDate } from "../../utils";
import clsx from "clsx";
import { FaList } from "react-icons/fa";
import UserInfo from "../UserInfo";
import Button from "../Button";
import ConfirmatioDialog from "../Dialogs";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const Table = ({ tasks }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState(null);

  const deleteClicks = (id) => {
    setSelected(id);
    setOpenDialog(true);
  };

  const deleteHandler = () => {};

  const TableHeader = () => (
    <thead className="w-full border-b border-gray-300 dark:border-gray-600">
      <tr className="w-full text-black dark:text-white text-left">
        <th className="py-2">Task Title</th>
        <th className="py-2">Priority</th>
        <th className="py-2 line-clamp-1">Created At</th>
        <th className="py-2">Assets</th>
        <th className="py-2">Team</th>
      </tr>
    </thead>
  );

  const TableRow = ({ task }) => (
    <tr className="border-b border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300/10 dark:hover:bg-gray-700/50">
      <td className="py-2">
        <div className="flex items-center gap-2">
          <div
            className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])}
          />
          <p className="w-full line-clamp-2 text-base text-black dark:text-white">
            {task?.title}
          </p>
        </div>
      </td>

      <td className="py-2">
        <div className={"flex gap-1 items-center"}>
          <span className={clsx("text-lg", PRIOTITYSTYELS[task?.priority])}>
            {ICONS[task?.priority]}
          </span>
          <span className="capitalize line-clamp-1 dark:text-gray-300">
            {task?.priority} Priority
          </span>
        </div>
      </td>

      <td className="py-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(new Date(task?.date))}
        </span>
      </td>

      <td className="py-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400">
            <BiMessageAltDetail />
            <span>{task?.activities?.length}</span>
          </div>
          <div className="flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400">
            <MdAttachFile />
            <span>{task?.assets?.length}</span>
          </div>
          <div className="flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400">
            <FaList />
            <span>0/{task?.subTasks?.length}</span>
          </div>
        </div>
      </td>

      <td className="py-2">
        <div className="flex">
          {task.team?.map((m, i) => (
            <div
              key={m._id}
              className={clsx(
                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                BGS[i % BGS.length]
              )}
              title={`${m.name} (${m.email})`}
            >
              <UserInfo user={m} />
            </div>
          ))}
        </div>
      </td>

      <td className="py-2 flex gap-2 md:gap-4 justify-end">
        <Button
          className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 sm:px-0 text-sm md:text-base"
          label="Edit"
          type="button"
        />

        <Button
          className="text-red-700 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 sm:px-0 text-sm md:text-base"
          label="Delete"
          type="button"
          onClick={() => deleteClicks(task._id)}
        />
      </td>
    </tr>
  );
  return (
    <>
      <div className="bg-white dark:bg-gray-800 px-2 md:px-4 pt-4 pb-9 shadow-md rounded">
        <div className="overflow-x-auto">
          <table className="w-full ">
            <TableHeader />
            <tbody>
              {tasks.map((task, index) => (
                <TableRow key={index} task={task} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TODO */}
      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />
    </>
  );
};

export default Table;
