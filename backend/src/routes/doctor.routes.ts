import { Router } from "express";
import {
  doctorList,
  // changeAvailability,
  getDoctorById,
  loginDoctor,
  updateDoctorAvailability,
  getDoctorAvailability
} from "../controllers/doctor.controller";
import authDoctor
 from "../middleware/authDoctor.middleware";
const doctorRouter: Router = Router();

doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/list", doctorList);
doctorRouter.post("/update-availability", authDoctor, updateDoctorAvailability);
doctorRouter.get("/get-availability", authDoctor, getDoctorAvailability);
doctorRouter.get("/:doctorId", authDoctor, getDoctorById);


export default doctorRouter;
