import clsx from "clsx";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { FaBug, FaTasks, FaThumbsUp, FaUser } from "react-icons/fa";
import { GrInProgress } from "react-icons/gr";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineDoneAll,
  MdOutlineMessage,
  MdTaskAlt,
} from "react-icons/md";
import { RxActivityLog } from "react-icons/rx";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import Tabs from "../components/Tabs";
import { PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../utils";
import Loading from "../components/Loader";
import Button from "../components/Button";
import {
  useGetTaskQuery,
  usePostTaskActivityMutation,
} from "../redux/slices/apiSlice";
import { useSelector } from "react-redux";
const API_URL = import.meta.env.VITE_API_URL;
const assets = [
  "https://images.pexels.com/photos/2418664/pexels-photo-2418664.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/8797307/pexels-photo-8797307.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/2534523/pexels-photo-2534523.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/804049/pexels-photo-804049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
];

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const bgColor = {
  high: "bg-red-200",
  medium: "bg-yellow-200",
  low: "bg-blue-200",
};

const TABS = [
  { title: "Task Detail", icon: <FaTasks /> },
  { title: "Activities/Timeline", icon: <RxActivityLog /> },
];

const TASKTYPEICON = {
  commented: (
    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
      <MdOutlineMessage />
    </div>
  ),
  started: (
    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
      <FaThumbsUp size={20} />
    </div>
  ),
  assigned: (
    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-500 text-white">
      <FaUser size={14} />
    </div>
  ),
  bug: (
    <div className="text-red-600">
      <FaBug size={24} />
    </div>
  ),
  completed: (
    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
      <MdOutlineDoneAll size={24} />
    </div>
  ),
  "in progress": (
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-600 text-white">
      <GrInProgress size={16} />
    </div>
  ),
};

const act_types = [
  "Started",
  "Completed",
  "In Progress",
  "Commented",
  "Bug",
  "Assigned",
];

const TaskDetails = () => {
  const { id } = useParams();
  const { data: response, isLoading, refetch } = useGetTaskQuery(id);
  const [selected, setSelected] = useState(0);
  // const task = tasks[3];
  const task = response?.task;
  useEffect(() => {
    if (task) {
      console.log("Task Data:", task); // Check subtasks in the console
      console.log("Subtasks:", task.subTasks);
    }
  }, [task]);
  if (isLoading) return <Loading />;
  if (!task) return <div>Task not found</div>;

  return (
    <div className="w-full flex flex-col gap-3 mb-4 overflow-y-hidden dark:bg-gray-900 dark:text-gray-200">
      <h1 className="text-2xl text-gray-600 dark:text-gray-200 font-bold">
        {task?.title}
      </h1>

      <Tabs tabs={TABS} setSelected={setSelected}>
        {selected === 0 ? (
          <>
            <div className="w-full flex flex-col md:flex-row gap-5 2xl:gap-8 bg-white shadow-md p-8 overflow-y-auto">
              {/* LEFT */}
              <div className="w-full md:w-1/2 space-y-8">
                <div className="flex items-center gap-5">
                  <div
                    className={clsx(
                      "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full",
                      PRIOTITYSTYELS[task?.priority],
                      bgColor[task?.priority],
                      "dark:text-gray-900" // Add dark text for priority badges
                    )}
                  >
                    <span className="text-lg">{ICONS[task?.priority]}</span>
                    <span className="uppercase">{task?.priority} Priority</span>
                  </div>

                  <div className={clsx("flex items-center gap-2")}>
                    <div
                      className={clsx(
                        "w-4 h-4 rounded-full",
                        TASK_TYPE[task.stage]
                      )}
                    />
                    <span className="text-black uppercase">{task?.stage}</span>
                  </div>
                </div>

                <p className="text-gray-500 dark:text-gray-800">
                  Created At: {new Date(task?.date).toDateString()}
                </p>

                <div className="flex items-center gap-8 p-4 border-y border-gray-200 dark:border-gray-700">
                  <div className="space-x-2">
                    <span className="font-semibold dark:text-gray-800">
                      Assets :
                    </span>
                    <span className="dark:text-gray-400">
                      {task?.assets?.length}
                    </span>
                  </div>

                  <span className="text-gray-400 dark:text-gray-600">|</span>

                  <div className="space-x-2">
                    <span className="font-semibold dark:text-gray-800">
                      Sub-Task :
                    </span>
                    <span className="dark:text-gray-400">
                      {task?.subTasks?.length}
                    </span>
                  </div>
                </div>
                {task?.team?.length > 0 && (
                  <div className="space-y-4 py-6">
                    <p className="text-gray-600 dark:text-gray-800 font-semibold test-sm">
                      TASK TEAM
                    </p>
                    <div className="space-y-3">
                      {task.team.map((m, index) => (
                        <div
                          key={index}
                          className="flex gap-4 py-2 items-center border-t border-gray-200 dark:border-gray-700"
                        >
                          <div
                            className={
                              "w-10 h-10 rounded-full text-white flex items-center justify-center text-sm -mr-1 bg-blue-600"
                            }
                          >
                            <span className="text-center">
                              {getInitials(m?.name)}
                            </span>
                          </div>

                          <div>
                            <p className="text-lg font-semibold dark:text-gray-800">
                              {m?.name}
                            </p>
                            <span className="text-gray-500 dark:text-gray-700">
                              {m?.title}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {task?.subTasks?.length > 0 && (
                  <div className="space-y-4 py-6">
                    <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm">
                      SUB-TASKS
                    </p>
                    <div className="space-y-8">
                      {task?.subTasks?.map((el, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-50 dark:bg-violet-900/20">
                            <MdTaskAlt
                              className="text-violet-600 dark:text-violet-400"
                              size={26}
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex gap-2 items-center">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(el?.date).toDateString()}
                              </span>

                              <span className="px-2 py-0.5 text-center text-sm rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-800 font-semibold">
                                {el?.tag}
                              </span>
                            </div>

                            <p className="text-gray-700 dark:text-gray-300">
                              {el?.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* RIGHT */}
              {task?.assets?.length > 0 && (
                <div className="w-full md:w-1/2 space-y-8">
                  <p className="text-lg font-semibold dark:text-gray-300">
                    ASSETS
                  </p>

                  <div className="w-full grid grid-cols-2 gap-4">
                    {task?.assets?.map((assetPath, index) => (
                      <img
                        key={index}
                        // src={el}
                        src={`${API_URL}${assetPath}`}
                        alt={task?.title}
                        className="w-full rounded h-28 md:h-36 2xl:h-52 cursor-pointer transition-all duration-700 hover:scale-125 hover:z-50"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Activities activity={task.activities} id={id} refetch={refetch} />
          </>
        )}
      </Tabs>
    </div>
  );
};

const Activities = ({ activity, id, refetch }) => {
  const [selected, setSelected] = useState(act_types[0]);
  const { user } = useSelector((state) => state.auth);
  const [text, setText] = useState("");
  const [postActivity, { isLoading }] = usePostTaskActivityMutation();

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error("Activity text cannot be empty");
      return;
    }

    try {
      await postActivity({
        id,
        type: selected.toLowerCase(),
        activity: text,
        by: user._id,
      }).unwrap();

      toast.success("Activity added successfully");
      setText("");
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to add activity");
    }
  };

  const Card = ({ item }) => {
    console.log(item.by);
    return (
      <div className="flex space-x-4 p-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-10 h-10 flex items-center justify-center">
            {TASKTYPEICON[item?.type]}
          </div>
          <div className="w-full flex items-center">
            <div className="w-0.5 bg-gray-300 dark:bg-gray-600 h-full"></div>
          </div>
        </div>

        <div className="flex flex-col gap-y-1 mb-8">
          <p className="font-semibold dark:text-gray-200">{item?.by?.name}</p>
        </div>
        <div className="text-gray-500 dark:text-gray-400 space-y-2">
          <span className="capitalize">{item?.type}</span>
          <span className="text-sm">{moment(item?.date).fromNow()}</span>
        </div>
        <div className="text-gray-700 dark:text-gray-300">{item?.activity}</div>
      </div>
    );
  };

  return (
    <div className="w-full flex gap-10 2xl:gap-20 min-h-screen px-10 py-8 bg-white dark:bg-gray-800 shadow rounded-md justify-between overflow-y-auto">
      <div className="w-full md:w-1/2">
        <h4 className="text-gray-900 font-semibold text-lg mb-5 dark:text-gray-300">
          Activities
        </h4>

        <div className="w-full">
          {activity?.length > 0 ? (
            activity.map((el, index) => <Card key={index} item={el} />)
          ) : (
            <div className="text-gray-500 dark:text-gray-400 p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
              No activities yet
            </div>
          )}
        </div>
      </div>
      {user && (
        <div className="w-full md:w-1/3">
          <h4 className="text-gray-600 font-semibold text-lg mb-5 dark:text-cyan-500">
            Add Activity
          </h4>
          <div className="w-full flex flex-wrap gap-5">
            {act_types.map((item) => (
              <div key={item} className="flex gap-2 items-center">
                <button
                  key={item}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selected === item
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                  onClick={() => setSelected(item)}
                >
                  {item}
                </button>
              </div>
            ))}
          </div>
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`What's the update?`}
            className="w-full mt-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          />
          <Button
            type="button"
            label="Post Update"
            onClick={handleSubmit}
            className="bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 transition"
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default TaskDetails;
