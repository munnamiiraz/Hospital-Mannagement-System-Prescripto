import { Request, Response } from "express";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { Types, Document } from "mongoose";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

import Doctor from "../models/doctor.model";
import Appointment from "../models/appointment.model"
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponce";
import {Complain} from "../models/complain.model";
// import { AuthRequest } from "./user.controller";

// import { Request } from 'express';
// import { Types } from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    _id?: string | Types.ObjectId;
    id?: string;
    userId?: string;
  };
  admin?: {
    _id?: string | Types.ObjectId;
    id?: string;
    userId?: string;
  };
}

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

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
  available?: boolean;
  slots_booked?: Record<string, string[]>;
}

interface IAvailableSlot {
  date: string; 
  time: string; 
}

interface IAppointment extends Document {
  _id: Types.ObjectId;
  userId: string | Types.ObjectId;
  docId: string | Types.ObjectId;
  userData: UserData;
  docData: Omit<DoctorData, 'available' | 'slots_booked'>;
  amount: number;
  slotTime: string;
  slotDate: string;
  date: number;
  canceled?: boolean;
}

interface AddDoctorRequest {
  name: string;
  email: string;
  about: string;
  password: string;
  speciality: string;
  degree: string;
  experience: string;
  fees: string | number;
  address: string;
}

interface LoginAdminRequest {
  email: string;
  password: string;
}

interface ChangeAvailabilityRequest {
  docId: string;
}

interface DoctorAddress {
  address: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

interface DoctorDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  image: string;
  password: string;
  speciality: string;
  degree: string;
  experience: string;
  fees: number;
  about: string;
  address: DoctorAddress;
  available: boolean;
  date: number;
  slots_booked?: Record<string, string[]>;
}

interface IBookedSlot {
  date: string;
  time: string;
  patientId: string;
  patientName: string;
}


interface DoctorResponse {
  _id: string;
  name: string;
  email: string;
  image: string;
  speciality: string;
  degree: string;
  experience: string;
  fees: number;
  about: string;
  address: DoctorAddress;
  available: boolean;
  date: number;
  slots_booked?: Record<string, string[]>;
}

interface AdminJWTPayload {
  email: string;
}

export const getReqUserId = (req: AuthRequest): string | null => {
  if (!req) return null;

  const actor = req.user ?? req.admin;
  if (!actor) return null;

  const possibleId = actor._id ?? actor.id ?? actor.userId ?? null;
  if (!possibleId) return null;

  return String(possibleId);
};


 //validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return mongoose.isValidObjectId(id);
};

 // handle unknown errors safely
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred';
};

 //get JWT secret safely
const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return secret;
};

// to get admin credentials safely
const getAdminCredentials = (): { email: string; password: string } => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  
  if (!email || !password) {
    throw new Error('Admin credentials are not properly configured');
  }
  
  return { email, password };
};


 // validate and convert fees
const validateFees = (fees: string | number): number => {
  const numericFees = typeof fees === 'string' ? parseFloat(fees) : fees;
  
  if (isNaN(numericFees) || numericFees <= 0) {
    throw new Error('Fees must be a valid positive number');
  }
  
  return numericFees;
};

