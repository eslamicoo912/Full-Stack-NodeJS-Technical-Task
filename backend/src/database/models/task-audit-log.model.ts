import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { TaskStatus } from './task.model';

export interface ITaskAuditLog extends Document {
  task: Types.ObjectId;
  project: Types.ObjectId;
  changedBy: Types.ObjectId;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  createdAt: Date;
}

const taskAuditLogSchema = new Schema<ITaskAuditLog>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Audit log must reference a task'],
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Audit log must reference a project'],
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Audit log must reference the user who made the change'],
    },
    // Null when the task is first created (no previous status)
    fromStatus: {
      type: String,
      enum: [...Object.values(TaskStatus), null],
      default: null,
    },
    toStatus: {
      type: String,
      enum: Object.values(TaskStatus),
      required: [true, 'New status is required'],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Retrieve a task's status history in chronological order
taskAuditLogSchema.index({ task: 1, createdAt: -1 });
taskAuditLogSchema.index({ project: 1, createdAt: -1 });

export const TaskAuditLog: Model<ITaskAuditLog> = mongoose.model<ITaskAuditLog>(
  'TaskAuditLog',
  taskAuditLogSchema
);
