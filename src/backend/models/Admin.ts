import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdmin extends Document {
  user: mongoose.Types.ObjectId; // Reference to the User model, or make this a standalone auth model?
  permissions: string[]; // e.g., ['manage_users', 'manage_products', 'view_orders']
  department?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema<IAdmin> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    permissions: [{ type: String }],
    department: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

AdminSchema.index({ user: 1 });
AdminSchema.index({ isActive: 1 });

const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
