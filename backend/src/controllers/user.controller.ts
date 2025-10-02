import { Request, Response } from "express";
import Doctor from "../models/doctor.model";
import Appointment from "../models/appointment.model";
import { User } from "../models/user.model";
import { ApiResponse } from "../utils/ApiResponce";
import { ApiError } from "../utils/ApiError";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { uploadToCloudinary } from "../utils/upload";
import { Types, Document } from "mongoose";
import {Complain} from "../models/complain.model";

// Define proper interfaces for your models
interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  image?: string;
  address?: string;
  dob?: string;
  gender?: string;
}

interface IDoctor extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  image: string;
  degree: string;
  speciality: string;
  experience: string;
  about: string;
  fees: number;
  available?: boolean;
  address?: string;
  slots_available?: { date: string; time: string }[];
  slots_booked?: { date: string; time: string }[];
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
interface IBookedSlot {
  date: string;
  time: string;
  patientId: string;
  patientName: string;
}

// Type definitions for better type safety
interface AuthRequest extends Request {
  user?: {
    _id: string | Types.ObjectId;
    id?: string | Types.ObjectId;
  };
}

interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginUserRequest {
  email: string;
  password: string;
}

interface UpdateProfileRequest {
  userId?: string;
  name: string;
  phone: string;
  address: string;
  dob: string;
  gender: string;
}


interface BookAppointmentRequest {
  doctorId: string;
  slotDate: string;
  slotTime: string;
}


interface makeComplain{
  user: Types.ObjectId | IUser
  content: string;
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

interface AppointmentData {
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

interface JWTPayload {
  _id: string;
}

// helper
const getReqUserId = (req: AuthRequest): string | null => {
  if (!req.user) return null;
  const user = req.user;
  return user._id ? String(user._id) : String(user.id || "");
};

//   Register User
const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password }: RegisterUserRequest = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400).json(new ApiError(400, "All form fields must be filled up"));
      return;
    }
    if (!validator.isEmail(email)) {
      res.status(400).json(new ApiError(400, "Enter a valid email"));
      return;
    }
    if (password.length < 8) {
      res.status(400).json(new ApiError(400, "Enter a strong password (min 8 chars)"));
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ email }).lean() as IUser | null;
    if (existingUser) {
      res.status(400).json(new ApiError(400, "User already exists"));
      return;
    }

    // Hash password
    const salt: string = await bcrypt.genSalt(10);
    const hashedPassword: string = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save() as IUser;

    // Generate JWT token
    const token: string = jwt.sign(
      { _id: String(savedUser._id) } as JWTPayload, 
      process.env.JWT_SECRET as string
    );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          token,
          user: { 
            name: savedUser.name, 
            email: savedUser.email, 
            _id: String(savedUser._id) 
          },
        },
        "User registered successfully"
      )
    );
  } catch (error: unknown) {
    console.error("Register error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json(new ApiError(500, "Failed to register user: " + errorMessage));
  }
};

//   Login User
const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginUserRequest = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json(new ApiError(400, "Email and password are required"));
      return;
    }

    // Find user
    const user = await User.findOne({ email }).select('+password') as IUser | null;
    if (!user) {
      res.status(404).json(new ApiError(404, "User does not exist"));
      return;
    }

    // Verify password
    const isMatched: boolean = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      res.status(401).json(new ApiError(401, "Invalid credentials"));
      return;
    }

    // Generate JWT token
    const token: string = jwt.sign(
      { _id: String(user._id) } as JWTPayload, 
      process.env.JWT_SECRET as string
    );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          token,
          user: { 
            name: user.name, 
            email: user.email, 
            _id: String(user._id) 
          },
        },
        "User logged in successfully"
      )
    );
  } catch (error: unknown) {
    console.error("Login error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json(new ApiError(500, "Failed to login user: " + errorMessage));
  }
};

