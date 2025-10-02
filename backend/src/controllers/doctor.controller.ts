// src/controllers/doctor.controller.ts
import {Request, Response } from "express";
import { Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import DoctorModel from "../models/doctor.model";
import { ApiResponse } from "../utils/ApiResponce";
import { ApiError } from "../utils/ApiError";
import Doctor from "../models/doctor.model";

/**
 * Local types for controller-level safety
 */
interface LoginUserRequestBody {
  email?: string;
  password?: string;
}

// interface ChangeAvailabilityBody {
//   docId?: string;
// }

interface JWTPayload {
  _id: string;
  iat?: number;
  exp?: number;
  role?: string;
  [key: string]: any;
}

interface DoctorResponseShape {
  _id: string;
  name: string;
  email: string;
  image?: string;
  speciality: string;
  degree?: string;
  experience?: string;
  about?: string;
  available: boolean;
  fees?: number;
  address?: any;
  date?: number;
  slots_booked?: any;
  createdAt?: Date;
  updatedAt?: Date;
}
interface AuthRequest extends Request {
  user?: {
    _id: string | Types.ObjectId;
    id?: string | Types.ObjectId;
  };
}

interface AvailableSlot {
  date: string;
  time: string;
}

/* ---------------------- Helpers ---------------------- */

const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return secret;
};

// const getReqUserId = (req: AuthRequest): string | null => {
//   if (!req.user) return null;
//   const user = req.user;
//   return user._id ? String(user._id) : String(user.id || "");
// };

// const isValidObjectId = (id?: string): boolean => {
//   if (!id || typeof id !== "string") return false;
//   return Types.ObjectId.isValid(id);
// };

const safeErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);



/* ---------------------- Controllers ---------------------- */

/**
 * POST /doctors/login
 */
const loginDoctor = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body as LoginUserRequestBody;

    if (!email || !password) {
      return res
        .status(400)
        .json(new ApiError(400, "Email and password are required"));
    }

    // find doctor (include password if schema hides it)
    const doctor = await DoctorModel.findOne({ email }).select("+password").lean();

    if (!doctor) {
      return res.status(404).json(new ApiError(404, "Doctor does not exist"));
    }

    // doctor.password may be undefined if .lean() removed it; fetch full doc if needed
    const fullDoc = await DoctorModel.findOne({ email }).select("+password");
    if (!fullDoc || !fullDoc.password) {
      return res.status(500).json(new ApiError(500, "Unable to verify password"));
    }

    const passwordMatches = await bcrypt.compare(password, fullDoc.password);
    if (!passwordMatches) {
      return res.status(401).json(new ApiError(401, "Invalid credentials"));
    }

    const payload: JWTPayload = { _id: String(fullDoc._id), role: "doctor" };
    const token = jwt.sign(payload, getJWTSecret(), {
      // optionally set expiresIn: '7d'
    });

    const userForResponse: Partial<DoctorResponseShape> = {
      _id: String(fullDoc._id),
      name: fullDoc.name,
      email: fullDoc.email,
      image: (fullDoc as any).image,
      speciality: (fullDoc as any).speciality,
      available: (fullDoc as any).available ?? true,
    };

    return res.status(200).json(
      new ApiResponse(200, { token, user: userForResponse }, "Doctor logged in successfully")
    );
  } catch (err: unknown) {
    console.error("loginDoctor error:", safeErrorMessage(err));
    return res
      .status(500)
      .json(new ApiError(500, "Failed to login doctor: " + safeErrorMessage(err)));
  }
};

/**
 * PATCH /doctors/availability
 * Body: { docId: string }
 */
// const changeAvailability = async (req: Request, res: Response): Promise<Response> => {
//   try {
//     const { docId } = req.body as ChangeAvailabilityBody;

//     if (!docId) {
//       return res.status(400).json(new ApiError(400, "docId is required"));
//     }
//     if (!isValidObjectId(docId)) {
//       return res.status(400).json(new ApiError(400, "Invalid docId format"));
//     }

//     const doc = await DoctorModel.findById(docId).lean();
//     if (!doc) {
//       return res.status(404).json(new ApiError(404, "Doctor not found"));
//     }

//     const updated = await DoctorModel.findByIdAndUpdate(
//       docId,
//       { available: !doc.available },
//       { new: true, runValidators: true }
//     )
//       .select("-password")
//       .lean();

//     if (!updated) {
//       return res.status(500).json(new ApiError(500, "Failed to update availability"));
//     }

//     const resp: DoctorResponseShape = {
//       ...(updated as any),
//       _id: String((updated as any)._id),
//     };

//     return res.status(200).json(
//       new ApiResponse(
//         200,
//         resp,
//         `Doctor availability changed to ${resp.available ? "available" : "unavailable"}`
//       )
//     );
//   } catch (err: unknown) {
//     console.error("changeAvailability error:", safeErrorMessage(err));
//     return res.status(500).json(new ApiError(500, safeErrorMessage(err)));
//   }
// };

/**
 * GET /doctors
 */
const doctorList = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const doctors = await DoctorModel.find({})
      .select("-password")
      .sort({ date: -1 })
      .lean();

    const transformed = (doctors || []).map((d: any) => ({
      ...d,
      _id: String(d._id),
    }));

    return res.status(200).json(
      new ApiResponse(200, transformed as DoctorResponseShape[], `Fetched ${transformed.length} doctor(s)`)
    );
  } catch (err: unknown) {
    console.error("doctorList error:", safeErrorMessage(err));
    return res.status(500).json(new ApiError(500, "Internal server error: " + safeErrorMessage(err)));
  }
};

