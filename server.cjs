var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");

// server/db.ts
var import_mongoose8 = __toESM(require("mongoose"), 1);
var import_mongodb_memory_server = require("mongodb-memory-server");

// server/models/User.ts
var import_mongoose = __toESM(require("mongoose"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var UserSchema = new import_mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "sales"], default: "sales" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    avatar: { type: String, default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
    phone: { type: String, default: "" },
    department: { type: String, default: "Sales" }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret._id = ret._id ? ret._id.toString() : ret._id;
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);
UserSchema.pre("save", async function() {
  if (!this.isModified("password") || !this.password) {
    return;
  }
  const salt = await import_bcryptjs.default.genSalt(10);
  this.password = await import_bcryptjs.default.hash(this.password, salt);
});
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return import_bcryptjs.default.compare(candidatePassword, this.password);
};
var User = import_mongoose.default.models.User || import_mongoose.default.model("User", UserSchema);

// server/models/Lead.ts
var import_mongoose2 = __toESM(require("mongoose"), 1);
var LeadSchema = new import_mongoose2.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    company: { type: String, default: "", trim: true },
    source: {
      type: String,
      enum: ["Website", "Referral", "Advertisement", "Social Media", "Email", "Phone", "Other"],
      default: "Website"
    },
    interest: { type: String, default: "General Inquiry", trim: true },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost", "Converted"],
      default: "New"
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },
    estimatedValue: { type: Number, default: 0, min: 0 },
    assignedTo: { type: import_mongoose2.Schema.Types.ObjectId, ref: "User", required: true },
    assignedUserName: { type: String, default: "" },
    notes: { type: String, default: "" },
    isConverted: { type: Boolean, default: false },
    customerId: { type: import_mongoose2.Schema.Types.ObjectId, ref: "Customer", default: null }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret._id = ret._id ? ret._id.toString() : ret._id;
        if (ret.assignedTo) ret.assignedTo = ret.assignedTo.toString();
        if (ret.customerId) ret.customerId = ret.customerId.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);
var Lead = import_mongoose2.default.models.Lead || import_mongoose2.default.model("Lead", LeadSchema);

// server/models/Customer.ts
var import_mongoose3 = __toESM(require("mongoose"), 1);
var CustomerSchema = new import_mongoose3.Schema(
  {
    leadId: { type: import_mongoose3.Schema.Types.ObjectId, ref: "Lead", default: null },
    name: { type: String, required: true, trim: true },
    company: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["Active", "Inactive", "VIP", "Churned"],
      default: "Active"
    },
    assignedTo: { type: import_mongoose3.Schema.Types.ObjectId, ref: "User", required: true },
    assignedUserName: { type: String, default: "" },
    totalValue: { type: Number, default: 0, min: 0 },
    convertedAt: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
    address: { type: String, default: "" },
    industry: { type: String, default: "Technology" }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret._id = ret._id ? ret._id.toString() : ret._id;
        if (ret.leadId) ret.leadId = ret.leadId.toString();
        if (ret.assignedTo) ret.assignedTo = ret.assignedTo.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);
var Customer = import_mongoose3.default.models.Customer || import_mongoose3.default.model("Customer", CustomerSchema);

