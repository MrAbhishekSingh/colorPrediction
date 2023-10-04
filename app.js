import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors';
import connectDb from './config/connectdb.js';
import userRoutes from './routes/userRoutes.js'

const app = express()
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

// CORS Policy
app.use(cors())

// Database Connection
connectDb(DATABASE_URL)
 
// JSON
app.use(express.json())

// Load Routes
app.use("/api/v1", userRoutes)

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})