import express from "express";
import authRoutes from "./routes/authRoutes.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import cookieParser from "cookie-parser";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// Load dotenv
dotenv.config();

const app = express();
const ip = "192.168.100.23";
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
//Parent Router auth
app.use(express.static("./public"));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);

// middlewarenya
app.use(notFound);
app.use(errorHandler);

//Connect to MongoDB
try {
  await mongoose.connect(process.env.MONGODB);
  console.log("Connected to MongoDB");
} catch (error) {
  console.log("Error connecting to MongoDB");
}

//Ini Server Running
app.listen(3011, ip, () => {
  console.log("Server is running on port 3011");
});
