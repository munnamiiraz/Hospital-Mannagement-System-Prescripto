import mongoose, { Document, Schema, Types } from "mongoose";

// Type definitions
interface UserData {
  _id: string | Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  image?: string;
}

interface DoctorData {
  _id: string | Types.ObjectId;
  name: string;
  image: string;
  degree: string;
  speciality: string;
  experience: string;
  fees: number;
}

interface IAppointment extends Document {
  userId: Types.ObjectId;
  docId: Types.ObjectId;
  slotDate: string;
  slotTime: string;
  userData: UserData;
  docData: DoctorData;
  amount: number;
  date: number;
  canceled: boolean;
  payment: boolean;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  docId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
  slotDate: {
    type: String,
    required: true
  },
  slotTime: {
    type: String,
    required: true
  },
  userData: {
    type: Schema.Types.Mixed,
    required: true
  },
  docData: {
    type: Schema.Types.Mixed,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Number,
    required: true
  },
  canceled: {
    type: Boolean,
    default: false
  },
  payment: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Appointment = mongoose.models.appointment || mongoose.model<IAppointment>("appointment", appointmentSchema);

export default Appointment;
export type { IAppointment, UserData, DoctorData };