// server/models/Deal.ts
var import_mongoose4 = __toESM(require("mongoose"), 1);
var DealSchema = new import_mongoose4.Schema(
  {
    title: { type: String, required: true, trim: true },
    customerId: { type: import_mongoose4.Schema.Types.ObjectId, ref: "Customer", default: null },
    customerName: { type: String, default: "" },
    leadId: { type: import_mongoose4.Schema.Types.ObjectId, ref: "Lead", default: null },
    leadName: { type: String, default: "" },
    value: { type: Number, default: 0, min: 0 },
    stage: {
      type: String,
      enum: ["Qualified", "Proposal", "Negotiation", "Won", "Lost"],
      default: "Qualified"
    },
    probability: { type: Number, default: 50, min: 0, max: 100 },
    expectedCloseDate: { type: String, default: "" },
    assignedTo: { type: import_mongoose4.Schema.Types.ObjectId, ref: "User", required: true },
    assignedUserName: { type: String, default: "" },
    notes: { type: String, default: "" }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
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
var Deal = import_mongoose4.default.models.Deal || import_mongoose4.default.model("Deal", DealSchema);

// server/models/Activity.ts
var import_mongoose5 = __toESM(require("mongoose"), 1);
var ActivitySchema = new import_mongoose5.Schema(
  {
    leadId: { type: import_mongoose5.Schema.Types.ObjectId, ref: "Lead", default: null },
    leadName: { type: String, default: "" },
    customerId: { type: import_mongoose5.Schema.Types.ObjectId, ref: "Customer", default: null },
    customerName: { type: String, default: "" },
    dealId: { type: import_mongoose5.Schema.Types.ObjectId, ref: "Deal", default: null },
    type: {
      type: String,
      enum: ["Call", "Email", "Meeting", "Note", "StatusChange"],
      default: "Note"
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    performedBy: { type: import_mongoose5.Schema.Types.ObjectId, ref: "User", required: true },
    performedByName: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
    outcome: { type: String, default: "" }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
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
var Activity = import_mongoose5.default.models.Activity || import_mongoose5.default.model("Activity", ActivitySchema);

// server/models/Task.ts
var import_mongoose6 = __toESM(require("mongoose"), 1);
var TaskSchema = new import_mongoose6.Schema(
  {
    leadId: { type: import_mongoose6.Schema.Types.ObjectId, ref: "Lead", default: null },
    leadName: { type: String, default: "" },
    customerId: { type: import_mongoose6.Schema.Types.ObjectId, ref: "Customer", default: null },
    customerName: { type: String, default: "" },
    dealId: { type: import_mongoose6.Schema.Types.ObjectId, ref: "Deal", default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    dueDate: { type: String, required: true },
    dueTime: { type: String, default: "10:00 AM" },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Overdue"],
      default: "Pending"
    },
    type: {
      type: String,
      enum: ["Call", "Email", "Meeting", "FollowUp", "Proposal", "Task"],
      default: "FollowUp"
    },
    assignedTo: { type: import_mongoose6.Schema.Types.ObjectId, ref: "User", required: true },
    assignedUserName: { type: String, default: "" },
    completedAt: { type: Date, default: null }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
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
var Task = import_mongoose6.default.models.Task || import_mongoose6.default.model("Task", TaskSchema);

// server/models/Notification.ts
var import_mongoose7 = __toESM(require("mongoose"), 1);
var NotificationSchema = new import_mongoose7.Schema(
  {
    userId: { type: import_mongoose7.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["lead", "deal", "task", "conversion", "system"],
      default: "system"
    },
    link: { type: String, default: "" },
    read: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret._id = ret._id ? ret._id.toString() : ret._id;
        if (ret.userId) ret.userId = ret.userId.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);
var Notification = import_mongoose7.default.models.Notification || import_mongoose7.default.model("Notification", NotificationSchema);

// server/db.ts
var mongod = null;
function isValidMongoUri(uri) {
  if (!uri || typeof uri !== "string") return false;
  const trimmed = uri.trim();
  return trimmed.startsWith("mongodb://") || trimmed.startsWith("mongodb+srv://");
}
async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (import_mongoose8.default.connection.readyState === 1) {
    return import_mongoose8.default;
  }
  if (isValidMongoUri(uri)) {
    const cleanUri = uri.trim();
    console.log(`[MongoDB] Connecting to external MongoDB at ${cleanUri.replace(/:([^:@]{4})[^:@]*@/, ":****@")}...`);
    try {
      await import_mongoose8.default.connect(cleanUri);
      console.log("[MongoDB] Successfully connected to external MongoDB");
      await seedDatabaseIfEmpty();
      return import_mongoose8.default;
    } catch (err) {
      console.error("[MongoDB] Failed to connect to external MongoDB URI, falling back to embedded MongoDB:", err);
    }
  }
  console.log("[MongoDB] Starting embedded MongoDB server instance...");
  try {
    mongod = await import_mongodb_memory_server.MongoMemoryServer.create({
      instance: {
        dbName: "crm_production"
      }
    });
    const memoryUri = mongod.getUri();
    await import_mongoose8.default.connect(memoryUri);
    console.log(`[MongoDB] Connected to embedded MongoDB successfully at ${memoryUri}`);
    await seedDatabaseIfEmpty();
  } catch (memErr) {
    console.error("[MongoDB] Embedded MongoDB start error:", memErr);
    throw memErr;
  }
  return import_mongoose8.default;
}
async function seedDatabaseIfEmpty(forceReset = false) {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0 && !forceReset) {
      return;
    }
    if (forceReset) {
      await Promise.all([
        User.deleteMany({}),
        Lead.deleteMany({}),
        Customer.deleteMany({}),
        Deal.deleteMany({}),
        Activity.deleteMany({}),
        Task.deleteMany({}),
        Notification.deleteMany({})
      ]);
    }
    console.log("[MongoDB] Seeding database with initial users, Rahul Kumar sales journey, and pipeline data...");
    const userAdmin = await User.create({
      name: "Gokulaan",
      email: "gokulaan9c@gmail.com",
      password: "password123",
      role: "admin",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      phone: "+91 98765 43210",
      department: "Sales & Management"
    });
    const userPriya = await User.create({
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      password: "password123",
      role: "sales",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      phone: "+91 98765 43211",
      department: "Enterprise Sales"
    });
    const userArun = await User.create({
      name: "Arun Patel",
      email: "arun.patel@example.com",
      password: "password123",
      role: "sales",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      phone: "+91 98765 43212",
      department: "Inside Sales"
    });
    const userAnanya = await User.create({
      name: "Ananya Rao",
      email: "ananya.rao@example.com",
      password: "password123",
      role: "sales",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      phone: "+91 98765 43213",
      department: "Mid-Market Sales"
    });
    const custRohit = await Customer.create({
      name: "Rohit Singhania",
      company: "Singhania Organic Foods",
      email: "rohit@singhaniafoods.com",
      phone: "+91 98990 12345",
      status: "VIP",
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name,
      totalValue: 45e4,
      convertedAt: /* @__PURE__ */ new Date("2026-08-01T11:00:00.000Z"),
      notes: "Converted from Lead. Phase 1 delivery in progress.",
      address: "42 Commercial Street, Bangalore, Karnataka",
      industry: "Food & Beverage"
    });
    const custVikram = await Customer.create({
      name: "Vikram Mehta",
      company: "Zenith Global Logistics",
      email: "vikram@zenithlogistics.com",
      phone: "+91 99001 23456",
      status: "Active",
      assignedTo: userPriya._id,
      assignedUserName: userPriya.name,
      totalValue: 5e5,
      convertedAt: /* @__PURE__ */ new Date("2026-07-10T14:30:00.000Z"),
      notes: "Long-term enterprise customer. Annual support contract active.",
      address: "Plot 18, BKC Complex, Mumbai, Maharashtra",
      industry: "Supply Chain & Logistics"
    });
    const custSneha = await Customer.create({
      name: "Sneha Kapoor",
      company: "Kapoor Fashion Trends",
      email: "sneha@kapoorfashion.in",
      phone: "+91 99112 34567",
      status: "Active",
      assignedTo: userArun._id,
      assignedUserName: userArun.name,
      totalValue: 22e4,
      convertedAt: /* @__PURE__ */ new Date("2026-07-28T16:00:00.000Z"),
      notes: "E-commerce platform launched successfully.",
      address: "Connaught Place, New Delhi",
      industry: "Retail & Fashion"
    });
    const leadRahul = await Lead.create({
      name: "Rahul Kumar",
      email: "rahul.kumar@abctech.in",
      phone: "+91 98112 34567",
      company: "ABC Technologies",
      source: "Website",
      interest: "E-commerce Website",
      status: "Qualified",
      priority: "High",
      estimatedValue: 2e5,
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name,
      notes: "Inquired for complete modern e-commerce web platform with payment integration, product catalog, and order management.",
      isConverted: false
    });
    const leadPriya = await Lead.create({
      name: "Priya Desai",
      email: "priya@boutiquestyle.com",
      phone: "+91 98223 45678",
      company: "Priya Boutique",
      source: "Referral",
      interest: "Mobile App Development",
      status: "Contacted",
      priority: "Medium",
      estimatedValue: 1e5,
      assignedTo: userPriya._id,
      assignedUserName: userPriya.name,
      notes: "Needs iOS & Android boutique shopping application. First discovery call conducted.",
      isConverted: false
    });
    const leadArun = await Lead.create({
      name: "Arun Deshmukh",
      email: "arun@apexlogistics.in",
      phone: "+91 98334 56789",
      company: "Apex Logistics",
      source: "Advertisement",
      interest: "CRM Integration & ERP",
      status: "Qualified",
      priority: "High",
      estimatedValue: 3e5,
      assignedTo: userArun._id,
      assignedUserName: userArun.name,
      notes: "Fleet management tracking & custom CRM modules. Budget pre-approved.",
      isConverted: false
    });
    const leadKarthik = await Lead.create({
      name: "Karthik Menon",
      email: "karthik@fintechsol.io",
      phone: "+91 98445 67890",
      company: "Karthik FinTech",
      source: "Social Media",
      interest: "Financial Dashboard",
      status: "Proposal",
      priority: "Medium",
      estimatedValue: 15e4,
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name,
      notes: "Sent formal scope document and technical quotation for \u20B91.5L. Awaiting review.",
      isConverted: false
    });
    const leadSuresh = await Lead.create({
      name: "Suresh Nair",
      email: "suresh@nairhealth.org",
      phone: "+91 98556 78901",
      company: "Nair Healthcare",
      source: "Phone",
      interest: "Hospital Management System",
      status: "Negotiation",
      priority: "High",
      estimatedValue: 25e4,
      assignedTo: userPriya._id,
      assignedUserName: userPriya.name,
      notes: "In final discount negotiation. Client requested 5% waiver on annual maintenance.",
      isConverted: false
    });
    const leadAjay = await Lead.create({
      name: "Ajay Verma",
      email: "ajay@vermaproperties.in",
      phone: "+91 98667 89012",
      company: "Verma Real Estate",
      source: "Referral",
      interest: "Property Listing Portal",
      status: "Won",
      priority: "High",
      estimatedValue: 3e5,
      assignedTo: userArun._id,
      assignedUserName: userArun.name,
      notes: "Proposal accepted and initial deposit agreed. Ready to convert to official customer!",
      isConverted: false
    });
    const leadDeepak = await Lead.create({
      name: "Deepak Sharma",
      email: "deepak@deepakauto.com",
      phone: "+91 98778 90123",
      company: "Deepak Auto Works",
      source: "Website",
      interest: "Dealership Website & Booking",
      status: "New",
      priority: "Low",
      estimatedValue: 8e4,
      assignedTo: userAnanya._id,
      assignedUserName: userAnanya.name,
      notes: "Submitted contact form requesting simple dynamic catalog.",
      isConverted: false
    });
    const leadMeera = await Lead.create({
      name: "Meera Iyer",
      email: "meera@meeracloud.co",
      phone: "+91 98889 01234",
      company: "Meera Cloud Solutions",
      source: "Email",
      interest: "Cloud Migration & Support",
      status: "Lost",
      priority: "Medium",
      estimatedValue: 12e4,
      assignedTo: userAnanya._id,
      assignedUserName: userAnanya.name,
      notes: "Client decided to build in-house with existing engineering team.",
      isConverted: false
    });
    const leadRohitConverted = await Lead.create({
      name: "Rohit Singhania",
      email: "rohit@singhaniafoods.com",
      phone: "+91 98990 12345",
      company: "Singhania Organic Foods",
      source: "Referral",
      interest: "Food Delivery Portal & App",
      status: "Converted",
      priority: "High",
      estimatedValue: 45e4,
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name,
      notes: "Successfully won and converted to key corporate client.",
      isConverted: true,
      customerId: custRohit._id
    });
    custRohit.leadId = leadRohitConverted._id;
    await custRohit.save();
    await Deal.create({
      title: "E-commerce Platform Phase 1",
      customerId: custRohit._id,
      customerName: custRohit.company,
      leadId: leadRohitConverted._id,
      leadName: leadRohitConverted.name,
      value: 45e4,
      stage: "Won",
      probability: 100,
      expectedCloseDate: "2026-08-01",
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name,
      notes: "Contract executed. \u20B92,00,000 advance received."
    });
    await Deal.create({
      title: "Enterprise ERP Maintenance",
      customerId: custVikram._id,
      customerName: custVikram.company,
      value: 5e5,
      stage: "Won",
      probability: 100,
      expectedCloseDate: "2026-07-10",
      assignedTo: userPriya._id,
      assignedUserName: userPriya.name,
      notes: "Annual renewal successful."
    });
    await Deal.create({
      title: "Fashion Store Web App",
      customerId: custSneha._id,
      customerName: custSneha.company,
      value: 22e4,
      stage: "Won",
      probability: 100,
      expectedCloseDate: "2026-07-28",
      assignedTo: userArun._id,
      assignedUserName: userArun.name,
      notes: "Final payment cleared upon deployment."
    });
    await Deal.create({
      title: "E-commerce Website - ABC Tech",
      leadId: leadRahul._id,
      leadName: `${leadRahul.name} (${leadRahul.company})`,
      value: 2e5,
      stage: "Qualified",
      probability: 60,
      expectedCloseDate: "2026-08-30",
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name,
      notes: "Requirement confirmed. Preparing formal proposal."
    });
    await Deal.create({
      title: "Hospital Management System",
      leadId: leadSuresh._id,
      leadName: `${leadSuresh.name} (${leadSuresh.company})`,
      value: 25e4,
      stage: "Negotiation",
      probability: 80,
      expectedCloseDate: "2026-08-28",
      assignedTo: userPriya._id,
      assignedUserName: userPriya.name,
      notes: "Reviewing discount clause with management."
    });
    await Deal.create({
      title: "FinTech Dashboard & Analytics",
      leadId: leadKarthik._id,
      leadName: `${leadKarthik.name} (${leadKarthik.company})`,
      value: 15e4,
      stage: "Proposal",
      probability: 50,
      expectedCloseDate: "2026-09-05",
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name,
      notes: "Technical specification sent for review."
    });
    await Deal.create({
      title: "Logistics Fleet & CRM ERP",
      leadId: leadArun._id,
      leadName: `${leadArun.name} (${leadArun.company})`,
      value: 3e5,
      stage: "Qualified",
      probability: 70,
      expectedCloseDate: "2026-09-10",
      assignedTo: userArun._id,
      assignedUserName: userArun.name,
      notes: "Tech architecture meeting completed."
    });
    await Activity.create({
      leadId: leadRahul._id,
      leadName: leadRahul.name,
      type: "Call",
      title: "Introductory Discovery Call",
      description: "Discussed website requirements, catalog size (~500 products), and preferred Razorpay/Stripe gateways.",
      performedBy: userAdmin._id,
      performedByName: userAdmin.name,
      timestamp: /* @__PURE__ */ new Date("2026-08-21T11:00:00.000Z"),
      outcome: "Requirement understood. Client has realistic budget."
    });
    await Activity.create({
      leadId: leadRahul._id,
      leadName: leadRahul.name,
      type: "StatusChange",
      title: "Lead Qualified",
      description: "Status changed from Contacted to Qualified after confirming requirements & budget of \u20B92,00,000.",
      performedBy: userAdmin._id,
      performedByName: userAdmin.name,
      timestamp: /* @__PURE__ */ new Date("2026-08-24T14:15:00.000Z")
    });
    await Activity.create({
      leadId: leadSuresh._id,
      leadName: leadSuresh.name,
      type: "Meeting",
      title: "Executive Proposal Presentation",
      description: "Presented system architecture demo with hospital OPD & billing workflows.",
      performedBy: userPriya._id,
      performedByName: userPriya.name,
      timestamp: /* @__PURE__ */ new Date("2026-08-23T15:00:00.000Z"),
      outcome: "Client impressed. Moved to negotiation stage."
    });
    await Activity.create({
      leadId: leadKarthik._id,
      leadName: leadKarthik.name,
      type: "Email",
      title: "Quotation & Scope Sent",
      description: "Sent detailed PDF breakdown for \u20B91,50,000 fixed price milestone plan.",
      performedBy: userAdmin._id,
      performedByName: userAdmin.name,
      timestamp: /* @__PURE__ */ new Date("2026-08-24T10:00:00.000Z")
    });
    await Activity.create({
      customerId: custRohit._id,
      customerName: custRohit.company,
      type: "Meeting",
      title: "Kickoff Sprint Planning",
      description: "Finalized database schema and UI wireframes for customer portal.",
      performedBy: userAdmin._id,
      performedByName: userAdmin.name,
      timestamp: /* @__PURE__ */ new Date("2026-08-10T14:00:00.000Z")
    });
    await Task.create({
      leadId: leadRahul._id,
      leadName: leadRahul.name,
      title: "Send formal quotation for E-commerce Website",
      description: "Prepare detailed module scope and pricing breakdown (\u20B92L) for Rahul.",
      dueDate: "2026-08-26",
      dueTime: "11:00 AM",
      priority: "High",
      status: "Pending",
      type: "FollowUp",
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name
    });
    await Task.create({
      leadId: leadSuresh._id,
      leadName: leadSuresh.name,
      title: "Final pricing negotiation call",
      description: "Call Dr. Suresh regarding 5% discount approval and SLA agreement.",
      dueDate: "2026-08-27",
      dueTime: "03:30 PM",
      priority: "High",
      status: "Pending",
      type: "Call",
      assignedTo: userPriya._id,
      assignedUserName: userPriya.name
    });
    await Task.create({
      leadId: leadPriya._id,
      leadName: leadPriya.name,
      title: "Follow-up on mobile app wireframe questions",
      description: "Check if Priya reviewed the sample boutique app UI sketches.",
      dueDate: "2026-08-28",
      dueTime: "02:00 PM",
      priority: "Medium",
      status: "Pending",
      type: "FollowUp",
      assignedTo: userPriya._id,
      assignedUserName: userPriya.name
    });
    await Task.create({
      leadId: leadArun._id,
      leadName: leadArun.name,
      title: "Schedule technical deep-dive meeting",
      description: "Coordinate with lead developer for logistics API discussion.",
      dueDate: "2026-08-29",
      dueTime: "10:30 AM",
      priority: "Medium",
      status: "Pending",
      type: "Meeting",
      assignedTo: userArun._id,
      assignedUserName: userArun.name
    });
    await Task.create({
      customerId: custRohit._id,
      customerName: custRohit.company,
      title: "Client Sprint review & feedback checkpoint",
      description: "Review checkout flow demo with Rohit Singhania.",
      dueDate: "2026-08-30",
      dueTime: "04:00 PM",
      priority: "High",
      status: "Pending",
      type: "Meeting",
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name
    });
    await Notification.create({
      userId: userAdmin._id,
      title: "New Lead Assigned: Deepak Sharma",
      message: "A new web lead for Dealership Website has been logged.",
      type: "lead",
      read: false
    });
    await Notification.create({
      userId: userAdmin._id,
      title: "Upcoming Follow-up: Rahul Kumar",
      message: "Quotation delivery scheduled for Rahul Kumar (ABC Technologies).",
      type: "task",
      read: false
    });
    await Notification.create({
      userId: userArun._id,
      title: "Deal Won: Ajay Verma",
      message: "Verma Real Estate accepted proposal (\u20B93,00,000)! Ready to convert to customer.",
      type: "deal",
      read: false
    });
    console.log("[MongoDB] Database seeding completed successfully!");
  } catch (error) {
    console.error("[MongoDB] Error during database seeding:", error);
  }
}
async function convertLeadToCustomer(leadId, currentUserId) {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    throw new Error("Lead not found");
  }
  if (lead.isConverted && lead.customerId) {
    const existingCust = await Customer.findById(lead.customerId);
    if (existingCust) {
      return { customer: existingCust.toJSON(), lead: lead.toJSON() };
    }
  }
  const assignedUser = await User.findById(lead.assignedTo);
  const now = /* @__PURE__ */ new Date();
  const newCustomer = await Customer.create({
    leadId: lead._id,
    name: lead.name,
    company: lead.company || lead.name,
    email: lead.email,
    phone: lead.phone,
    status: "Active",
    assignedTo: lead.assignedTo,
    assignedUserName: assignedUser?.name || lead.assignedUserName || "Sales Team",
    totalValue: lead.estimatedValue,
    convertedAt: now,
    notes: `Converted from Lead: ${lead.interest}. Notes: ${lead.notes}`,
    industry: "Enterprise Technology"
  });
  lead.status = "Converted";
  lead.isConverted = true;
  lead.customerId = newCustomer._id;
  await lead.save();
  const updatedDeals = await Deal.find({ leadId: lead._id });
  if (updatedDeals.length > 0) {
    await Deal.updateMany(
      { leadId: lead._id },
      {
        $set: {
          customerId: newCustomer._id,
          customerName: newCustomer.company,
          stage: "Won",
          probability: 100
        }
      }
    );
  } else if (lead.estimatedValue > 0) {
    await Deal.create({
      title: `${lead.interest} - Contract`,
      customerId: newCustomer._id,
      customerName: newCustomer.company,
      leadId: lead._id,
      leadName: lead.name,
      value: lead.estimatedValue,
      stage: "Won",
      probability: 100,
      expectedCloseDate: now.toISOString().split("T")[0],
      assignedTo: lead.assignedTo,
      assignedUserName: lead.assignedUserName,
      notes: "Deal closed upon lead conversion."
    });
  }
  await Activity.updateMany(
    { leadId: lead._id },
    {
      $set: {
        customerId: newCustomer._id,
        customerName: newCustomer.company
      }
    }
  );
  await Task.updateMany(
    { leadId: lead._id },
    {
      $set: {
        customerId: newCustomer._id,
        customerName: newCustomer.company
      }
    }
  );
  const performer = await User.findById(currentUserId);
  await Activity.create({
    leadId: lead._id,
    leadName: lead.name,
    customerId: newCustomer._id,
    customerName: newCustomer.company,
    type: "StatusChange",
    title: "Converted to Customer \u{1F389}",
    description: `Lead ${lead.name} (${lead.company}) successfully closed and converted to Customer with value \u20B9${lead.estimatedValue.toLocaleString("en-IN")}.`,
    performedBy: performer ? performer._id : lead.assignedTo,
    performedByName: performer ? performer.name : "Sales Team",
    timestamp: now
  });
  await Notification.create({
    userId: lead.assignedTo,
    title: `\u{1F389} Deal Won & Converted: ${lead.name}`,
    message: `${lead.name} has been officially converted into a Customer! Total Value: \u20B9${lead.estimatedValue.toLocaleString("en-IN")}`,
    type: "conversion",
    read: false
  });
  return {
    customer: newCustomer.toJSON(),
    lead: lead.toJSON()
  };
}
async function getDashboardStats() {
  const [leads, customers, deals, tasks] = await Promise.all([
    Lead.find({}).lean(),
    Customer.find({}).lean(),
    Deal.find({}).lean(),
    Task.find({}).lean()
  ]);
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(
    (l) => ["Qualified", "Proposal", "Negotiation", "Won", "Converted"].includes(l.status)
  ).length;
  const activeDeals = deals.filter((d) => ["Qualified", "Proposal", "Negotiation"].includes(d.stage)).length;
  const wonDeals = deals.filter((d) => d.stage === "Won").length;
  const lostDeals = deals.filter((d) => d.stage === "Lost").length;
  const totalRevenue = deals.filter((d) => d.stage === "Won").reduce((sum, d) => sum + (d.value || 0), 0);
  const pendingFollowups = tasks.filter((t) => t.status === "Pending").length;
  const pipelineValue = leads.filter((l) => l.status !== "Lost").reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  const wonAndConvertedCount = leads.filter((l) => l.status === "Won" || l.status === "Converted").length;
  const leadConversionRate = totalLeads > 0 ? Math.round(wonAndConvertedCount / totalLeads * 100) : 0;
  const stages = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost", "Converted"];
  const pipelineStages = stages.map((st) => {
    const matching = leads.filter((l) => l.status === st);
    return {
      stage: st,
      count: matching.length,
      value: matching.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)
    };
  });
  return {
    totalLeads,
    qualifiedLeads,
    customers: customers.length,
    activeDeals,
    wonDeals,
    lostDeals,
    totalRevenue,
    pendingFollowups,
    pipelineValue,
    leadConversionRate,
    pipelineStages
  };
}
async function getAnalytics() {
  const [leads, deals, users] = await Promise.all([
    Lead.find({}).lean(),
    Deal.find({}).lean(),
    User.find({}).lean()
  ]);
  const sourceCounts = {};
  leads.forEach((l) => {
    const src = l.source || "Other";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });
  const bySource = Object.entries(sourceCounts).map(([source, count]) => ({ source, count }));
  const dealStagesList = ["Qualified", "Proposal", "Negotiation", "Won", "Lost"];
  const byStage = dealStagesList.map((st) => {
    const matching = deals.filter((d) => d.stage === st);
    return {
      stage: st,
      count: matching.length,
      value: matching.reduce((sum, d) => sum + (d.value || 0), 0)
    };
  });
  const wonDeals = deals.filter((d) => d.stage === "Won");
  const lostDeals = deals.filter((d) => d.stage === "Lost");
  const activeDeals = deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost");
  const totalRevenue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const expectedRevenue = activeDeals.reduce((sum, d) => sum + (d.value || 0) * (d.probability || 50) / 100, 0);
  const monthlyRevenue = [
    { month: "May 2026", revenue: 38e4, dealsCount: 2 },
    { month: "Jun 2026", revenue: 45e4, dealsCount: 3 },
    { month: "Jul 2026", revenue: 72e4, dealsCount: 4 },
    { month: "Aug 2026", revenue: totalRevenue, dealsCount: wonDeals.length }
  ];
  const employeeStats = users.map((u) => {
    const uIdStr = u._id.toString();
    const assignedLeads = leads.filter((l) => l.assignedTo?.toString() === uIdStr);
    const userDeals = deals.filter((d) => d.assignedTo?.toString() === uIdStr);
    const userWon = userDeals.filter((d) => d.stage === "Won");
    const userLost = userDeals.filter((d) => d.stage === "Lost");
    const userQualified = assignedLeads.filter((l) => ["Qualified", "Proposal", "Negotiation", "Won", "Converted"].includes(l.status));
    const revenue = userWon.reduce((sum, d) => sum + (d.value || 0), 0);
    return {
      userId: uIdStr,
      userName: u.name,
      avatar: u.avatar,
      leadsAssigned: assignedLeads.length,
      qualifiedLeads: userQualified.length,
      dealsWon: userWon.length,
      dealsLost: userLost.length,
      revenueGenerated: revenue
    };
  }).sort((a, b) => b.revenueGenerated - a.revenueGenerated);
  const wonCount = leads.filter((l) => l.status === "Won" || l.status === "Converted").length;
  return {
    leadStats: {
      total: leads.length,
      new: leads.filter((l) => l.status === "New").length,
      qualified: leads.filter((l) => ["Qualified", "Proposal", "Negotiation", "Won", "Converted"].includes(l.status)).length,
      won: leads.filter((l) => l.status === "Won").length,
      lost: leads.filter((l) => l.status === "Lost").length,
      converted: leads.filter((l) => l.status === "Converted").length,
      conversionRate: leads.length > 0 ? Math.round(wonCount / leads.length * 100) : 0,
      bySource
    },
    dealStats: {
      total: deals.length,
      won: wonDeals.length,
      lost: lostDeals.length,
      active: activeDeals.length,
      totalRevenue,
      expectedRevenue: Math.round(expectedRevenue),
      byStage,
      monthlyRevenue
    },
    employeeStats
  };
}

// server/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var JWT_SECRET = process.env.JWT_SECRET || "crm-mern-production-secret-key-2026";
function generateToken(user) {
  return import_jsonwebtoken.default.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.headers["x-auth-token"]) {
      token = req.headers["x-auth-token"];
    }
    if (!token) {
      const fallbackId = req.headers["x-user-id"];
      if (fallbackId) {
        const fallbackUser = await User.findById(fallbackId);
        if (fallbackUser) {
          req.user = fallbackUser;
          return next();
        }
      }
      return res.status(401).json({ error: "Authentication required. Missing token." });
    }
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Invalid token. User not found." });
    }
    if (user.status === "inactive") {
      return res.status(403).json({ error: "User account is inactive." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired authentication token." });
  }
}
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Requires one of [${allowedRoles.join(", ")}] role` });
    }
    next();
  };
}

// server.ts
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = process.env.PORT || 3e3;
  await connectToDatabase();
  app.use(import_express.default.json());
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      console.log(`[MongoDB API] ${req.method} ${req.path}`);
    }
    next();
  });
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      database: "MongoDB (Mongoose)",
      time: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.post("/api/seed/reset", async (req, res) => {
    try {
      await seedDatabaseIfEmpty(true);
      res.json({ message: "MongoDB database reset to initial walkthrough seed data successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, role, phone, department, avatar } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
      }
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ error: "User with this email already exists" });
      }
      const user = await User.create({
        name,
        email,
        password,
        role: role || "sales",
        phone: phone || "",
        department: department || "Sales",
        avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
      });
      const token = generateToken(user);
      res.status(201).json({
        token,
        user: user.toJSON()
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      if (user.status === "inactive") {
        return res.status(403).json({ error: "Account is inactive. Please contact administrator." });
      }
      const token = generateToken(user);
      res.json({
        token,
        user: user.toJSON()
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/auth/switch-user", async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const token = generateToken(user);
      res.json({
        token,
        user: user.toJSON()
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/auth/me", authMiddleware, (req, res) => {
    res.json(req.user?.toJSON());
  });
  app.get("/api/users", async (req, res) => {
    try {
      const users = await User.find({}).sort({ createdAt: 1 });
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/users", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const { name, email, password, role, phone, department, avatar } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
      }
      const user = await User.create({
        name,
        email,
        password: password || "password123",
        role: role || "sales",
        status: "active",
        phone: phone || "",
        department: department || "Sales",
        avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
      });
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.patch("/api/users/:id/status", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const { status, role } = req.body;
      const updates = {};
      if (status) updates.status = status;
      if (role) updates.role = role;
      const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await Lead.find({}).sort({ createdAt: -1 });
      res.json(leads);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/leads/:id", async (req, res) => {
    try {
      const lead = await Lead.findById(req.params.id);
      if (!lead) return res.status(404).json({ error: "Lead not found" });
      res.json(lead);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/leads", authMiddleware, async (req, res) => {
    try {
      const currentUserId = req.user?._id;
      const { name, email, phone, company, source, interest, status, priority, estimatedValue, assignedTo, notes } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Lead name is required" });
      }
      const assignedUserId = assignedTo || currentUserId;
      const assignedUser = await User.findById(assignedUserId);
      const newLead = await Lead.create({
        name,
        email: email || "",
        phone: phone || "",
        company: company || "",
        source: source || "Website",
        interest: interest || "General Inquiry",
        status: status || "New",
        priority: priority || "Medium",
        estimatedValue: Number(estimatedValue) || 0,
        assignedTo: assignedUserId,
        assignedUserName: assignedUser ? assignedUser.name : "Unassigned",
        notes: notes || "",
        isConverted: false
      });
      if (newLead.estimatedValue > 0) {
        const dealStage = newLead.status === "Won" ? "Won" : newLead.status === "Negotiation" ? "Negotiation" : newLead.status === "Proposal" ? "Proposal" : "Qualified";
        await Deal.create({
          title: `${newLead.interest} - ${newLead.company || newLead.name}`,
          leadId: newLead._id,
          leadName: `${newLead.name} (${newLead.company || "Individual"})`,
          value: newLead.estimatedValue,
          stage: dealStage,
          probability: dealStage === "Won" ? 100 : dealStage === "Negotiation" ? 80 : dealStage === "Proposal" ? 50 : 30,
          expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
          assignedTo: newLead.assignedTo,
          assignedUserName: newLead.assignedUserName,
          notes: `Auto-linked deal created for lead ${newLead.name}`
        });
      }
      await Activity.create({
        leadId: newLead._id,
        leadName: newLead.name,
        type: "Note",
        title: "Lead Created",
        description: `New lead added with source: ${newLead.source}, estimated value: \u20B9${newLead.estimatedValue.toLocaleString("en-IN")}`,
        performedBy: currentUserId,
        performedByName: req.user?.name || "Sales Team",
        timestamp: /* @__PURE__ */ new Date()
      });
      await Notification.create({
        userId: newLead.assignedTo,
        title: `New Lead Assigned: ${newLead.name}`,
        message: `You were assigned lead "${newLead.name}" (${newLead.company}) for ${newLead.interest}.`,
        type: "lead",
        read: false
      });
      res.status(201).json(newLead);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/leads/:id", authMiddleware, async (req, res) => {
    try {
      const oldLead = await Lead.findById(req.params.id);
      if (!oldLead) return res.status(404).json({ error: "Lead not found" });
      const updates = { ...req.body };
      if (updates.assignedTo && updates.assignedTo !== oldLead.assignedTo.toString()) {
        const assignedUser = await User.findById(updates.assignedTo);
        if (assignedUser) {
          updates.assignedUserName = assignedUser.name;
        }
      }
      const updatedLead = await Lead.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (updates.status && updates.status !== oldLead.status) {
        await Activity.create({
          leadId: updatedLead._id,
          leadName: updatedLead.name,
          type: "StatusChange",
          title: `Status Changed to ${updates.status}`,
          description: `Lead moved from "${oldLead.status}" to "${updates.status}".`,
          performedBy: req.user?._id || updatedLead.assignedTo,
          performedByName: req.user?.name || "Sales Team",
          timestamp: /* @__PURE__ */ new Date()
        });
        const dealStage = updates.status === "Won" ? "Won" : updates.status === "Lost" ? "Lost" : updates.status === "Negotiation" ? "Negotiation" : updates.status === "Proposal" ? "Proposal" : updates.status === "Qualified" ? "Qualified" : null;
        if (dealStage) {
          await Deal.updateMany(
            { leadId: updatedLead._id },
            {
              $set: {
                stage: dealStage,
                probability: dealStage === "Won" ? 100 : dealStage === "Lost" ? 0 : dealStage === "Negotiation" ? 80 : dealStage === "Proposal" ? 50 : 30
              }
            }
          );
        }
      }
      res.json(updatedLead);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.patch("/api/leads/:id/status", authMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: "Status is required" });
      const oldLead = await Lead.findById(req.params.id);
      if (!oldLead) return res.status(404).json({ error: "Lead not found" });
      const updatedLead = await Lead.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      await Activity.create({
        leadId: updatedLead._id,
        leadName: updatedLead.name,
        type: "StatusChange",
        title: `Pipeline Stage: ${status}`,
        description: `Lead moved from "${oldLead.status}" to "${status}".`,
        performedBy: req.user?._id || updatedLead.assignedTo,
        performedByName: req.user?.name || "Sales Team",
        timestamp: /* @__PURE__ */ new Date()
      });
      if (["Won", "Lost", "Negotiation", "Proposal", "Qualified"].includes(status)) {
        await Deal.updateMany(
          { leadId: updatedLead._id },
          {
            $set: {
              stage: status,
              probability: status === "Won" ? 100 : status === "Lost" ? 0 : status === "Negotiation" ? 80 : status === "Proposal" ? 50 : 30
            }
          }
        );
      }
      res.json(updatedLead);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/leads/:id/convert", authMiddleware, async (req, res) => {
    try {
      const currentUserId = req.user?._id?.toString() || "";
      const result = await convertLeadToCustomer(req.params.id, currentUserId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.delete("/api/leads/:id", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const deleted = await Lead.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Lead not found" });
      res.json({ message: "Lead deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await Customer.find({}).sort({ convertedAt: -1, createdAt: -1 });
      res.json(customers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) return res.status(404).json({ error: "Customer not found" });
      res.json(customer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/customers", authMiddleware, async (req, res) => {
    try {
      const { name, company, email, phone, status, assignedTo, totalValue, notes, address, industry } = req.body;
      if (!name) return res.status(400).json({ error: "Customer name is required" });
      const assignedUserId = assignedTo || req.user?._id;
      const assignedUser = await User.findById(assignedUserId);
      const newCustomer = await Customer.create({
        name,
        company: company || name,
        email: email || "",
        phone: phone || "",
        status: status || "Active",
        assignedTo: assignedUserId,
        assignedUserName: assignedUser ? assignedUser.name : "Sales Team",
        totalValue: Number(totalValue) || 0,
        notes: notes || "",
        address: address || "",
        industry: industry || "Technology",
        convertedAt: /* @__PURE__ */ new Date()
      });
      res.status(201).json(newCustomer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/customers/:id", authMiddleware, async (req, res) => {
    try {
      const updates = { ...req.body };
      if (updates.assignedTo) {
        const assignedUser = await User.findById(updates.assignedTo);
        if (assignedUser) updates.assignedUserName = assignedUser.name;
      }
      const updated = await Customer.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!updated) return res.status(404).json({ error: "Customer not found" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/deals", async (req, res) => {
    try {
      const deals = await Deal.find({}).sort({ createdAt: -1 });
      res.json(deals);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/deals", authMiddleware, async (req, res) => {
    try {
      const { title, customerId, leadId, value, stage, probability, expectedCloseDate, assignedTo, notes } = req.body;
      if (!title) return res.status(400).json({ error: "Deal title is required" });
      let leadName = "";
      let customerName = "";
      if (leadId) {
        const l = await Lead.findById(leadId);
        if (l) leadName = l.name;
      }
      if (customerId) {
        const c = await Customer.findById(customerId);
        if (c) customerName = c.company || c.name;
      }
      const assignedUserId = assignedTo || req.user?._id;
      const assignedUser = await User.findById(assignedUserId);
      const dealStage = stage || "Qualified";
      const prob = probability !== void 0 ? Number(probability) : dealStage === "Won" ? 100 : dealStage === "Lost" ? 0 : dealStage === "Negotiation" ? 80 : dealStage === "Proposal" ? 50 : 30;
      const newDeal = await Deal.create({
        title,
        customerId: customerId || null,
        customerName,
        leadId: leadId || null,
        leadName,
        value: Number(value) || 0,
        stage: dealStage,
        probability: prob,
        expectedCloseDate: expectedCloseDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        assignedTo: assignedUserId,
        assignedUserName: assignedUser ? assignedUser.name : "Sales Team",
        notes: notes || ""
      });
      res.status(201).json(newDeal);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/deals/:id", authMiddleware, async (req, res) => {
    try {
      const updates = { ...req.body };
      if (updates.assignedTo) {
        const assignedUser = await User.findById(updates.assignedTo);
        if (assignedUser) updates.assignedUserName = assignedUser.name;
      }
      if (updates.stage) {
        if (updates.stage === "Won") updates.probability = 100;
        else if (updates.stage === "Lost") updates.probability = 0;
      }
      const updated = await Deal.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!updated) return res.status(404).json({ error: "Deal not found" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.patch("/api/deals/:id/stage", authMiddleware, async (req, res) => {
    try {
      const { stage } = req.body;
      const probability = stage === "Won" ? 100 : stage === "Lost" ? 0 : stage === "Negotiation" ? 80 : stage === "Proposal" ? 50 : 30;
      const updated = await Deal.findByIdAndUpdate(req.params.id, { stage, probability }, { new: true });
      if (!updated) return res.status(404).json({ error: "Deal not found" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/deals/:id", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const deleted = await Deal.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Deal not found" });
      res.json({ message: "Deal deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/activities", async (req, res) => {
    try {
      const { leadId, customerId, type } = req.query;
      const filter = {};
      if (leadId) filter.leadId = leadId;
      if (customerId) filter.customerId = customerId;
      if (type) filter.type = type;
      const activities = await Activity.find(filter).sort({ timestamp: -1, createdAt: -1 });
      res.json(activities);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/activities", authMiddleware, async (req, res) => {
    try {
      const { leadId, customerId, dealId, type, title, description, outcome, timestamp } = req.body;
      if (!title || !type) {
        return res.status(400).json({ error: "Title and type are required" });
      }
      let leadName = "";
      let customerName = "";
      if (leadId) {
        const l = await Lead.findById(leadId);
        if (l) leadName = l.name;
      }
      if (customerId) {
        const c = await Customer.findById(customerId);
        if (c) customerName = c.company || c.name;
      }
      const performer = req.user;
      const act = await Activity.create({
        leadId: leadId || null,
        leadName,
        customerId: customerId || null,
        customerName,
        dealId: dealId || null,
        type,
        title,
        description: description || "",
        outcome: outcome || "",
        performedBy: performer?._id,
        performedByName: performer?.name || "Sales Team",
        timestamp: timestamp ? new Date(timestamp) : /* @__PURE__ */ new Date()
      });
      res.status(201).json(act);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await Task.find({}).sort({ status: 1, dueDate: 1 });
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/tasks", authMiddleware, async (req, res) => {
    try {
      const { leadId, customerId, dealId, title, description, dueDate, dueTime, priority, type, assignedTo } = req.body;
      if (!title || !dueDate) {
        return res.status(400).json({ error: "Title and due date are required" });
      }
      let leadName = "";
      let customerName = "";
      if (leadId) {
        const l = await Lead.findById(leadId);
        if (l) leadName = l.name;
      }
      if (customerId) {
        const c = await Customer.findById(customerId);
        if (c) customerName = c.company || c.name;
      }
      const assignedUserId = assignedTo || req.user?._id;
      const assignedUser = await User.findById(assignedUserId);
      const newTask = await Task.create({
        leadId: leadId || null,
        leadName,
        customerId: customerId || null,
        customerName,
        dealId: dealId || null,
        title,
        description: description || "",
        dueDate,
        dueTime: dueTime || "10:00 AM",
        priority: priority || "Medium",
        status: "Pending",
        type: type || "FollowUp",
        assignedTo: assignedUserId,
        assignedUserName: assignedUser ? assignedUser.name : "Sales Team"
      });
      res.status(201).json(newTask);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.patch("/api/tasks/:id/toggle", authMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      const updates = { status: status || "Completed" };
      if (status === "Completed") {
        updates.completedAt = /* @__PURE__ */ new Date();
      } else {
        updates.completedAt = null;
      }
      const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!task) return res.status(404).json({ error: "Task not found" });
      res.json(task);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/tasks/:id", authMiddleware, async (req, res) => {
    try {
      const updates = { ...req.body };
      if (updates.assignedTo) {
        const assignedUser = await User.findById(updates.assignedTo);
        if (assignedUser) updates.assignedUserName = assignedUser.name;
      }
      const updated = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!updated) return res.status(404).json({ error: "Task not found" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/tasks/:id", authMiddleware, async (req, res) => {
    try {
      const deleted = await Task.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Task not found" });
      res.json({ message: "Task deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/notifications", authMiddleware, async (req, res) => {
    try {
      const targetUserId = (typeof req.query.userId === "string" ? req.query.userId : null) || (req.user?._id ? req.user._id.toString() : null);
      const filter = {};
      if (targetUserId) {
        filter.userId = targetUserId;
      }
      const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(20);
      res.json(notifications);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.patch("/api/notifications/:id/read", authMiddleware, async (req, res) => {
    try {
      await Notification.findByIdAndUpdate(req.params.id, { read: true });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/notifications/read-all", authMiddleware, async (req, res) => {
    try {
      const userId = req.body.userId || req.user?._id;
      await Notification.updateMany({ userId }, { $set: { read: true } });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await getDashboardStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await getAnalytics();
      res.json(analytics);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  const hasDist = require("fs").existsSync(import_path.default.join(process.cwd(), "dist", "index.html"));
  const isProduction = process.env.NODE_ENV === "production" || !!process.env.RENDER || !!process.env.RAILWAY_ENVIRONMENT || hasDist;
  if (!isProduction) {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CRM MERN Application running on http://localhost:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start CRM server:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
