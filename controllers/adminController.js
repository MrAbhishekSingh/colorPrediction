import UserModel from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
// import transporter from '../config/emailConfig.js'
import twilio from 'twilio'
import GameModel from '../models/Game.js'

class AdminController {
    static getUserList = async (req, res) => {
        const page = parseInt(req.query.page) || 1; // Get the page number from the request query
        const perPage = parseInt(req.query.perPage) || 10; // Set the number of items per page
        try {
            const totalUsers = await UserModel.countDocuments({ is_admin: false });
            const totalPages = Math.ceil(totalUsers / perPage);
            if (page > totalPages) {
                return res.status(404).send({
                    "status": "error",
                    "message": "Page not found"
                });
            }
            const skip = (page - 1) * perPage;
            const users = await UserModel.find({ is_admin: false })
                .skip(skip)
                .limit(perPage);

            let nextPage = null;
            if (page < totalPages) {
                nextPage = page + 1;
            }

            res.send({
                "status": "success",
                "message": "user list found",
                "data": {
                    users,
                    currentPage: page,
                    totalPages,
                    nextPage
                }
            });
        } catch (error) {
            res.status(500).send({
                "status": "error",
                "message": "Error retrieving user list",
                "error": error.message
            });
        }
    }

    static deleteUser = async (req, res) => {
        const userId = req.query.userId;
        console.log(userId);

        try {
            const user = await UserModel.findById(userId);
            console.log(user);
            if (!user) {
                return res.status(404).send({
                    "status": "error",
                    "message": "User not found"
                });
            }
            await UserModel.deleteOne({ _id: userId });
            res.send({
                "status": "success",
                "message": "User deleted successfully",
                "data": { userId }
            });
        } catch (error) {
            res.status(500).send({
                "status": "error",
                "message": "Error deleting user",
                "error": error.message
            });
        }
    }

    static toggleUserStatus = async (req, res) => {
        const userId = req.query.userId;
        const { isActive } = req.body;
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).send({
                    "status": "error",
                    "message": "User not found"
                });
            }
            await UserModel.findByIdAndUpdate(userId, {
                $set: {
                    is_active: isActive,
                }
            })
            res.send({
                "status": "success",
                "message": `User ${isActive ? 'activated' : 'deactivated'} successfully`,
                "data": { userId, isActive }
            });
        } catch (error) {
            res.status(500).send({
                "status": "error",
                "message": "Error updating user status",
                "error": error.message
            });
        }
    }

    static createGame = async (req, res) => {
        try {
            const { name, end_time, start_time, color_list } = req.body; // Replace otherFields with actual fields
            const hasDuplicates = new Set(color_list).size !== color_list.length;
            if (hasDuplicates) {
                return res.status(400).send({
                    "status": "error",
                    "message": "Duplicate colors are not allowed"
                });
            }
            const newGame = new GameModel({
                name: name,
                start_time: start_time,
                end_time: end_time,
                color_list: color_list,
                day_status: 1,
                winning_result: null
            });

            const savedGame = await newGame.save();

            res.status(201).send({
                "status": "success",
                "message": "Game created successfully",
                "data": savedGame
            });
        } catch (error) {
            res.status(500).send({
                "status": "error",
                "message": "Error creating game",
                "error": error.message
            });
        }
    }
     
    static updateGame = async (req, res) => {
        try {
            const gameId = req.query.id;
            const { name, end_time, start_time, color_list } = req.body;
            const hasDuplicates = new Set(color_list).size !== color_list.length;
            if (hasDuplicates) {
                return res.status(400).send({
                    "status": "error",
                    "message": "Duplicate colors are not allowed"
                });
            }
            const updatedGame = await GameModel.findByIdAndUpdate(gameId, {
                name: name,
                start_time: start_time,
                end_time: end_time,
                color_list: color_list,
            }, { new: true });

            if (!updatedGame) {
                return res.status(404).send({
                    "status": "error",
                    "message": "Game not found"
                });
            }

            res.status(200).send({
                "status": "success",
                "message": "Game updated successfully",
                "data": updatedGame
            });
        } catch (error) {
            res.status(500).send({
                "status": "error",
                "message": "Error updating game",
                "error": error.message
            });
        }
    }

    static deleteGame = async (req, res) => {
        try {
            const gameId = req.query.id;

            const deletedGame = await GameModel.findByIdAndDelete(gameId);

            if (!deletedGame) {
                return res.status(404).send({
                    "status": "error",
                    "message": "Game not found"
                });
            }

            res.status(200).send({
                "status": "success",
                "message": "Game deleted successfully",
                "data": gameId
            });
        } catch (error) {
            res.status(500).send({
                "status": "error",
                "message": "Error deleting game",
                "error": error.message
            });
        }
    }

    static getGameList = async (req, res) => {
        try {
            const games = await GameModel.find();
            res.status(200).send({
                "status": "success",
                "message": "Game list retrieved successfully",
                "data": games
            });
        } catch (error) {
            res.status(500).send({
                "status": "error",
                "message": "Error retrieving game list",
                "error": error.message
            });
        }
    }

}

export default AdminController