import React, { useState, useEffect } from "react";
import {
  MdAdminPanelSettings,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { LuClipboardEdit } from "react-icons/lu";
import { FaNewspaper, FaUsers } from "react-icons/fa";
import { FaArrowsToDot } from "react-icons/fa6";
import moment from "moment";
import clsx from "clsx";
import { Chart } from "../components/Chart";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../utils";
import UserInfo from "../components/UserInfo";
import { useGetTeamListQuery } from "../redux/slices/apiSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const TaskTable = ({ tasks }) => {
  const ICONS = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    low: <MdKeyboardArrowDown />,
  };

  const TableHeader = () => (
    <thead className="border-b border-gray-300 dark:border-gray-600 ">
      <tr className="text-black dark:text-gray-300 text-left">
        <th className="py-2">Task Title</th>
        <th className="py-2">Priority</th>
        <th className="py-2">Team</th>
        <th className="py-2 hidden md:block">Created At</th>
      </tr>
    </thead>
  );

  const TableRow = ({ task }) => (
    <tr className="border-b border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300/10 dark:hover:bg-gray-700/50">
      <td className="py-2">
        <div className="flex items-center gap-2">
          <div
            className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])}
          />
          <p className="text-base text-black dark:text-white">{task.title}</p>
        </div>
      </td>

      <td className="py-2">
        <div className="flex gap-1 items-center">
          <span className={clsx("text-lg", PRIOTITYSTYELS[task.priority])}>
            {ICONS[task.priority]}
          </span>
          <span className="capitalize">{task.priority}</span>
        </div>
      </td>

      <td className="py-2">
        <div className="flex">
          {task.team.map((m, index) => (
            <div
              key={index}
              className={clsx(
                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                BGS[index % BGS.length]
              )}
            >
              <UserInfo user={m} />
            </div>
          ))}
        </div>
      </td>
      <td className="py-2 hidden md:block">
        <span className="text-base text-gray-600">
          {moment(task?.date).fromNow()}
        </span>
      </td>
    </tr>
  );

  return (
    <div className="w-full md:w-2/3 bg-white dark:bg-gray-800 px-2 md:px-4 pt-4 pb-4 shadow-md rounded transition-colors duration-300">
      <table className="w-full">
        <TableHeader />
        <tbody>
          {tasks?.map((task, id) => (
            <TableRow key={id} task={task} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const UserTable = ({ users }) => {
  const TableHeader = () => (
    <thead className="border-b border-gray-300 dark:border-gray-600">
      <tr className="text-black dark:text-gray-300 text-left">
        <th className="py-2">Full Name</th>
        <th className="py-2">Status</th>
        <th className="py-2">Created At</th>
      </tr>
    </thead>
  );

  const TableRow = ({ user }) => (
    <tr className="border-b border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-400/10 dark:hover:bg-gray-700/50">
      <td className="py-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-violet-700">
            <span className="text-center">{getInitials(user?.name)}</span>
          </div>
          <div>
            <p className="dark:text-white"> {user.name}</p>
            <span className="text-xs text-black dark:text-gray-400">
              {user?.role}
            </span>
          </div>
        </div>
      </td>

      <td>
        <p
          className={clsx(
            "w-fit px-3 py-1 rounded-full text-sm",
            user?.isActive
              ? "bg-blue-200 dark:bg-blue-800"
              : "bg-yellow-100 dark:bg-yellow-600"
          )}
        >
          {user?.isActive ? "Active" : "Disabled"}
        </p>
      </td>
      <td className="py-2 text-sm">{moment(user?.createdAt).fromNow()}</td>
    </tr>
  );

  return (
    <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 h-fit px-2 md:px-6 py-4 shadow-md rounded transition-colors duration-300">
      <table className="w-full mb-5">
        <TableHeader />
        <tbody>
          {users?.map((user, index) => (
            <TableRow key={index + user?._id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: teamList = [] } = useGetTeamListQuery();
  const { user } = useSelector((state) => state.auth);
  const chartData = data?.graphData || [];
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/task/dashboard", {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const totals = data?.tasks || {};

  const stats = [
    {
      _id: "1",
      label: "TOTAL TASK",
      total: data?.totalTasks || 0,
      lastMonthCount: data?.lastMonthTasks?.total || 0,
      icon: <FaNewspaper />,
      bg: "bg-[#1d4ed8] dark:bg-blue-700",
    },
    {
      _id: "2",
      label: "COMPLETED TASK",
      total: data?.tasks?.completed || 0,
      lastMonthCount: data?.lastMonthTasks?.completed || 0,
      icon: <MdAdminPanelSettings />,
      bg: "bg-[#0f766e] dark:bg-teal-700",
    },
    {
      _id: "3",
      label: "TASK IN PROGRESS ",
      total: data?.tasks?.["in progress"] || 0,
      lastMonthCount: data?.lastMonthTasks?.["in progress"] || 0,
      icon: <LuClipboardEdit />,
      bg: "bg-[#f59e0b] dark:bg-amber-600",
    },
    {
      _id: "4",
      label: "TODOS",
      total: data?.tasks?.["todo"] || 0,
      lastMonthCount: data?.lastMonthTasks?.todo || 0,
      icon: <FaArrowsToDot />,
      bg: "bg-[#be185d] dark:bg-rose-700",
    },
  ];

  const Card = ({ label, bg, icon, lastMonthCount, total }) => {
    const hasComparison = lastMonthCount !== undefined;
    let changeText = "";

    if (hasComparison) {
      if (lastMonthCount === 0) {
        changeText = "N/A (from 0)";
      } else {
        const change = Math.round(
          ((total - lastMonthCount) / lastMonthCount) * 100
        );
        changeText = `${change >= 0 ? "+" : ""}${change}%`;
      }
    }

    return (
      <div className="w-full h-32 bg-white dark:bg-gray-800 p-5 shadow-md rounded-md flex items-center justify-between transition-colors duration-300 border border-gray-200 dark:border-gray-700">
        <div className="h-full flex flex-1 flex-col justify-between">
          <p className="text-base text-gray-600 dark:text-gray-300">{label}</p>
          <span className="text-2xl font-semibold dark:text-white">
            {total}
          </span>
          <div className="flex items-center gap-2">
            {hasComparison ? (
              <>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {lastMonthCount} last month
                </span>
                {changeText && (
                  <span
                    className={`text-xs ${
                      changeText.includes("+")
                        ? "text-green-500"
                        : changeText.includes("-")
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {changeText}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                No previous data
              </span>
            )}
          </div>
        </div>
        <div
          className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center text-white",
            bg
          )}
        >
          {icon}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full py-4 dark:bg-gray-900 transition-colors duration-300">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* {stats.map(({ icon, bg, label, total }, index) => (
          <Card key={index} icon={icon} bg={bg} label={label} count={total} />
        ))} */}
        {stats.map((stat, index) => (
          <Card key={index} {...stat} />
        ))}
      </div>
      <div className="w-full bg-white dark:bg-gray-800 my-16 p-4 rounded shadow-sm transition-colors duration-300">
        <h4 className="text-xl text-gray-600 dark:text-gray-300 font-semibold">
          Chart by Priority
        </h4>
        <Chart data={chartData} /> {/* Pass dynamic data to Chart */}
      </div>

      <div className="w-full flex flex-col md:flex-row gap-4 2xl:gap-10 py-8">
        <TaskTable tasks={data?.last10Task || []} />
        <UserTable users={teamList} />
      </div>
    </div>
  );
};

export default Dashboard;
