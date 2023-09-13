import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";
// //for deployment
// import path from 'path'
// import { fileURLToPath } from "url";

//configure env
dotenv.config();

//database config
connectDB();

// //for deployment
// const __filename=fileURLToPath(import.meta.url);
// const __dirname=path.dirname(__filename);

//rest object
const app = express();

//middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
//for deployment
// app.use(express.static(path.join(__dirname, "/client/build")));

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);

//rest api
//for deployment
// app.use("*", function (req, resp) {
//   resp.sendFile(path.join(__dirname, "./client/build/index.html"));
// });

//port
const PORT = process.env.PORT || 8080;

//run listen

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