//   Add Doctor
const addDoctors = async (req: MulterRequest, res: Response): Promise<Response> => {
  try {
    const { 
      name, 
      email, 
      about, 
      password, 
      speciality, 
      degree, 
      experience, 
      fees, 
      address 
    }: AddDoctorRequest = req.body;

    if (!name || !email || !about || !password || !speciality || !degree || !experience || !fees || !address) {
      return res.json(new ApiError(400, "All form fields must be filled up"));
    }

    // Validation 
    if (!validator.isEmail(email)) {
      return res.json(new ApiError(400, "Enter a valid email"));
    }

    if (password.length < 8) {
      return res.json(new ApiError(400, "Enter a strong password (min 8 chars)"));
    }

    const existingDoctor = await Doctor.findOne({ email }).lean<DoctorDocument>();
    if (existingDoctor) {
      return res.json(new ApiError(400, "Doctor with this email already exists"));
    }

    // Validate and convert fees
    let validatedFees: number;
    try {
      validatedFees = validateFees(fees);
    } catch (error) {
      return res.json(new ApiError(400, getErrorMessage(error)));
    }

    // Hash 
    const salt: string = await bcrypt.genSalt(10);
    const hashedPassword: string = await bcrypt.hash(password, salt);

    // Validate and upload image
    if (!req.file) {
      return res.status(400).json(new ApiError(400, "Doctor image is required"));
    }

    let imageUrl: string;
    try {
      console.log("Uploading file from path:", req.file.path);
      const uploadResult = await uploadToCloudinary(req.file.path);
      if (!uploadResult || !uploadResult.url) {
        throw new Error("Failed to get upload URL");
      }
      imageUrl = uploadResult.url;
      console.log("Upload successful. URL:", imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      return res.status(500).json(new ApiError(500, "Error uploading doctor image. Details: " + (error instanceof Error ? error.message : "Unknown error")));
    }

    // Create doctor data
    const doctorData = {
      name: name.trim(),
      email: email.trim(),
      image: imageUrl,
      password: hashedPassword,
      speciality: speciality.trim(),
      degree: degree.trim(),
      fees: validatedFees,
      about: about.trim(),
      experience: experience.trim(),
      address: address,
      available: true,
      date: Date.now(),
    };

    // Save doctor to database
    const newDoctor = new Doctor(doctorData);
    await newDoctor.save();

    // Remove password from response
    const doctorResponse = newDoctor.toObject();
    delete doctorResponse.password;

    return res.json(
      new ApiResponse(
        201, 
        {
          ...doctorResponse,
          _id: String(doctorResponse._id)
        }, 
        "Doctor added successfully"
      )
    );
  } catch (error: unknown) {
    console.error("addDoctors error:", error);
    const errorMessage = getErrorMessage(error);
    return res.json(new ApiError(500, "Internal server error on addDoctors API: " + errorMessage));
  }
};

//   Admin Login
const loginAdmin = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password }: LoginAdminRequest = req.body;

    if (!email || !password) {
      return res.json(new ApiError(400, "Email and password are required"));
    }

    if (!validator.isEmail(email)) {
      return res.json(new ApiError(400, "Enter a valid email"));
    }

    // Get admin credentials
    let adminCredentials: { email: string; password: string };
    try {
      adminCredentials = getAdminCredentials();
    } catch (error) {
      console.error("Admin credentials error:", error);
      return res.json(new ApiError(500, "Server configuration error"));
    }

    // Verify credentials
    if (email === adminCredentials.email && password === adminCredentials.password) {
      const token: string = jwt.sign(
        { email } as AdminJWTPayload, 
        getJWTSecret(),
        { expiresIn: '24h' } // have to relogin after 24h
      );
      
      return res.json(
        new ApiResponse(
          200, 
          { 
            token, 
            expiresIn: '24h',
            user: { email, role: 'admin' }
          }, 
          "Admin login successful"
        )
      );
    } else {
      return res.json(new ApiError(401, "Invalid credentials"));
    }
  } catch (error: unknown) {
    console.error("loginAdmin error:", error);
    const errorMessage = getErrorMessage(error);
    return res.json(new ApiError(500, "Internal server error on loginAdmin API: " + errorMessage));
  }
};

const complainFeedback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { complaintId, adminResponse } = req.body;

    // Basic validation
    if (!complaintId || !adminResponse || !adminResponse.toString().trim()) {
      res.status(400).json(new ApiError(400, "complaintId and adminResponse are required") || {
        success: false,
        message: "complaintId and adminResponse are required"
      });
      return;
    }

    if (!Types.ObjectId.isValid(complaintId)) {
      res.status(400).json(new ApiError(400, "Invalid complaint ID") || {
        success: false,
        message: "Invalid complaint ID"
      });
      return;
    }

    // Find and update the complaint's feedback
    const updated = await Complain.findByIdAndUpdate(
      complaintId,
      {
        feedback: adminResponse,
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!updated) {
      res.status(404).json(new ApiError(404, "Complaint not found") || {
        success: false,
        message: "Complaint not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Feedback saved",
      data: updated
    });
  } catch (err: any) {
    console.error("sendComplaintFeedback error:", err);
    res.status(500).json(new ApiError(500, "Failed to save feedback") || {
      success: false,
      message: "Failed to save feedback",
      error: err?.message || err
    });
  }
};

//   Get All Doctors
const allDoctors = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const doctors = await Doctor.find({})
      .select("-password")
      .sort({ date: -1 })
      .lean<DoctorDocument[]>();

    // Transform response to ensure consistent _id format
    const transformedDoctors: DoctorResponse[] = doctors.map((doctor) => ({
      ...doctor,
      _id: String(doctor._id)
    }));

    return res.json(
      new ApiResponse(
        200, 
        transformedDoctors, 
        `Successfully fetched ${transformedDoctors.length} doctor(s)`
      )
    );
  } catch (error: unknown) {
    console.error("allDoctors error:", error);
    const errorMessage = getErrorMessage(error);
    return res.json(new ApiError(500, "Error fetching doctors: " + errorMessage));
  }
};

//   Change Doctor Availability
const changeAvailability = async (
  req: Request,
  res: Response
  ): Promise<Response> => {
  try {
    const { docId, available } = req.body as { docId?: string; available?: boolean };


    if (!docId) {
      return res.status(400).json({ success: false, message: "Doctor ID is required" });
    }


    if (!Types.ObjectId.isValid(docId)) {
      return res.status(400).json({ success: false, message: "Invalid Doctor ID" });
    }

    const doctor = await Doctor.findByIdAndUpdate(docId, { available }, { new: true }).lean();


    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }


    return res.status(200).json({
      success: true,
      message: `Doctor is now ${available ? "available" : "unavailable"}`,
      data: doctor,
    });
  } catch (error: any) {
    console.error("Error updating availability:", error);
    return res.status(500).json({ success: false, message: error?.message || "Failed to update availability" });
  }
};

