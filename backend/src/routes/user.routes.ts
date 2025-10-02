import { Router } from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  // listAppointment,
  cancelAppointment,
  makeComplain,
  getAllDoctors,
  getComplains,
  getDoctorData,
  getUserAppointments,
  // myAppointments
} from "../controllers/user.controller";
import authUser from "../middleware/authUser.middleware";
import { upload } from "../middleware/multer.middleware";

const userRouter: Router = Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/get-profile", authUser, getProfile);
userRouter.put("/update-profile", upload.single("avatar"), authUser, updateProfile);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/my-appointments", authUser, getUserAppointments);
userRouter.get('/appointments', authUser, getUserAppointments);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.post("/make-complain", authUser, makeComplain);
userRouter.get("/all-doctors", getAllDoctors);
userRouter.get("/get-complains", authUser, getComplains);


userRouter.get("/doctor/:id", getDoctorData);

export default userRouter;
