import { Router } from "express";
import {
  addDoctors,
  allDoctors,
  loginAdmin,
  changeAvailability,
  allDoctorsAppointment,
  cancelAppointment,
  allComplains,
  complainFeedback

} from "../controllers/admin.controller";
import { upload } from "../middleware/multer.middleware";
import authAdmin from "../middleware/authAdmin.middleware";

const adminRouter: Router = Router();

adminRouter.put("/add-doctors", authAdmin, upload.single("image"), addDoctors);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availablity", authAdmin, changeAvailability);
adminRouter.get("/all-appointments", authAdmin, allDoctorsAppointment);
adminRouter.post("/cancel-appointment", authAdmin, cancelAppointment);
adminRouter.post("/complaint-feedback", authAdmin, complainFeedback);
adminRouter.get("/get-complains", authAdmin, allComplains);


export default adminRouter;