/**
 * GET /doctors/:doctorId
 */
const getDoctorById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { doctorId } = req.params as { doctorId?: string };

    if (!doctorId) {
      return res.status(400).json(new ApiError(400, "Doctor ID is required"));
    }
    // if (!isValidObjectId(doctorId)) {
    //   return res.status(400).json(new ApiError(400, "Invalid doctor ID formatt"));
    // }

    const doctor = await DoctorModel.findById(doctorId).select("-password").lean();
    if (!doctor) {
      return res.status(404).json(new ApiError(404, "Doctor not found"));
    }

    return res.status(200).json(
      new ApiResponse(200, { ...doctor, _id: String((doctor as any)._id) }, "Doctor fetched successfully")
    );
  } catch (err: unknown) {
    console.error("getDoctorById error:", safeErrorMessage(err));
    return res.status(500).json(new ApiError(500, "Error fetching doctor: " + safeErrorMessage(err)));
  }
};

/**
 * GET /doctors/available
 */
const getAvailableDoctors = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const doctors = await DoctorModel.find({ available: true })
      .select("-password")
      .sort({ date: -1 })
      .lean();

    const transformed = (doctors || []).map((d: any) => ({ ...d, _id: String(d._id) }));

    return res.status(200).json(
      new ApiResponse(200, transformed as DoctorResponseShape[], `Fetched ${transformed.length} available doctor(s)`)
    );
  } catch (err: unknown) {
    console.error("getAvailableDoctors error:", safeErrorMessage(err));
    return res.status(500).json(new ApiError(500, "Error fetching available doctors: " + safeErrorMessage(err)));
  }
};

/**
 * GET /doctors/speciality/:speciality
 */
const getDoctorsBySpeciality = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { speciality } = req.params as { speciality?: string };

    if (!speciality) {
      return res.status(400).json(new ApiError(400, "Speciality is required"));
    }

    const doctors = await DoctorModel.find({
      speciality: { $regex: speciality, $options: "i" },
      available: true,
    })
      .select("-password")
      .sort({ date: -1 })
      .lean();

    const transformed = (doctors || []).map((d: any) => ({ ...d, _id: String(d._id) }));

    return res.status(200).json(
      new ApiResponse(
        200,
        transformed as DoctorResponseShape[],
        `Fetched ${transformed.length} doctor(s) in ${speciality}`
      )
    );
  } catch (err: unknown) {
    console.error("getDoctorsBySpeciality error:", safeErrorMessage(err));
    return res.status(500).json(new ApiError(500, "Error fetching doctors by speciality: " + safeErrorMessage(err)));
  }
};

const getDoctorAvailability = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doctorId = req.user?._id || req.user?.id;

    if (!doctorId) {
      res.status(401).json(new ApiError(401, 'Unauthorized'));
      return;
    }

    const doctor = await Doctor.findById(doctorId).select('name email slots_available');

    if (!doctor) {
      res.status(404).json(new ApiError(404, 'Doctor not found'));
      return;
    }

    res.status(200).json({
      success: true,
      slots_available: doctor.slots_available || [],
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email
      }
    });
  } catch (error: any) {
    console.error('Error fetching availability:', error);
    res.status(500).json(new ApiError(500, 'Failed to fetch availability'));
  }
};


// Update doctor availability
export const updateDoctorAvailability = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doctorId = req.user?._id || req.user?.id;
    const { slots_available } = req.body;

    if (!doctorId) {
      res.status(401).json(new ApiError(401, 'Unauthorized'));
      return;
    }

    // Validate slots_available
    if (!Array.isArray(slots_available)) {
      res.status(400).json(new ApiError(400, 'Invalid slots format'));
      return;
    }

    // Validate each slot
    for (const slot of slots_available) {
      if (!slot.date || !slot.time) {
        res.status(400).json(new ApiError(400, 'Each slot must have date and time'));
        return;
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(slot.date)) {
        res.status(400).json(new ApiError(400, 'Invalid date format. Use YYYY-MM-DD'));
        return;
      }

      // Validate time format (HH:MM)
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(slot.time)) {
        res.status(400).json(new ApiError(400, 'Invalid time format. Use HH:MM'));
        return;
      }

      // Check if date is not in the past
      const slotDate = new Date(slot.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (slotDate < today) {
        res.status(400).json(new ApiError(400, 'Cannot set availability for past dates'));
        return;
      }
    }

    // Sort slots by date and time
    const sortedSlots = slots_available.sort((a: AvailableSlot, b: AvailableSlot) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.time.localeCompare(b.time);
    });

    // Update doctor availability in database
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { slots_available: sortedSlots },
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      res.status(404).json(new ApiError(404, 'Doctor not found'));
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      slots_available: updatedDoctor.slots_available
    });
  } catch (error: any) {
    console.error('Error updating availability:', error);
    res.status(500).json(new ApiError(500, 'Failed to update availability'));
  }
};




/* ---------------------- Exports ---------------------- */
export {
  loginDoctor,
  // changeAvailability,
  doctorList,
  getDoctorById,
  getAvailableDoctors,
  getDoctorsBySpeciality,
  getDoctorAvailability,
};

/* Optionally export types if you want to reuse them in routes/tests */
export type { DoctorResponseShape };

/* EOF */
