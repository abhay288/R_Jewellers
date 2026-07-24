import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderProduct {
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  finalPrice: number;
  image?: string;
}

export interface IShippingAddressSnapshot {
  fullName: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  houseNo: string;
  street: string;
  landmark?: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface ITrackingTimeline {
  status: string;
  date: Date;
  note?: string;
}

export interface IOrder extends Document {
  orderId: string;
  user: mongoose.Types.ObjectId;
  products: IOrderProduct[];
  
  // Financials
  totalAmount: number;
  discount: number;
  deliveryCharges: number;
  coupon?: mongoose.Types.ObjectId;
  
  // Addresses
  shippingAddress: mongoose.Types.ObjectId;
  shippingAddressSnapshot?: IShippingAddressSnapshot;
  
  // Statuses
  status: 'Order Placed' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out For Delivery' | 'Delivered' | 'Cancelled' | 'Returned';
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  
  trackingTimeline: ITrackingTimeline[];
  returnEligibilityDate?: Date;

  // Shiprocket Shipping Details
  shipmentId?: string;
  awbNumber?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  courierName?: string;
  courierId?: string;
  pickupId?: string;
  pickupStatus?: string;
  estimatedDelivery?: Date;
  shipmentStatus?: string;
  lastTrackingUpdate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const OrderProductSchema = new Schema<IOrderProduct>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  finalPrice: { type: Number, required: true, min: 0 },
  image: { type: String },
}, { _id: false });

const ShippingAddressSnapshotSchema = new Schema<IShippingAddressSnapshot>({
  fullName: { type: String },
  phone: { type: String },
  alternatePhone: { type: String },
  email: { type: String },
  houseNo: { type: String },
  street: { type: String },
  landmark: { type: String },
  area: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  country: { type: String },
}, { _id: false });

const TrackingTimelineSchema = new Schema<ITrackingTimeline>({
  status: { type: String, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String }
}, { _id: false });

const OrderSchema: Schema<IOrder> = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: [OrderProductSchema],
    
    totalAmount: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    deliveryCharges: { type: Number, default: 0, min: 0 },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    
    shippingAddress: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
    shippingAddressSnapshot: ShippingAddressSnapshotSchema,
    
    status: { 
      type: String, 
      enum: ['Payment Pending', 'Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled', 'Returned'], 
      default: 'Order Placed' 
    },
    paymentMethod: { type: String, default: 'COD' },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'failed'], 
      default: 'pending' 
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    
    trackingTimeline: [TrackingTimelineSchema],
    returnEligibilityDate: { type: Date },

    // Shiprocket details
    shipmentId: { type: String },
    awbNumber: { type: String },
    trackingNumber: { type: String },
    trackingUrl: { type: String },
    courierName: { type: String },
    courierId: { type: String },
    pickupId: { type: String },
    pickupStatus: { type: String },
    estimatedDelivery: { type: Date },
    shipmentStatus: { type: String },
    lastTrackingUpdate: { type: Date },
  },
  {
    timestamps: true,
  }
);

// OrderSchema.index({ orderId: 1 }); // Removed due to duplicate index warning (already unique: true)
OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ awbNumber: 1 });
OrderSchema.index({ trackingNumber: 1 });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
