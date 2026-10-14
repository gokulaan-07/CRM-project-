import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDeal extends Document {
  title: string;
  customerId?: mongoose.Types.ObjectId;
  customerName?: string;
  leadId?: mongoose.Types.ObjectId;
  leadName?: string;
  value: number;
  stage: 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  probability: number;
  expectedCloseDate: string;
  assignedTo: mongoose.Types.ObjectId;
  assignedUserName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DealSchema: Schema<IDeal> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', default: null },
    customerName: { type: String, default: '' },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', default: null },
    leadName: { type: String, default: '' },
    value: { type: Number, default: 0, min: 0 },
    stage: {
      type: String,
      enum: ['Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'],
      default: 'Qualified'
    },
    probability: { type: Number, default: 50, min: 0, max: 100 },
    expectedCloseDate: { type: String, default: '' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedUserName: { type: String, default: '' },
    notes: { type: String, default: '' }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc: any, ret: any) => {
        ret._id = ret._id ? ret._id.toString() : ret._id;
        if (ret.customerId) ret.customerId = ret.customerId.toString();
        if (ret.leadId) ret.leadId = ret.leadId.toString();
        if (ret.assignedTo) ret.assignedTo = ret.assignedTo.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const Deal: Model<IDeal> = mongoose.models.Deal || mongoose.model<IDeal>('Deal', DealSchema);
