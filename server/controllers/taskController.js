import Notice from "../models/notification.js";
import Task from "../models/task.js";
import User from "../models/user.js";
import mongoose from "mongoose";

// export const createTask = async (req, res) => {
//   try {
//     const { userId } = req.user;

//     const { title, team = [], stage, date, priority } = req.body;

//     if (!title?.trim()) {
//       return res.status(400).json({
//         status: false,
//         message: "Title is required",
//       });
//     }
//     let uploadedAssets = [];
//     if (req.files && req.files.length > 0) {
//       uploadedAssets = req.files.map((file) => {
//         // For local storage
//         return `/uploads/${file.filename}`;

//         // For cloud storage (e.g., AWS S3)
//         // return file.location;
//       });
//     }

//     const validTeamMembers = await User.find({
//       _id: { $in: team },
//       isActive: true,
//     }).select("_id");

//     if (validTeamMembers.length !== team.length) {
//       console.warn("Invalid or inactive team members detected");
//     }

//     const validTeamIds = validTeamMembers.map((member) => member._id);

//     const notificationText = `New task "${title}" has been assigned to you${
//       validTeamIds.length > 1 ? ` and ${validTeamIds.length - 1} others.` : "."
//     } Priority: ${priority}. Due: ${new Date(date).toDateString()}.`;

