import express from "express";
const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";

app.use(cors({ origin: process.env.CORS_URI, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes
import userRouter from "./routes/user.routes.js";

//router declaration
app.use("/api/v1/users", userRouter);

// http://localhost:4000/api/v1/users/register
export default app;
// export { app }; will use this when an app exports multiple things and had to import accordingly
