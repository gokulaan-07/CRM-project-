import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivity extends Document {
  leadId?: mongoose.Types.ObjectId;
  leadName?: string;
  customerId?: mongoose.Types.ObjectId;
  customerName?: string;
  dealId?: mongoose.Types.ObjectId;
  type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'StatusChange';
  title: string;
  description: string;
  performedBy: mongoose.Types.ObjectId;
  performedByName?: string;
  timestamp: Date;
  outcome?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema: Schema<IActivity> = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', default: null },
    leadName: { type: String, default: '' },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', default: null },
    customerName: { type: String, default: '' },
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal', default: null },
    type: {
      type: String,
      enum: ['Call', 'Email', 'Meeting', 'Note', 'StatusChange'],
      default: 'Note'
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    performedByName: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    outcome: { type: String, default: '' }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc: any, ret: any) => {
        ret._id = ret._id ? ret._id.toString() : ret._id;
        if (ret.leadId) ret.leadId = ret.leadId.toString();
        if (ret.customerId) ret.customerId = ret.customerId.toString();
        if (ret.dealId) ret.dealId = ret.dealId.toString();
        if (ret.performedBy) ret.performedBy = ret.performedBy.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const Activity: Model<IActivity> = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
