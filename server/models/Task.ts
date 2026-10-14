import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITask extends Document {
  leadId?: mongoose.Types.ObjectId;
  leadName?: string;
  customerId?: mongoose.Types.ObjectId;
  customerName?: string;
  dealId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Completed' | 'Overdue';
  type: 'Call' | 'Email' | 'Meeting' | 'FollowUp' | 'Proposal' | 'Task';
  assignedTo: mongoose.Types.ObjectId;
  assignedUserName?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema<ITask> = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', default: null },
    leadName: { type: String, default: '' },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', default: null },
    customerName: { type: String, default: '' },
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal', default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    dueDate: { type: String, required: true },
    dueTime: { type: String, default: '10:00 AM' },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Overdue'],
      default: 'Pending'
    },
    type: {
      type: String,
      enum: ['Call', 'Email', 'Meeting', 'FollowUp', 'Proposal', 'Task'],
      default: 'FollowUp'
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedUserName: { type: String, default: '' },
    completedAt: { type: Date, default: null }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc: any, ret: any) => {
        ret._id = ret._id ? ret._id.toString() : ret._id;
        if (ret.leadId) ret.leadId = ret.leadId.toString();
        if (ret.customerId) ret.customerId = ret.customerId.toString();
        if (ret.dealId) ret.dealId = ret.dealId.toString();
        if (ret.assignedTo) ret.assignedTo = ret.assignedTo.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
