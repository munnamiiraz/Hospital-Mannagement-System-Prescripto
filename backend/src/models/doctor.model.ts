// models/doctorModel.ts
import mongoose, { Document, Schema } from "mongoose";

// Type definitions
interface DoctorAddress {
  address: string;
}

// Available slot set by doctor
interface AvailableSlot {
  date: string;
  time: string;
}

// Booked appointment by patient
interface BookedSlot {
  date: string; 
  time: string; 
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  bookedAt: Date;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

interface IDoctor extends Document {
  name: string;
  email: string;
  password: string;
  image: string;
  degree: string;
  experience: string;
  speciality: string;
  avatar?: string;
  about: string;
  available: boolean;
  fees: number;
  address: DoctorAddress;
  date: number;
  slots_available: AvailableSlot[];
  slots_booked: BookedSlot[];
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    degree: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    speciality: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    about: {
      type: String,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    fees: {
      type: Number,
      required: true,
    },
    address: {
      type: Schema.Types.Mixed,
      required: true,
    },
    date: {
      type: Number,
      required: true,
    },
    slots_available: {
      type: [
        {
          date: { type: String, required: true },
          time: { type: String, required: true },
        },
      ],
      default: [],
    },
    slots_booked: {
      type: [
        {
          date: { type: String, required: true },
          time: { type: String, required: true },
          patientId: { type: String, required: true },
          patientName: { type: String, required: true },
          patientEmail: { type: String },
          patientPhone: { type: String },
          bookedAt: { type: Date, default: Date.now },
          status: {
            type: String,
            enum: ["pending", "confirmed", "completed", "cancelled"],
            default: "pending",
          },
        },
      ],
      default: [],
    },
  },
  { minimize: false, timestamps: true }
);

const Doctor =
  mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", doctorSchema);

export default Doctor;
export type { IDoctor, DoctorAddress, AvailableSlot, BookedSlot };