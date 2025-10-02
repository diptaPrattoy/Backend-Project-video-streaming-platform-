// import dotenv from "dotenv";
// dotenv.config({ path: "./.env" });
import mongoose from "mongoose";
// import express from "express";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import app from "./app.js";

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("error connecting mongoDb");
            throw error;
        });

        app.listen(process.env.PORT || 8000, (req) => {
            console.log(`App is listening on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log("Error from mongodb connection", error);
    });

//1st approach
// (async () => {
//     try {
//         // console.log("Mongo URI:", process.env.MONGODB_URI);
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on("error", () => {
//             console.log("ERROR", error);
//             throw error;
//         });
//         app.listen(process.env.PORT, () => {
//             console.log(
//                 `MongoDb connected Succecfully on port ${process.env.PORT}`
//             );
//         });
//     } catch (error) {
//         console.log("Error ", error);
//         throw error;
//     }
// })();