//   Delete Doctor - not implemented in the frontend, sorry fot that
const deleteDoctor = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { docId } = req.params;

    if (!docId || !isValidObjectId(docId)) {
      return res.json(new ApiError(400, "Valid docId is required"));
    }

    const deletedDoctor = await Doctor.findByIdAndDelete(docId).select("-password");

    if (!deletedDoctor) {
      return res.json(new ApiError(404, "Doctor not found"));
    }

    return res.json(
      new ApiResponse(200, null, "Doctor deleted successfully")
    );
  } catch (error: unknown) {
    console.error("deleteDoctor error:", error);
    const errorMessage = getErrorMessage(error);
    return res.json(new ApiError(500, "Error deleting doctor: " + errorMessage));
  }
};

const cancelAppointment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      res.status(400).json(new ApiError(400, "Appointment ID is required"));
      return;
    }

    if (!Types.ObjectId.isValid(appointmentId)) {
      res.status(400).json(new ApiError(400, "Invalid appointment ID"));
      return;
    }

    // find the appointment
    const appointment = await Appointment.findById(appointmentId) as IAppointment | null;
    if (!appointment) {
      res.status(404).json(new ApiError(404, "Appointment not found"));
      return;
    }

    // capture slot info before deleting appointment
    const slotDate = (appointment as any).slotDate as string;
    const slotTime = (appointment as any).slotTime as string;
    const doctorId = (appointment as any).docId as Types.ObjectId | string;
    const patientId = appointment.userId ? String(appointment.userId) : undefined;

    // delete the appointment record
    await Appointment.findByIdAndDelete(appointmentId);

    // update doctor's slots: remove from slots_booked and add back to slots_available
    if (Types.ObjectId.isValid(String(doctorId))) {
      const doctor = await Doctor.findById(doctorId);
      if (doctor) {
        let changed = false;

        // find index of booked slot that matches date,time and patientId
        const bookedIdx = (doctor.slots_booked || []).findIndex((s: IBookedSlot) => {
          const sameDate = s.date === slotDate;
          const sameTime = s.time === slotTime;
          const samePatient = patientId ? String(s.patientId) === patientId : true;
          return sameDate && sameTime && samePatient;
        });

        if (bookedIdx !== -1) {
          // remove from booked
          const [removed] = doctor.slots_booked.splice(bookedIdx, 1);
          changed = true;

          // only add back to available if not already present
          const alreadyAvailable = (doctor.slots_available || []).some((a: IAvailableSlot) => {
            return a.date === removed.date && a.time === removed.time;
          });

          if (!alreadyAvailable) {
            doctor.slots_available = doctor.slots_available || [];
            doctor.slots_available.push({ date: removed.date, time: removed.time });
          }
        } else {
          // booked slot not found (maybe already removed). Still ensure available has the slot
          const alreadyAvailable = (doctor.slots_available || []).some((a: IAvailableSlot) => {
            return a.date === slotDate && a.time === slotTime;
          });

          if (!alreadyAvailable) {
            doctor.slots_available = doctor.slots_available || [];
            doctor.slots_available.push({ date: slotDate, time: slotTime });
            changed = true;
          }
        }

        if (changed) {
          await doctor.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Appointment cancelled and slot returned to available slots",
      data: {
        appointmentId,
        slotDate,
        slotTime,
      },
    });
  } catch (error: any) {
    console.error("Error cancelling appointment (admin):", error);
    res.status(500).json(new ApiError(500, "Failed to cancel appointment"));
  }
};


const allComplains = async (req: Request, res: Response): Promise<void> => {
  try {

    const complains = await Complain.find();

    res.status(200).json(new ApiResponse(200, complains, "Complains fetched successfully"));
  } catch (error: unknown) {
    console.error("makeComplain error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json(new ApiError(500, "Error in makeComplain: " + errorMessage));
  }
};


const allDoctorsAppointment = async (req: Request, res: Response): Promise<void> => {
  try {

    const appointments = await Appointment.find()
      .sort({ date: -1 })
      .lean() as IAppointment[];
    
    res.status(200).json(new ApiResponse(200, appointments, "Got appointment data"));
  } catch (error: unknown) {
    console.error("listAppointment error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json(new ApiError(500, "Error in listAppointment: " + errorMessage));
  }
};

export { 
  addDoctors, 
  loginAdmin, 
  allDoctors, 
  changeAvailability,
  deleteDoctor,
  allDoctorsAppointment,
  cancelAppointment,
  allComplains,
  complainFeedback
};

// Export types for use in other files
export type {
  MulterRequest,
  AddDoctorRequest,
  LoginAdminRequest,
  ChangeAvailabilityRequest,
  DoctorAddress,
  DoctorDocument,
  DoctorResponse,
  AdminJWTPayload
};