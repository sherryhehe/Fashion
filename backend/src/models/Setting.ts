import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  value: any;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  { key: { type: String, required: true, unique: true }, value: { type: Schema.Types.Mixed } },
  { timestamps: true }
);

export default mongoose.model<ISetting>('Setting', SettingSchema);
