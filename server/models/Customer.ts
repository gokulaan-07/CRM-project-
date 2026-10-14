import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomer extends Document {
  leadId?: mongoose.Types.ObjectId;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'VIP' | 'Churned';
  assignedTo: mongoose.Types.ObjectId;
  assignedUserName?: string;
  totalValue: number;
  convertedAt?: Date;
  notes?: string;
  address?: string;
  industry?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema<ICustomer> = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', default: null },
    name: { type: String, required: true, trim: true },
    company: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'VIP', 'Churned'],
      default: 'Active'
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedUserName: { type: String, default: '' },
    totalValue: { type: Number, default: 0, min: 0 },
    convertedAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    address: { type: String, default: '' },
    industry: { type: String, default: 'Technology' }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc: any, ret: any) => {
        ret._id = ret._id ? ret._id.toString() : ret._id;
        if (ret.leadId) ret.leadId = ret.leadId.toString();
        if (ret.assignedTo) ret.assignedTo = ret.assignedTo.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const Customer: Model<ICustomer> = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
