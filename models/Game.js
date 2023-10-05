import mongoose from "mongoose";

// Defining Schema
const gameSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    color_list: { type: [String], required: true },
    day_status: { type: String, required: true },
    winning_result:{ type: String, required: false },
})

// Model
const GameModel = mongoose.model("game-list", gameSchema)

export default GameModel