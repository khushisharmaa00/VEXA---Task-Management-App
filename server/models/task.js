import mongoose, { Schema } from "mongoose";

const activitySchema = new Schema({
  type: {
    type: String,
    enum: [
      "assigned",
      "started",
      "in progress",
      "bug",
      "completed",
      "commented",
    ],
    default: "assigned",
  },
  activity: String,
  date: { type: Date, default: Date.now },
  by: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const subTaskSchema = new Schema({
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  tag: String,
});

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    // description: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    calendarEvent: {
      start: { type: Date, required: true },
      end: Date,
      allDay: { type: Boolean, default: false },
      eventColor: { type: String, default: "#38bdf8" },
    },
    priority: {
      type: String,
      enum: ["high", "medium", "normal", "low"],
      default: "normal",
    },
    stage: {
      type: String,
      enum: ["todo", "in progress", "completed"],
      default: "todo",
    },
    activities: [activitySchema],
    subTasks: [subTaskSchema],
    assets: [String],
    team: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      default: [],
    },
    isTrashed: { type: Boolean, default: false },
  },

  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// Enhanced population middleware
taskSchema.pre(/^find/, function (next) {
  console.log("Populating team data...");
  this.populate({
    path: "team",
    select: "name email title",
  });
  next();
});

// Add this after your Task schema definition
const Task = mongoose.model("Task", taskSchema);

export default Task;