//   Get Profile
const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId: string | null = getReqUserId(req);
    if (!userId) {
      res.status(401).json(new ApiError(401, "Unauthorized"));
      return;
    }

    const userData = await User.findById(userId)
      .select("-password")
      .lean() as Omit<IUser, "password"> | null;

    if (!userData) {
      res.status(404).json(new ApiError(404, "User not found"));
      return;
    }

    res.status(200).json(new ApiResponse(200, userData, "Profile loaded successfully"));
  } catch (error: unknown) {
    console.error("getProfile error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json(new ApiError(500, "Internal Server Error: " + errorMessage));
  }
};


//   Update Profile
const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId: string | null = getReqUserId(req) || req.body.userId;
    if (!userId) {
      res.status(401).json(new ApiError(401, "Unauthorized"));
      return;
    }

    const { name, phone, address, dob, gender }: UpdateProfileRequest = req.body;
    
    if (!name || !phone || !dob || !gender) {
      res.status(400).json(new ApiError(400, "Data missing"));
      return;
    }

    let avatarData;
    if (req.file) {
      try {
        // Upload to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "users",
          width: 500,
          height: 500,
          crop: "fill",
        });

        avatarData = {
          url: result.secure_url,
          publicId: result.public_id
        };
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new ApiError(500, "Error uploading image");
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone, address, dob, gender, ...(avatarData && { avatar: avatarData }) },
      { new: true, select: "-password" }
    );

    res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
  } catch (error: unknown) {
    console.error("updateProfile error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json(new ApiError(500, "Error in updateProfile: " + errorMessage));
  }
};


//   Book Appointment
export const bookAppointment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = getReqUserId(req);
    const { doctorId, slotDate, slotTime } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!doctorId || !slotDate || !slotTime) {
      res.status(400).json({ success: false, message: "doctorId, slotDate and slotTime are required" });
      return;
    }

    if (!Types.ObjectId.isValid(doctorId)) {
      res.status(400).json({ success: false, message: "Invalid doctorId" });
      return;
    }

    // fetch doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor not found" });
      return;
    }

    const user = await User.findById(userId).select("name email phone");
    
    const patientName = user?.name || "Unknown";
    const patientEmail = user?.email || "";
    const patientPhone = user?.phone || "";

    // Remove past slots from slots_available
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    doctor.slots_available = (doctor.slots_available || []).filter((slot: any) => {
      if (!slot || !slot.date || !slot.time) return false;
      if (slot.date < currentDate) return false; // past date
      if (slot.date === currentDate && slot.time <= currentTime) return false; // same day but time passed
      return true;
    });

    // Find the clicked slot inside cleaned available slots
    const idx = (doctor.slots_available || []).findIndex(
      (s: any) => s.date === slotDate && s.time === slotTime
    );

    if (idx === -1) {
      // not available (already taken or removed as past)
      await doctor.save(); // save removed past slots
      res.status(400).json({ success: false, message: "Selected slot not available" });
      return;
    }

    // remove from available, add to booked
    const [movedSlot] = doctor.slots_available.splice(idx, 1); // removes
    const bookedEntry = {
      date: movedSlot.date,
      time: movedSlot.time,
      patientId: String(userId),
      patientName,
      patientEmail,
      patientPhone,
      bookedAt: new Date(),
      status: "confirmed",
    };

    const appointmentData: AppointmentData = {
      userId: String(userId),
      docId: String(doctorId),
      slotDate,
      slotTime,
      userData: {
        _id: String(user?._id || userId),
        name: patientName,
        email: patientEmail,
        phone: patientPhone,
      },
      docData: {
        _id: String(doctor._id),
        name: doctor.name,
        image: doctor.image,
        speciality: doctor.speciality,
        degree: doctor.degree,
        experience: doctor.experience,
        fees: doctor.fees,
      },
      amount: doctor.fees,
      date: Date.now(),
      canceled: false,
    };
    const newAppointment = new Appointment(appointmentData);
    await newAppointment.save();

    doctor.slots_booked = doctor.slots_booked || [];
    doctor.slots_booked.push(bookedEntry);



    // Save doctor doc with updated arrays
    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Slot booked and moved to booked slots",
      data: { bookedEntry },
    });
  } catch (err: any) {
    console.error("bookAppointmentSimple error:", err);
    // if it's a mongoose validation error
    if (err.name === "ValidationError" && err.errors) {
      console.error("Validation details:", Object.values(err.errors).map((e: any) => e.message));
    }
    res.status(500).json({ success: false, message: "Failed to book slot", error: err?.message || err });
  }
};

