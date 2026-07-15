import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  alternateMobile?: string;
  email: string;
  houseNo: string;
  street: string;
  landmark?: string;
  area: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: 'Home' | 'Office' | 'Other';
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema: Schema<IAddress> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    alternateMobile: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    houseNo: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    area: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'India' },
    addressType: { type: String, enum: ['Home', 'Office', 'Other'], default: 'Home' },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

AddressSchema.index({ user: 1 });

const Address: Model<IAddress> = mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema);

export default Address;
