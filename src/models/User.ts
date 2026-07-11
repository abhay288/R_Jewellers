import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: 'user' | 'admin';
  emailVerified?: Date;
  providers?: string[]; // e.g., ['google', 'credentials']
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, select: false }, // don't return password by default
    image: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    emailVerified: { type: Date },
    providers: [{ type: String }],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Indexes for optimization
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