export const getUserAppointments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = getReqUserId(req);
    
    if (!userId) {
      res.status(401).json(new ApiError(401, "Unauthorized"));
      return;
    }

    if (!Types.ObjectId.isValid(userId)) {
      res.status(400).json(new ApiError(400, "Invalid user ID"));
      return;
    }

    // Fetch all appointments for the user
    const appointments = await Appointment.find({ 
      userId: new Types.ObjectId(userId) 
    })
      .sort({ date: -1, slotDate: -1 })
      .lean();

    // Transform the data
    const formattedAppointments = appointments.map(apt => ({
      _id: apt._id,
      docId: apt.docId,
      slotDate: apt.slotDate,
      slotTime: apt.slotTime,
      canceled: apt.canceled,
      payment: apt.payment,
      isCompleted: apt.isCompleted,
      createdAt: apt.createdAt,
      doctor: {
        _id: apt.docData._id,
        name: apt.docData.name,
        image: apt.docData.image,
        speciality: apt.docData.speciality,
        degree: apt.docData.degree,
        experience: apt.docData.experience,
        fees: apt.docData.fees,
        address: apt.docData.address || ''
      }
    }));

    res.status(200).json({
      success: true,
      count: formattedAppointments.length,
      data: formattedAppointments,
    });
  } catch (error: any) {
    console.error("Error fetching user appointments:", error);
    res.status(500).json(new ApiError(500, "Failed to fetch appointments"));
  }
};


//   List Appointments
const listAppointment = async (
  req: AuthRequest, 
  res: Response
): Promise<void> => {
  return getUserAppointments(req, res);
};

//   Cancel Appointment
export const cancelAppointment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = getReqUserId(req);
    const { appointmentId } = req.body;

    if (!userId) {
      res.status(401).json(new ApiError(401, "Unauthorized"));
      return;
    }

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

    // ensure the appointment belongs to this user
    if (appointment.userId.toString() !== String(userId)) {
      res.status(403).json(new ApiError(403, "Not allowed to cancel this appointment"));
      return;
    }

    // caught slot info before deleting appointment
    const slotDate = (appointment as any).slotDate as string;
    const slotTime = (appointment as any).slotTime as string;
    const doctorId = (appointment as any).docId as Types.ObjectId | string;

    await Appointment.findByIdAndDelete(appointmentId);

    // update doctor's slots: remove from slots_booked and add back to slots_available
    if (Types.ObjectId.isValid(String(doctorId))) {
      const doctor = await Doctor.findById(doctorId);
      if (doctor) {
        // find index of booked slot that matches date,time and patientId
        const bookedIdx = (doctor.slots_booked || []).findIndex((s: IBookedSlot) => {
          return s.date === slotDate && s.time === slotTime && String(s.patientId) === String(userId);
        });

        if (bookedIdx !== -1) {
          // remove from booked
          const [removed] = doctor.slots_booked.splice(bookedIdx, 1);

          // only add back to available if not already present
          const alreadyAvailable = (doctor.slots_available || []).some((a: IAvailableSlot) => {
            return a.date === removed.date && a.time === removed.time;
          });

          if (!alreadyAvailable) {
            doctor.slots_available = doctor.slots_available || [];
            // push the plain slot object (date + time)
            doctor.slots_available.push({ date: removed.date, time: removed.time });
          }

          await doctor.save();
        } else {
          // booked slot not found (maybe already removed). Still ensure available has the slot
          const alreadyAvailable = (doctor.slots_available || []).some((a: IAvailableSlot) => {
            return a.date === slotDate && a.time === slotTime;
          });

          if (!alreadyAvailable) {
            doctor.slots_available = doctor.slots_available || [];
            doctor.slots_available.push({ date: slotDate, time: slotTime });
            await doctor.save();
          }
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
    console.error("Error cancelling appointment:", error);
    res.status(500).json(new ApiError(500, "Failed to cancel appointment"));
  }
};




// make complain
const makeComplain = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId: string | null = getReqUserId(req);
    if (!userId) {
      res.status(401).json(new ApiError(401, "Unauthorized"));
      return;
    }

    const { content }: { content: string } = req.body;
    if (!content) {
      res.status(400).json(new ApiError(400, "Content is required"));
      return;
    }

    const complainData = {
      user: userId,
      content,
    };

    console.log("Complain:", complainData);

    const newComplain = await Complain.create(complainData);
    res.status(201).json(new ApiResponse(201, newComplain, "complain sent successfully"));
  } catch (error: unknown) {
    console.error("makeComplain error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json(new ApiError(500, "Error in makeComplain: " + errorMessage));
  }
};


