import mongoose from "mongoose";

// Defining Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    // email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    Refer_code: { type: String, required: false },
    role: { type: String, required: true },
    otp: { type: String, required: true },
    otpValidUpto: { type: String, required: true },
    otpVerifyStatus: { type: String, required: true },
    is_admin: { type: Boolean, required: true },
    is_active: { type: Boolean, required: true }
})

// Model
const UserModel = mongoose.model("user", userSchema)

export default UserModel