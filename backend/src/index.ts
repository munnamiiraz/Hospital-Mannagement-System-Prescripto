import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import doctorRoutes from './routes/doctor.routes';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 9000;

// Middleware
app.use(cors({
  origin: process.env.HOST_URL || "*"
}));

app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// app.use(cookieParser())

// Routes
app.use("/api/admin", adminRoutes)
app.use("/api/doctor", doctorRoutes)
app.use("/api/user", userRoutes)

// Error handling
app.use(notFound);
app.use(errorHandler);

// Connect to database and start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer().catch(console.error);