//     const task = await Task.create({
//       title,
//       team: validTeamIds,
//       stage: stage?.toLowerCase(),
//       date,
//       priority: priority?.toLowerCase(),
//       assets: uploadedAssets,
//       calendarEvent: {
//         // Add calendar event data
//         start: new Date(date),
//         end: new Date(new Date(date).setHours(new Date(date).getHours() + 1)),
//         allDay: false,
//         eventColor: "#38bdf8",
//       },
//       activities: [
//         {
//           type: "assigned",
//           activity: `Task assigned to ${validTeamIds.length} members.`,
//           by: userId,
//           date: new Date(),
//         },
//       ],
//       isTrashed: false,
//     });
//     console.log("Saved task team:", task.team);
//     console.log("Saved task:", task);
//     // Create notifications
//     await Notice.create({
//       team: validTeamIds,
//       text: notificationText,
//       task: task._id,
//       notiType: "alert",
//     });
//     console.log("Notification created:");
//     // Populate the team field before sending the response
//     const populatedTask = await Task.findById(task._id).populate(
//       "team",
//       "name email title role"
//     );
//     res.status(200).json({
//       status: true,
//       task: populatedTask,
//       message: "Task created successfully.",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ status: false, message: error.message });
//   }
// };
// Update your createTask controller
export const createTask = async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, team, stage, date, priority } = req.body;

    // Validate required fields
    if (!title?.trim()) {
      return res.status(400).json({
        status: false,
        message: "Title is required",
      });
    }

    // Handle file uploads
    let uploadedAssets = [];
    if (req.files && req.files.length > 0) {
      uploadedAssets = req.files.map((file) => {
        // For local storage
        return `/uploads/${file.filename}`;

        // For cloud storage (e.g., AWS S3)
        // return file.location;
      });
    }

    // Validate team members
    let validTeamIds = [];
    if (team && team.length > 0) {
      // If team comes as JSON string, parse it
      const teamArray = typeof team === "string" ? JSON.parse(team) : team;

      const validTeamMembers = await User.find({
        _id: { $in: teamArray },
        isActive: true,
      }).select("_id");

      validTeamIds = validTeamMembers.map((member) => member._id);
    }

    // Create task
    const task = await Task.create({
      title,
      team: validTeamIds,
      stage: stage?.toLowerCase(),
      date,
      priority: priority?.toLowerCase(),
      assets: uploadedAssets,
      calendarEvent: {
        start: new Date(date),
        // end: new Date(taskDate.setHours(taskDate.getHours() + 1)),
        end: new Date(new Date(date).setHours(new Date(date).getHours() + 1)),
        allDay: false,
        eventColor: "#38bdf8",
      },
      activities: [
        {
          type: "assigned",
          activity: `Task assigned to ${validTeamIds.length} members.`,
          by: userId,
          date: new Date(),
        },
      ],
      isTrashed: false,
    });

    // Send notifications
    if (validTeamIds.length > 0) {
      const notificationText = `New task "${title}" has been assigned to you${
        validTeamIds.length > 1
          ? ` and ${validTeamIds.length - 1} others.`
          : "."
      } Priority: ${priority}. Due: ${new Date(date).toDateString()}.`;

      await Notice.create({
        team: validTeamIds,
        text: notificationText,
        task: task._id,
        notiType: "alert",
      });
    }

    // Populate the task before sending response
    const populatedTask = await Task.findById(task._id).populate(
      "team",
      "name email title role"
    );

    res.status(200).json({
      status: true,
      task: populatedTask,
      message: "Task created successfully.",
    });
  } catch (error) {
    console.error("Task creation error:", error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
export const duplicateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    const newTask = await Task.create({
      ...task,
      title: task.title + " - Duplicate",
    });

    newTask.team = task.team;
    newTask.subTasks = task.subTasks;
    newTask.assets = task.assets;
    newTask.priority = task.priority;
    newTask.stage = task.stage;

    await newTask.save();

    //alert users of the task
    let text = "New task has been assigned to you";
    if (task.team.length > 1) {
      text = text + ` and ${task.team.length - 1} others.`;
    }

    text =
      text +
      ` The task priority is set a ${
        task.priority
      } priority, so check and act accordingly. The task date is ${task.date.toDateString()}. Thank you!!!`;

    await Notice.create({
      team: task.team,
      text,
      task: newTask._id,
    });

    res
      .status(200)
      // .json({ status: true, message: "Task duplicated successfully." });
      .json({ status: true, message: "Task updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const postTaskActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { type, activity } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }
    // Get user details for the activity
    const user = await User.findById(userId).select("name");
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    let activityText = activity;
    if (!activityText) {
      // Generate default activity text based on type
      switch (type) {
        case "started":
          activityText = `${user.name} started working on this task`;
          break;
        case "completed":
          activityText = `${user.name} marked this task as completed`;
          break;
        case "in progress":
          activityText = `${user.name} updated the task progress`;
          break;
        case "commented":
          activityText = `${user.name} added a comment`;
          break;
        case "bug":
          activityText = `${user.name} reported a bug`;
          break;
        default:
          activityText = `${user.name} updated the task`;
      }
    }
    const data = {
      type,
      activity: activityText,
      by: userId,
      date: new Date(),
    };

    task.activities.push(data);

    await task.save();
    // Send notification to team members for important activities
    if (["started", "completed", "bug"].includes(type)) {
      await Notice.create({
        team: task.team.filter(
          (member) => member.toString() !== userId.toString()
        ),
        text: activityText,
        task: task._id,
        notiType: type === "bug" ? "alert" : "message",
      });
    }

    res.status(200).json({
      status: true,
      message: "Activity posted successfully.",
      activity: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const dashboardStatistics = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    const currentDate = new Date();

    const firstDayOfCurrentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfCurrentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const firstDayOfLastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const lastDayOfLastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );

    // .sort({ _id: -1 });
    const allTasks = await Task.find({
      isTrashed: false,
    })
      .populate({
        path: "team",
        select: "name role title email",
      })
      .sort({ _id: -1 });
    const lastMonthTasks = await Task.find({
      isTrashed: false,
      createdAt: {
        $gte: firstDayOfLastMonth,
        $lte: lastDayOfLastMonth,
      },
    });

    // Calculate current month counts by stage
    const currentTasksByStage = {
      todo: allTasks.filter((t) => t.stage === "todo").length,
      "in progress": allTasks.filter((t) => t.stage === "in progress").length,
      completed: allTasks.filter((t) => t.stage === "completed").length,
      total: allTasks.length,
    };

    // Calculate last month counts by stage
    const lastMonthTasksByStage = {
      todo: lastMonthTasks.filter((t) => t.stage === "todo").length,
      "in progress": lastMonthTasks.filter((t) => t.stage === "in progress")
        .length,
      completed: lastMonthTasks.filter((t) => t.stage === "completed").length,
      total: lastMonthTasks.length,
    };

    const users = await User.find({ isActive: true })
      .select("name title role createdAt")
      .limit(10)
      .sort({ _id: -1 });

    //   group task by stage and calculate counts

    const priorities = ["high", "medium", "normal", "low"];
    const graphData = priorities.map((priority) => ({
      name: priority,
      total: allTasks.filter((t) => t.priority === priority).length,
    }));

    const last10Task = allTasks?.slice(0, 10);
    const summary = {
      totalTasks: currentTasksByStage.total,
      last10Task,
      users: isAdmin ? users : [],
      // User,
      // tasks: groupTaskks,
      tasks: currentTasksByStage,
      lastMonthTasks: lastMonthTasksByStage,
      graphData,
    };

    res.status(200).json({
      status: true,
      message: "Dashboard statistics retrieved successfully",
      ...summary,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const searchTasks = async (req, res) => {
  try {
    const { q } = req.query;
    const { userId, isAdmin } = req.user;

    // Build base query
    const query = {
      title: { $regex: q, $options: "i" },
      isTrashed: false,
    };

    // Only filter by team if user is not admin
    if (!isAdmin) {
      query.$or = [
        { team: { $in: [userId] } },
        { team: { $size: 0 } }, // Include tasks with no team
      ];
    }

    const tasks = await Task.find(query)
      .select("title _id") // Only select existing fields
      .limit(10)
      .populate({
        path: "team",
        select: "name email title",
      });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Search error:", error);
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};
export const getTasks = async (req, res) => {
  try {
    const { stage, isTrashed } = req.query;

    // const query = { isTrashed: isTrashed ? true : false };
    const query = { isTrashed: isTrashed === "true" };
    if (stage) {
      query.stage = stage.toLowerCase();
    }

    // const tasks = await Task.find(query)
    //   .populate({
    //     path: "team",
    //     select: "name title email ",
    //   })
    //   .sort({ _id: -1 });
    // const tasks = await Task.find(query).sort({ createdAt: -1 });

    // const tasks = await Task.find(query).populate(
    //   "team",
    //   "name email title role"
    // );

    const tasks = await Task.find(query)
      .populate({
        path: "team",
        select: "name email title ",
      })
      .sort({ createdAt: -1 });

    // Verify population
    if (tasks.length > 0 && !tasks[0].team[0]?.name) {
      console.warn("Team population may have failed");
    }
    res.status(200).json({
      status: true,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate({
        path: "team",
        select: "name title role email",
      })
      .populate("activities.by", "name email")
      .lean();

    // Explicitly include subtasks (if not already included)
    task.subTasks = task.subTasks || [];

    res.status(200).json({
      status: true,
      task,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const createSubTask = async (req, res) => {
  try {
    const { title, tag, date } = req.body;

    const { id } = req.params;

    const newSubTask = {
      title,
      date,
      tag,
    };

    // const task = await Task.findById(id);
    // if (!task) {
    //   return res.status(404).json({ status: false, message: "Task not found" });
    // }

    // task.subTasks.push(newSubTask);

    // await task.save();
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $push: { subTasks: newSubTask } },
      { new: true } // return the updated document
    ).populate("team", "name email title role"); // re-populate if you need

    if (!updatedTask) {
      return res.status(404).json({
        status: false,
        message: "Task not found",
      });
    }
    res.status(200).json({
      status: true,
      message: "SubTask added successfully.",
      task: updatedTask,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, team, stage, priority, assets } = req.body;

    // Validate and filter valid user IDs
    const validTeam = Array.isArray(team)
      ? team.filter((id) => mongoose.Types.ObjectId.isValid(id))
      : [];

    // const task = await Task.findByIdAndUpdate(id);
    const task = await Task.findById(id);
    task.title = title;
    task.date = date;
    task.priority = priority.toLowerCase();
    task.assets = assets;
    task.stage = stage.toLowerCase();
    task.team = validTeam;
    task.calendarEvent = {
      start: new Date(date),
      end: new Date(new Date(date).setHours(new Date(date).getHours() + 1)),
      allDay: false,
      eventColor: task.calendarEvent?.eventColor || "#38bdf8",
    };

    await task.save();

    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    res
      .status(200)
      .json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const trashTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }
    task.isTrashed = true;

    await task.save();

    res.status(200).json({
      status: true,
      message: "Task moved to trash",
      task,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
export const restoreTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task)
      return res.status(404).json({ status: false, message: "Task not found" });

    task.isTrashed = false;

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Task restored successfully." });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteRestoreTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;

    if (actionType === "delete") {
      await Task.findByIdAndUpdate(id, { isTrashed: true });
    } else if (actionType === "deleteAll") {
      await Task.updateMany(
        { isTrashed: true },
        { $set: { isTrashed: false } }
      );
    } else if (actionType === "restore") {
      const resp = await Task.findById(id);

      resp.isTrashed = false;
      resp.save();
    } else if (actionType === "restoreAll") {
      await Task.updateMany(
        { isTrashed: true },
        { $set: { isTrashed: false } }
      );
    }

    res.status(200).json({
      status: true,
      message: `Operation performed successfully.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
// Get tasks for calendar
// export const getCalendarTasks = async (req, res) => {
//   try {
//     const tasks = await Task.find()
//       .populate("team", "name email title")
//       .sort({ "calendarEvent.start": 1 });

//     res.status(200).json(tasks);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };
export const getCalendarTasks = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res
        .status(400)
        .json({ message: "Start and end dates are required" });
    }

    const tasks = await Task.find({
      $or: [
        {
          "calendarEvent.start": {
            $gte: new Date(start),
            $lte: new Date(end),
          },
        },
        {
          date: {
            $gte: new Date(start),
            $lte: new Date(end),
          },
        },
      ],
      isTrashed: false,
    })
      .populate({
        path: "team",
        select: "name email title",
      })
      .sort({ "calendarEvent.start": 1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Calendar tasks error:", error);
    res.status(400).json({ message: error.message });
  }
};
// // Update task dates
export const updateTaskDates = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        "calendarEvent.start": req.body.start,
        "calendarEvent.end": req.body.end,
      },
      { new: true }
    ).populate("team", "name email title");

    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// In your taskController.js
