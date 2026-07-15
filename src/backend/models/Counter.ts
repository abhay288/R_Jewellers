import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICounter extends Document<string> {
  _id: string; // The name of the sequence, e.g., 'orderId'
  seq: number;
}

const CounterSchema: Schema<ICounter> = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
  }
);

const Counter: Model<ICounter> = mongoose.models.Counter || mongoose.model<ICounter>('Counter', CounterSchema);

export default Counter;
