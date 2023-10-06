import mongoose from "mongoose";

// Defining Schema
const walletAddSchema = new mongoose.Schema({
    user_id: { type: String, required: true, trim: true },
    transaction_id: { type: String, required: true, trim: true },
    amount: { type: Number, default: 0 },
    isPhonepay: { type: Boolean, required: true },
    createAt: { type: String, required: true },
    status: { type: String, required: true }
})
const walletWithDrawSchema = new mongoose.Schema({
    user_id: { type: String, required: true, trim: true },
    amount: { type: Number, default: 0 },
    phone: { type: String, required: true },
    upi_mode: { type: String, required: true },
    createAt: { type: String, required: true },
    status: { type: String, required: true },
    transaction_id: { type: String, required: false }
})


// 1 = credit 2 = pending 3 = debit 4 = reject

// Model
export const WalletAddModel = mongoose.model("walletAdd", walletAddSchema);
export const WalletWithDrawModel = mongoose.model("walletWithDraw", walletWithDrawSchema);



