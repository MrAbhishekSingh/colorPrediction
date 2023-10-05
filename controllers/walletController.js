import UserModel from "../models/User.js";
import { WalletAddModel, WalletWithDrawModel } from "../models/Wallet.js";

import jwt from 'jsonwebtoken'

class WalletController {
    static addAmount = async (req, res) => {
        try {
            const { transaction_id, amount, isPhonepay } = req.body;
            const { authorization } = req.headers
            const token = authorization.split(' ')[1]
            const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY)
            const user = await UserModel.findById(userID);
            if (!user) {
                return res.status(404).send({
                    "status": "error",
                    "message": "user not found"
                });
            }
            const doc = new WalletAddModel({
                user_id: user._id,
                transaction_id: transaction_id,
                amount: amount,
                isPhonepay: isPhonepay,
                createAt: new Date(),
                status: "1",
            })
            await doc.save()

            res.status(200).send({
                "status": "success",
                "message": "Amount added successfully",
            });
        } catch (error) {
            res.status(500).send({
                "status": "error",
                "message": "Error adding amount",
                "error": error.message
            });
        }
    }

    static withdrawAmount = async (req, res) => {
        try {
            const { phone, amount, upi_mode } = req.body;
            const { authorization } = req.headers
            const token = authorization.split(' ')[1]
            const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY)
            const user = await UserModel.findById(userID);
            if (!user) {
                return res.status(404).send({
                    "status": "error",
                    "message": "user not found"
                });
            }
            const doc = new WalletWithDrawModel({
                amount: amount,
                phone: phone,
                upi_mode: upi_mode,
                status: "2",
                transaction_id: null,
                createAt: new Date()
            })
            await doc.save()

            res.status(200).send({
                "status": "success",
                "message": "Amount withdraw successfully",
            });
        } catch (error) {
            res.status(500).send({
                "status": "error",
                "message": "Error withdraw amount",
                "error": error.message
            });
        }
    }
     static withdrawHistory = async (req, res) => {
        try {
            const { phone, amount, upi_mode } = req.body;
            const { authorization } = req.headers
            const token = authorization.split(' ')[1]
            const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY)
            const user = await UserModel.findById(userID);
            if (!user) {
                return res.status(404).send({
                    "status": "error",
                    "message": "user not found"
                });
            }
            const doc = new WalletWithDrawModel({
                amount: amount,
                phone: phone,
                upi_mode: upi_mode,
                status: "2",
                transaction_id: null,
                createAt: new Date()
            })
            await doc.save()

            res.status(200).send({
                "status": "success",
                "message": "Amount withdraw successfully",
            });
        } catch (error) {
            res.status(500).send({
                "status": "error",
                "message": "Error withdraw amount",
                "error": error.message
            });
        }
    }


}

export default WalletController