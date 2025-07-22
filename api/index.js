const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRouter = require("./routes/userRouter");
const authRouter = require("./routes/authRouter");
const listingRouter = require("./routes/listingRouter");

const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();

mongoose.connect(`${process.env.MONGO}`).then(() => {
    console.log("Connected to database");
}).catch((err) => {
    console.log("Database connection error:", err);
});

console.log('MONGO env variable:', process.env.MONGO);

const currentDir = path.resolve();

const app = express();
const cors = require('cors');

app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);

app.use(express.static(path.join(currentDir, '/frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(currentDir, 'frontend', 'dist', 'index.html'));
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error('Error:', err);
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

module.exports = app;