import React, { useState, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  useGetCalendarTasksQuery,
  useUpdateTaskDatesMutation,
} from "../redux/slices/apiSlice";
import TaskDetails from "../pages/TaskDetails";
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendar,
} from "react-icons/fa";
import Loading from "../components/Loader";
import { getInitials } from "../utils";
import { useNavigate } from "react-router-dom";

const localizer = momentLocalizer(moment);

const CalendarView = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("week");
  const navigate = useNavigate();

  const getDateRange = useCallback((date, view) => {
    let start, end;

    switch (view) {
      case "month":
        start = moment(date).startOf("month").toISOString();
        end = moment(date).endOf("month").toISOString();
        break;
      case "week":
        start = moment(date).startOf("week").toISOString();
        end = moment(date).endOf("week").toISOString();
        break;
      case "day":
        start = moment(date).startOf("day").toISOString();
        end = moment(date).endOf("day").toISOString();
        break;
      default:
        start = moment(date).startOf("week").toISOString();
        end = moment(date).endOf("week").toISOString();
    }

    return { start, end };
  }, []);

  const { start, end } = getDateRange(currentDate, currentView);

  const {
    data: tasks = [],
    isLoading,
    refetch,
  } = useGetCalendarTasksQuery({
    start,
    end,
  });

  const [updateTaskDates] = useUpdateTaskDatesMutation();

  // Transform tasks to calendar events
  const events = tasks.map((task) => {
    const startDate = task.calendarEvent?.start
      ? new Date(task.calendarEvent.start)
      : new Date(task.date);
    const endDate = task.calendarEvent?.end
      ? new Date(task.calendarEvent.end)
      : new Date(new Date(task.date).setHours(startDate.getHours() + 1));

    return {
      id: task._id,
      title: task.title,
      start: startDate,
      end: endDate,
      allDay: task.calendarEvent?.allDay || false,
      priority: task.priority,
      task: task,
    };
  });

  const priorityColors = {
    high: "#ff4d4f",
    medium: "#faad14",
    low: "#52c41a",
    normal: "#1890ff",
  };

  const eventStyleGetter = (event) => {
    const backgroundColor =
      priorityColors[event.priority] || priorityColors.normal;
    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "#fff",
        border: "none",
        display: "block",
      },
    };
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleView = (newView) => {
    setCurrentView(newView);
  };

  const handleSelectEvent = (event) => {
    navigate(`/task/${event.id}`);
  };

  const handleEventDrop = async ({ event, start, end }) => {
    try {
      await updateTaskDates({
        id: event.id,
        start: start.toISOString(),
        end: end.toISOString(),
      }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to update task dates:", error);
    }
  };

  const CustomToolbar = ({ label, onNavigate, onView }) => (
    <div className="flex flex-col md:flex-row justify-between items-center mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex items-center mb-4 md:mb-0">
        <FaCalendarAlt className="text-blue-500 dark:text-blue-400 mr-2 text-xl" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {label}
        </h2>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onNavigate("PREV")}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FaChevronLeft className="text-gray-600 dark:text-gray-300" />
        </button>

        <button
          onClick={() => onNavigate("TODAY")}
          className="px-4 py-2 text-sm bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700"
        >
          Today
        </button>

        <button
          onClick={() => onNavigate("NEXT")}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FaChevronRight className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      <div className="flex space-x-2 mt-4 md:mt-0">
        <button
          onClick={() => onView("day")}
          className={`flex items-center px-3 py-2 text-sm rounded-md ${
            currentView === "day"
              ? "bg-blue-500 dark:bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
        >
          <FaCalendarDay className="mr-1" /> Day
        </button>
        <button
          onClick={() => onView("week")}
          className={`flex items-center px-3 py-2 text-sm rounded-md ${
            currentView === "week"
              ? "bg-blue-500 dark:bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
        >
          <FaCalendarWeek className="mr-1" /> Week
        </button>
        <button
          onClick={() => onView("month")}
          className={`flex items-center px-3 py-2 text-sm rounded-md ${
            currentView === "month"
              ? "bg-blue-500 dark:bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
        >
          <FaCalendar className="mr-1" /> Month
        </button>
      </div>
    </div>
  );

  const EventComponent = ({ event }) => (
    <div className="p-1">
      <div className="flex items-center">
        <strong className="text-sm truncate">{event.title}</strong>
      </div>
      {event.task.team && event.task.team.length > 0 && (
        <div className="flex mt-1">
          {event.task.team.slice(0, 3).map((member, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center -mr-2 border-2 border-white dark:border-gray-800"
              title={member.name}
            >
              {getInitials(member.name)}
            </div>
          ))}
          {event.task.team.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center border-2 border-white dark:border-gray-800">
              +{event.task.team.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (isLoading) return <Loading />;

  return (
    <div className="h-full p-4 bg-white dark:bg-gray-900 rounded-lg">
      <style>
        {`
          .rbc-calendar {
            background: white;
            height: 100%;
            border-radius: 0.5rem;
            overflow: hidden;
          }
          
          .dark .rbc-calendar {
            background: #1f2937;
          }
          
          .rbc-header {
            padding: 10px 0;
          }
          
          .rbc-event {
            cursor: pointer;
            padding: 2px 5px;
            border-radius: 4px;
            font-size: 0.85rem;
          }
        `}
      </style>

      <div className="h-[700px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          views={["month", "week", "day"]}
          defaultView="week"
          view={currentView}
          onView={handleView}
          date={currentDate}
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventDrop}
          components={{
            toolbar: CustomToolbar,
            event: EventComponent,
          }}
          eventPropGetter={eventStyleGetter}
          selectable
          resizable
          step={30}
          timeslots={2}
        />
      </div>
    </div>
  );
};

export default CalendarView;
