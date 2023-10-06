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
                user_id: userID,
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
            const { authorization } = req.headers;
            const token = authorization.split(' ')[1];
            const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const {  sort, search } = req.query;
            const page = parseInt(req.query.page) || 1; // Get the page number from the request query
            const perPage = parseInt(req.query.perPage / 2) || 10; // Set the number of items per page
            const withdrawQuery = {
                user_id: userID,
                ...(search && { user_id: { $regex: search, $options: 'i' } }),
            };
            const withdrawCount = await WalletWithDrawModel.countDocuments(withdrawQuery);
            const withdrawData = await WalletWithDrawModel.find(withdrawQuery)
                .sort(sort)
                .skip((page - 1) * perPage)
                .limit(Number(perPage));
            const addWalletQuery = {
                user_id: userID,
                ...(search && { user_id: { $regex: search, $options: 'i' } }),
            };
            const addWalletCount = await WalletAddModel.countDocuments(addWalletQuery);
            const addWalletData = await WalletAddModel.find(addWalletQuery)
                .sort(sort)
                .skip((page - 1) * perPage)
                .limit(Number(perPage));
            const combinedData = [...withdrawData, ...addWalletData];
            const totalPage = Math.ceil((withdrawCount + addWalletCount) / perPage);
            const hasNextPage = page < totalPage;
            res.status(200).send({
                status: 'success',
                message: 'Withdraw History found successfully',
                data:
                {
                    data: combinedData,
                    currentPage: Number(page),
                    totalPage,
                    hasNextPage,
                }
            });
        } catch (error) {
            res.status(500).send({
                status: 'error',
                message: 'Error retrieving withdrawal history',
                error: error.message,
            });
        }
    };





}

export default WalletController