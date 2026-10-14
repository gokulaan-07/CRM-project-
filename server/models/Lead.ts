import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILead extends Document {
  name: string;
  email: string;
  phone: string;
  company: string;
  source: 'Website' | 'Referral' | 'Advertisement' | 'Social Media' | 'Email' | 'Phone' | 'Other';
  interest: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost' | 'Converted';
  priority: 'Low' | 'Medium' | 'High';
  estimatedValue: number;
  assignedTo: mongoose.Types.ObjectId;
  assignedUserName?: string;
  notes: string;
  isConverted: boolean;
  customerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema<ILead> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    company: { type: String, default: '', trim: true },
    source: {
      type: String,
      enum: ['Website', 'Referral', 'Advertisement', 'Social Media', 'Email', 'Phone', 'Other'],
      default: 'Website'
    },
    interest: { type: String, default: 'General Inquiry', trim: true },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost', 'Converted'],
      default: 'New'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    estimatedValue: { type: Number, default: 0, min: 0 },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedUserName: { type: String, default: '' },
    notes: { type: String, default: '' },
    isConverted: { type: Boolean, default: false },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', default: null }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc: any, ret: any) => {
        ret._id = ret._id ? ret._id.toString() : ret._id;
        if (ret.assignedTo) ret.assignedTo = ret.assignedTo.toString();
        if (ret.customerId) ret.customerId = ret.customerId.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