const getComplains = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId: string | null = getReqUserId(req);
    if (!userId) {
      res.status(401).json(new ApiError(401, "Unauthorized"));
      return;
    }

    const complains = await Complain.find({ user: userId });
    
    res.status(200).json(new ApiResponse(200, complains, "Complains fetched successfully"));
  } catch (error: unknown) {
    console.error("makeComplain error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json(new ApiError(500, "Error in makeComplain: " + errorMessage));
  }
};


const getDoctorData = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !Types.ObjectId.isValid(id)) {
      res.status(400).json(new ApiError(400, 'Invalid doctor ID'));
      return;
    }

    const doctor = await Doctor.findById(id).select("-password") as IDoctor | null;

    if (!doctor) {
      res.status(404).json(new ApiError(404, 'Doctor not found'));
      return;
    }

    // Filter out past dates and times
    const now = new Date();
    const bookedSet = new Set<string>(
      (doctor.slots_booked || []).map((s) => `${s.date}--${s.time}`)
    );

    const isSlotInPast = (dateStr: string, timeStr: string): boolean => {
      // create local datetime from parts
      const dt = new Date(`${dateStr}T${timeStr}:00`);
      return dt.getTime() <= now.getTime();
    };

    const availableSlots =
      (doctor.slots_available || []).filter((slot) => {
        const key = `${slot.date}--${slot.time}`;

        // if actively booked, skip
        if (bookedSet.has(key)) return false;

        // if in the past, skip
        if (isSlotInPast(slot.date, slot.time)) return false;

        // otherwise keep
        return true;
      }) || [];

      res.status(200).json({
      success: true,
      data: {
        _id: doctor._id.toString(),
        name: doctor.name,
        email: doctor.email,
        speciality: doctor.speciality,
        image: doctor.image,
        degree: doctor.degree,
        experience: doctor.experience,
        about: doctor.about,
        available: doctor.available,
        fees: doctor.fees,
        address: doctor.address,
        slots_available: availableSlots,
      },
      message: 'Doctor data fetched successfully',
    });

    
  } catch (error: any) {
    console.error('Error fetching doctor for appointment:', error);
    res.status(500).json(new ApiError(500, 'Failed to fetch doctor details'));
  }
};

//   Get all-doctors
const getAllDoctors = async (req: Request, res: Response): Promise<void> => {
  try {

    const doctorsData = await Doctor.find()
    res.status(200).json(new ApiResponse(200, doctorsData, "Profile loaded successfully"));
  } catch (error: unknown) {
    console.error("Get all-doctors error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json(new ApiError(500, "Internal Server Error: " + errorMessage));
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  listAppointment,
  getAllDoctors,
  makeComplain,
  getComplains,
  getDoctorData
};

export type {
  AuthRequest,
  RegisterUserRequest,
  LoginUserRequest,
  UpdateProfileRequest,
  BookAppointmentRequest,
  UserData,
  DoctorData,
  AppointmentData,
  JWTPayload,
  IUser,
  IDoctor,
  IAppointment
};