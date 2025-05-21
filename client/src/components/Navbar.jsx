import React, { useCallback, useEffect, useState } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setOpenSidebar } from "../redux/slices/authSlice";
import UserAvatar from "./UserAvatar";
import NotificationPanel from "./NotificationPanel";
import { FaMoon, FaSun } from "react-icons/fa";
import { useSearchTasksQuery } from "../redux/slices/apiSlice";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";

const Navbar = ({ darkMode, setDarkMode }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        setDebouncedQuery(searchQuery.trim());
      } else {
        setDebouncedQuery("");
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: tasks = [], isFetching } = useSearchTasksQuery(debouncedQuery, {
    skip: !debouncedQuery,
  });

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(value.length > 0);
  };
  const handleResultClick = (taskId) => {
    navigate(`/task/${taskId}`);
    setShowResults(false);
    setSearchQuery(""); // Clear the search query after selection
  };

  return (
    <div className="flex justify-between items-center bg-white px-4 py-3 2xl:py-4 sticky z-10 top-0">
      <div className="flex gap-4 relative">
        <button
          onClick={() => dispatch(setOpenSidebar(true))}
          className="text-2xl text-gray-500 block md:hidden"
        >
          ☰
        </button>

        <div className="w-64 2xl:w-[400px] flex items-center py-2 px-3 gap-2 rounded-full bg-[#f3f4f6]">
          <MdOutlineSearch className="text-gray-500 text-xl" />

          <input
            type="text"
            placeholder="Search tasks ..."
            className="flex-1 outline-none bg-transparent placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-800 dark:text-white"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
        </div>

        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
            {isFetching ? (
              <div className="p-4 text-gray-500 dark:text-gray-400">
                Searching...
              </div>
            ) : tasks?.length === 0 ? (
              <div className="p-4 text-gray-500 dark:text-gray-400">
                {searchQuery.length < 2
                  ? "Type at least 2 characters"
                  : "No results found"}
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task._id}
                  onMouseDown={() => handleResultClick(task._id)}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer border-b dark:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500 dark:text-blue-400">
                      Task
                    </span>
                    <h4 className="font-medium dark:text-white">
                      {task.title}
                    </h4>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-600"
        >
          {darkMode ? <FaSun className="text-yellow-500" /> : <FaMoon />}
        </button>
        <NotificationPanel />

        <UserAvatar />
      </div>
    </div>
  );
};

export default Navbar;
