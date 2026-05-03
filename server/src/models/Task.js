import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo"
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"]
    },
    issue: {
      message: {
        type: String,
        trim: true,
        default: ""
      },
      status: {
        type: String,
        enum: ["none", "open", "resolved"],
        default: "none"
      },
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
      },
      reportedAt: {
        type: Date,
        default: null
      },
      resolvedAt: {
        type: Date,
        default: null
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
